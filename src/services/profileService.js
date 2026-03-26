const bcrypt = require('bcrypt');
const addressService = require('./addressService');
const adoptionService = require('./adoptionService');
const fosterHomeService = require('./fosterHomeService');
const houseDogService = require('./houseDogService');
const requestService = require('./requestService');
const saleInvoiceService = require('./saleInvoiceService');
const saleService = require('./saleService');
const emailRepository = require('../repositories/emailRepository');
const locationRepository = require('../repositories/locationRepository');
const phoneRepository = require('../repositories/phoneRepository');
const saleProductRepository = require('../repositories/saleProductRepository');
const userRepository = require('../repositories/userRepository');
const userService = require('./userService');

const PHONE_PATTERN = /^[0-9()+\s-]{6,20}$/;
const ACTIVE_STATE_ID = 1;

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeIdentification(value) {
    return String(value || '').trim();
}

function normalizeCatalogName(value) {
    return String(value || '')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function normalizeOptionalText(value) {
    const normalizedValue = String(value || '').trim();
    return normalizedValue || null;
}

function serializeDate(value) {
    if (!value) {
        return null;
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString();
}

function serializeDateOnly(value) {
    if (!value) {
        return null;
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(
        date.getUTCDate()
    ).padStart(2, '0')}`;
}

function roundMoney(value) {
    return Math.round(Number(value || 0) * 100) / 100;
}

function pickPreferredRecord(records) {
    const activeRecord = records.find((record) => Number(record.ID_ESTADO) === ACTIVE_STATE_ID);
    return activeRecord || records[0] || null;
}

function formatCurrentProfile({ user, email, phone }) {
    const ubicacion = [user.DISTRITO, user.CANTON, user.PROVINCIA, user.PAIS]
        .filter(Boolean)
        .join(', ');

    return {
        identificacion: normalizeIdentification(user.IDENTIFICACION),
        nombre: user.NOMBRE || null,
        apellidoPaterno: user.APELLIDO_PATERNO || null,
        apellidoMaterno: user.APELLIDO_MATERNO || null,
        usuario: user.USUARIO || null,
        correo: email?.CORREO || user.CORREO || null,
        telefono: phone?.TELEFONO || null,
        fechaRegistro: serializeDate(user.FECHA_REGISTRO),
        idEstadoUsuario: Number(user.ID_ESTADO),
        estadoUsuario: user.ESTADO_USUARIO || null,
        idEstadoCuenta:
            user.ID_ESTADO_CUENTA === null || user.ID_ESTADO_CUENTA === undefined
                ? null
                : Number(user.ID_ESTADO_CUENTA),
        estadoCuenta: user.ESTADO_CUENTA || null,
        idEstadoCorreo:
            email?.ID_ESTADO === null || email?.ID_ESTADO === undefined
                ? null
                : Number(email.ID_ESTADO),
        estadoCorreo: email?.ESTADO || null,
        direccion: user.ID_DIRECCION
            ? {
                  idDireccion: Number(user.ID_DIRECCION),
                  idPais:
                      user.ID_PAIS === null || user.ID_PAIS === undefined
                          ? null
                          : Number(user.ID_PAIS),
                  pais: user.PAIS || null,
                  idProvincia:
                      user.ID_PROVINCIA === null || user.ID_PROVINCIA === undefined
                          ? null
                          : Number(user.ID_PROVINCIA),
                  provincia: user.PROVINCIA || null,
                  idCanton:
                      user.ID_CANTON === null || user.ID_CANTON === undefined
                          ? null
                          : Number(user.ID_CANTON),
                  canton: user.CANTON || null,
                  idDistrito:
                      user.ID_DISTRITO === null || user.ID_DISTRITO === undefined
                          ? null
                          : Number(user.ID_DISTRITO),
                  distrito: user.DISTRITO || null,
                  calle: user.CALLE || null,
                  numero: user.NUMERO || null,
                  ubicacion: ubicacion || null
              }
            : null
    };
}

function formatSaleProduct(item) {
    return {
        idVenta: Number(item.ID_VENTA),
        idProducto: Number(item.ID_PRODUCTO),
        producto: item.PRODUCTO || null,
        tipoMovimiento: item.TIPO_MOVIMIENTO || null,
        cantidad: Number(item.CANTIDAD || 0),
        precioUnitario: roundMoney(item.PRECIO_UNITARIO || 0),
        total: roundMoney(item.TOTAL || 0),
        idEstado: Number(item.ID_ESTADO),
        estado: item.ESTADO || null
    };
}

async function getCurrentProfileRecord(idCuenta) {
    const account = await userRepository.findAccountByIdCuenta(idCuenta);

    if (!account) {
        throw createHttpError('Account not found', 404);
    }

    const identificacion = normalizeIdentification(account.IDENTIFICACION);
    const [user, emails, phones] = await Promise.all([
        userRepository.findUserDetailsByIdentification(identificacion),
        emailRepository.findEmailsByIdentification(identificacion),
        phoneRepository.findAllPhones()
    ]);

    if (!user) {
        throw createHttpError('User not found', 404);
    }

    const userPhones = phones.filter(
        (phone) => normalizeIdentification(phone.IDENTIFICACION) === identificacion
    );

    return {
        account,
        identificacion,
        user,
        email: pickPreferredRecord(emails),
        phone: pickPreferredRecord(userPhones)
    };
}

function buildAdoptionRequests({ identificacion, requests, adoptions }) {
    const requestsByUser = requests.filter(
        (request) =>
            normalizeIdentification(request.identificacion) === identificacion &&
            (Number(request.idTipoSolicitud) === 1 ||
                normalizeCatalogName(request.tipoSolicitud) === normalizeCatalogName('Adopcion'))
    );

    const adoptionsByRequestId = new Map(
        adoptions
            .filter((adoption) => normalizeIdentification(adoption.identificacion) === identificacion)
            .map((adoption) => [Number(adoption.idSolicitud), adoption])
    );

    return requestsByUser
        .map((request) => {
            const adoption = adoptionsByRequestId.get(Number(request.idSolicitud)) || null;

            return {
                idSolicitud: Number(request.idSolicitud),
                tipoSolicitud: request.tipoSolicitud || null,
                idEstadoSolicitud: Number(request.idEstado),
                estadoSolicitud: request.estado || null,
                idPerrito:
                    request.idPerrito !== null && request.idPerrito !== undefined
                        ? Number(request.idPerrito)
                        : adoption?.idPerrito || null,
                nombrePerrito: request.nombrePerrito || adoption?.nombrePerrito || null,
                idAdopcion: adoption?.idAdopcion || null,
                idEstadoProceso: adoption?.idEstado || null,
                estadoProceso: adoption?.estado || null,
                fechaAdopcion: adoption?.fechaAdopcion || null
            };
        })
        .sort((left, right) => right.idSolicitud - left.idSolicitud);
}

async function buildPurchases({ identificacion, sales, saleInvoices }) {
    const userSales = sales
        .filter((sale) => normalizeIdentification(sale.identificacion) === identificacion)
        .sort((left, right) => {
            const leftDate = new Date(left.fechaVenta || 0).getTime();
            const rightDate = new Date(right.fechaVenta || 0).getTime();
            return rightDate - leftDate;
        });

    const itemsBySaleId = new Map(
        await Promise.all(
            userSales.map(async (sale) => [
                Number(sale.idVenta),
                (await saleProductRepository.findSaleProductsBySaleId(sale.idVenta)).map(formatSaleProduct)
            ])
        )
    );

    const invoicesBySaleId = saleInvoices.reduce((accumulator, saleInvoice) => {
        const key = Number(saleInvoice.idVenta);
        const currentInvoices = accumulator.get(key) || [];
        currentInvoices.push({
            idFactura: saleInvoice.idFactura,
            idEstado: Number(saleInvoice.idEstado),
            estado: saleInvoice.estado || null,
            moneda: saleInvoice.moneda || null,
            simbolo: saleInvoice.simbolo || null,
            totalFactura: roundMoney(saleInvoice.totalFactura || 0),
            fechaFactura: saleInvoice.fechaFactura || null
        });
        accumulator.set(key, currentInvoices);
        return accumulator;
    }, new Map());

    return userSales.map((sale) => ({
        idVenta: Number(sale.idVenta),
        totalVenta: roundMoney(sale.totalVenta || 0),
        fechaVenta: serializeDate(sale.fechaVenta),
        idEstado: Number(sale.idEstado),
        estado: sale.estado || null,
        items: itemsBySaleId.get(Number(sale.idVenta)) || [],
        facturas: invoicesBySaleId.get(Number(sale.idVenta)) || []
    }));
}

function buildFosterHomes({ identificacion, fosterHomes, houseDogs }) {
    const activeHouseDogsByHomeId = houseDogs.reduce((accumulator, houseDog) => {
        if (Number(houseDog.idEstado) !== ACTIVE_STATE_ID) {
            return accumulator;
        }

        const currentDogs = accumulator.get(Number(houseDog.idCasaCuna)) || [];
        currentDogs.push({
            idPerrito: Number(houseDog.idPerrito),
            nombrePerrito: houseDog.nombrePerrito || null,
            idEstado: Number(houseDog.idEstado),
            estado: houseDog.estado || null
        });
        accumulator.set(Number(houseDog.idCasaCuna), currentDogs);
        return accumulator;
    }, new Map());

    return fosterHomes
        .filter((fosterHome) => normalizeIdentification(fosterHome.identificacion) === identificacion)
        .map((fosterHome) => ({
            idCasaCuna: Number(fosterHome.idCasaCuna),
            nombre: fosterHome.nombre || null,
            ubicacion: fosterHome.ubicacion || null,
            calle: fosterHome.calle || null,
            numero: fosterHome.numero || null,
            distrito: fosterHome.distrito || null,
            canton: fosterHome.canton || null,
            provincia: fosterHome.provincia || null,
            pais: fosterHome.pais || null,
            idSolicitud: fosterHome.idSolicitud || null,
            tipoSolicitud: fosterHome.tipoSolicitud || null,
            totalPerritos: Number(fosterHome.totalPerritos || 0),
            idEstado: Number(fosterHome.idEstado),
            estado: fosterHome.estado || null,
            perrosAlojados: activeHouseDogsByHomeId.get(Number(fosterHome.idCasaCuna)) || []
        }))
        .sort((left, right) => right.idCasaCuna - left.idCasaCuna);
}

async function buildProfileOverview(idCuenta) {
    const currentProfile = await getCurrentProfileRecord(idCuenta);
    const [requests, adoptions, sales, saleInvoices, fosterHomes, houseDogs] = await Promise.all([
        requestService.getRequests(),
        adoptionService.getAdoptions(),
        saleService.getSales(),
        saleInvoiceService.getSaleInvoices(),
        fosterHomeService.getFosterHomes(),
        houseDogService.getHouseDogs()
    ]);

    const adoptionRequests = buildAdoptionRequests({
        identificacion: currentProfile.identificacion,
        requests,
        adoptions
    });
    const purchases = await buildPurchases({
        identificacion: currentProfile.identificacion,
        sales,
        saleInvoices
    });
    const fosterHomesSummary = buildFosterHomes({
        identificacion: currentProfile.identificacion,
        fosterHomes,
        houseDogs
    });

    return {
        profile: formatCurrentProfile(currentProfile),
        adoptionRequests,
        purchases,
        fosterHomes: fosterHomesSummary,
        summary: {
            totalSolicitudesAdopcion: adoptionRequests.length,
            totalCompras: purchases.length,
            montoComprado: roundMoney(
                purchases.reduce((accumulator, purchase) => accumulator + Number(purchase.totalVenta || 0), 0)
            ),
            totalCasasCuna: fosterHomesSummary.length,
            totalPerritosAlojados: fosterHomesSummary.reduce(
                (accumulator, fosterHome) => accumulator + fosterHome.perrosAlojados.length,
                0
            )
        }
    };
}

async function updateCurrentProfile(idCuenta, profileData) {
    const currentProfile = await getCurrentProfileRecord(idCuenta);
    const normalizedUsername = String(profileData.usuario || '').trim();
    const normalizedPhone = String(profileData.telefono || '').trim();

    if (!PHONE_PATTERN.test(normalizedPhone)) {
        throw createHttpError('Phone must be a valid number', 400);
    }

    const hierarchy = await locationRepository.findDistrictHierarchy({
        idPais: Number(profileData.idPais),
        idProvincia: Number(profileData.idProvincia),
        idCanton: Number(profileData.idCanton),
        idDistrito: Number(profileData.idDistrito)
    });

    if (!hierarchy) {
        throw createHttpError(
            'The selected country, province, canton, and district combination is invalid',
            400
        );
    }

    const [accountWithSameUsername, existingPhoneRecord] = await Promise.all([
        userRepository.findAccountByUsuario(normalizedUsername),
        phoneRepository.findPhoneByNumber(normalizedPhone)
    ]);

    if (
        accountWithSameUsername &&
        normalizeIdentification(accountWithSameUsername.IDENTIFICACION) !== currentProfile.identificacion
    ) {
        throw createHttpError('Username already exists', 409);
    }

    if (
        existingPhoneRecord &&
        normalizeIdentification(existingPhoneRecord.IDENTIFICACION) !== currentProfile.identificacion
    ) {
        throw createHttpError('Phone already exists', 409);
    }

    const nextAddress =
        currentProfile.user.ID_DIRECCION && Number(currentProfile.user.ID_DIRECCION) > 0
            ? { idDireccion: Number(currentProfile.user.ID_DIRECCION) }
            : await addressService.createAddress({
                  idDistrito: Number(profileData.idDistrito),
                  calle: normalizeOptionalText(profileData.calle),
                  numero: normalizeOptionalText(profileData.numero)
              });

    await userRepository.updateAddress({
        idDireccion: nextAddress.idDireccion,
        idDistrito: Number(profileData.idDistrito),
        calle: normalizeOptionalText(profileData.calle),
        numero: normalizeOptionalText(profileData.numero),
        idEstado: Number(currentProfile.user.ID_ESTADO)
    });

    await userRepository.updateUser({
        identificacion: currentProfile.identificacion,
        nombre: String(profileData.nombre || '').trim(),
        apellidoPaterno: String(profileData.apellidoPaterno || '').trim(),
        apellidoMaterno: String(profileData.apellidoMaterno || '').trim(),
        idDireccion: nextAddress.idDireccion,
        idTipoUsuario: Number(currentProfile.user.ID_TIPO_USUARIO),
        idEstado: Number(currentProfile.user.ID_ESTADO)
    });

    await userRepository.updateAccount({
        idCuenta: Number(currentProfile.account.ID_CUENTA),
        identificacion: currentProfile.identificacion,
        usuario: normalizedUsername,
        passwordHash: profileData.password
            ? await bcrypt.hash(String(profileData.password), 10)
            : currentProfile.account.PASSWORD_HASH,
        idEstado: Number(currentProfile.account.ID_ESTADO)
    });

    if (existingPhoneRecord && normalizeIdentification(existingPhoneRecord.IDENTIFICACION) === currentProfile.identificacion) {
        if (
            currentProfile.phone &&
            String(currentProfile.phone.TELEFONO || '').trim() !== normalizedPhone
        ) {
            await phoneRepository.deletePhone(
                currentProfile.identificacion,
                currentProfile.phone.TELEFONO
            );
        }

        if (Number(existingPhoneRecord.ID_ESTADO) !== ACTIVE_STATE_ID) {
            await phoneRepository.updatePhone({
                identificacion: currentProfile.identificacion,
                telefono: normalizedPhone,
                idEstado: ACTIVE_STATE_ID
            });
        }
    } else if (
        currentProfile.phone &&
        String(currentProfile.phone.TELEFONO || '').trim() !== normalizedPhone
    ) {
        await phoneRepository.deletePhone(
            currentProfile.identificacion,
            currentProfile.phone.TELEFONO
        );
        await phoneRepository.createPhone({
            identificacion: currentProfile.identificacion,
            telefono: normalizedPhone,
            idEstado: ACTIVE_STATE_ID
        });
    } else if (!currentProfile.phone) {
        await phoneRepository.createPhone({
            identificacion: currentProfile.identificacion,
            telefono: normalizedPhone,
            idEstado: ACTIVE_STATE_ID
        });
    }

    userService.invalidateAllUserCaches?.();

    return buildProfileOverview(idCuenta);
}

module.exports = {
    getCurrentProfileOverview: buildProfileOverview,
    updateCurrentProfile
};
