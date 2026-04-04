const bcrypt = require('bcrypt');
const crypto = require('crypto');
const addressService = require('./addressService');
const catalogService = require('./catalogService');
const userService = require('./userService');
const {
    sendEmailChangeOtpEmail,
    sendPasswordChangeOtpEmail
} = require('../config/email');
const emailRepository = require('../repositories/emailRepository');
const locationRepository = require('../repositories/locationRepository');
const phoneRepository = require('../repositories/phoneRepository');
const profileRepository = require('../repositories/profileRepository');
const refreshTokenRepository = require('../repositories/refreshTokenRepository');
const userRepository = require('../repositories/userRepository');

const PHONE_PATTERN = /^[0-9()+\s-]{6,20}$/;
const ACTIVE_STATE_ID = 1;
const INACTIVE_STATE_ID = 2;
const PENDING_STATE_ID = 3;
const PROFILE_SECURITY_OTP_TTL_MINUTES = Number(
    process.env.PROFILE_SECURITY_OTP_TTL_MINUTES || 15
);
const EMAIL_CHANGE_OTP_NAME = 'Cambio de correo';
const PASSWORD_CHANGE_OTP_NAME = 'Cambio de contrasena';

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

function normalizeEmailAddress(value) {
    return String(value || '').trim().toLowerCase();
}

function hasOwnProperty(target, property) {
    return Object.prototype.hasOwnProperty.call(target || {}, property);
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

function isDateOnOrAfterToday(value) {
    const serializedDate = serializeDateOnly(value);

    if (!serializedDate) {
        return true;
    }

    return serializedDate >= serializeDateOnly(new Date());
}

function roundMoney(value) {
    return Math.round(Number(value || 0) * 100) / 100;
}

function pickPreferredRecord(records) {
    const activeRecord = records.find((record) => Number(record.ID_ESTADO) === ACTIVE_STATE_ID);
    return activeRecord || records[0] || null;
}

function isBcryptHash(value) {
    return typeof value === 'string' && /^\$2[aby]\$\d{2}\$/.test(value);
}

async function verifyStoredPassword(candidatePassword, storedPassword) {
    if (typeof storedPassword !== 'string' || !storedPassword) {
        return { isValid: false, needsMigration: false };
    }

    if (!isBcryptHash(storedPassword)) {
        return {
            isValid: storedPassword === candidatePassword,
            needsMigration: storedPassword === candidatePassword
        };
    }

    try {
        return {
            isValid: await bcrypt.compare(candidatePassword, storedPassword),
            needsMigration: false
        };
    } catch (error) {
        return { isValid: false, needsMigration: false };
    }
}

function isRefreshTokenRecordActive(refreshTokenRecord) {
    return (
        Number(refreshTokenRecord?.ID_ESTADO) === ACTIVE_STATE_ID &&
        !refreshTokenRecord?.FECHA_REVOCACION &&
        new Date(refreshTokenRecord.FECHA_EXPIRACION).getTime() > Date.now()
    );
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

async function getCurrentProfileRecord(idCuenta) {
    const account = await userRepository.findAccountByIdCuenta(idCuenta);

    if (!account) {
        throw createHttpError('Account not found', 404);
    }

    const identificacion = normalizeIdentification(account.IDENTIFICACION);
    const [user, emails, phones] = await Promise.all([
        userRepository.findUserDetailsByIdentification(identificacion),
        emailRepository.findEmailsByIdentification(identificacion),
        phoneRepository.findPhonesByIdentification(identificacion)
    ]);

    if (!user) {
        throw createHttpError('User not found', 404);
    }

    return {
        account,
        identificacion,
        user,
        emails,
        email: pickPreferredRecord(emails),
        phone: pickPreferredRecord(phones)
    };
}

function buildCurrentProfileFromSummaryRow(summaryRow) {
    if (!summaryRow) {
        return null;
    }

    return {
        account: {
            ID_CUENTA: summaryRow.ID_CUENTA,
            IDENTIFICACION: summaryRow.IDENTIFICACION,
            USUARIO: summaryRow.USUARIO,
            PASSWORD_HASH: summaryRow.PASSWORD_HASH,
            ID_ESTADO: summaryRow.ID_ESTADO_CUENTA
        },
        identificacion: normalizeIdentification(summaryRow.IDENTIFICACION),
        user: summaryRow,
        emails: [],
        email: summaryRow.CORREO
            ? {
                  CORREO: summaryRow.CORREO,
                  ID_ESTADO: summaryRow.ID_ESTADO_CORREO,
                  ESTADO: summaryRow.ESTADO_CORREO
              }
            : null,
        phone: summaryRow.TELEFONO
            ? {
                  TELEFONO: summaryRow.TELEFONO,
                  ID_ESTADO: summaryRow.ID_ESTADO_TELEFONO,
                  ESTADO: summaryRow.ESTADO_TELEFONO
              }
            : null
    };
}

function buildAdoptionRequests(requestRows) {
    return requestRows
        .filter(
            (request) =>
                Number(request.ID_TIPO_SOLICITUD) === 1 ||
                normalizeCatalogName(request.TIPO_SOLICITUD) === normalizeCatalogName('Adopcion')
        )
        .map((request) => ({
            idSolicitud: Number(request.ID_SOLICITUD),
            tipoSolicitud: request.TIPO_SOLICITUD || null,
            idEstadoSolicitud: Number(request.ID_ESTADO),
            estadoSolicitud: request.ESTADO_SOLICITUD || null,
            idPerrito:
                request.ID_PERRITO === null || request.ID_PERRITO === undefined
                    ? null
                    : Number(request.ID_PERRITO),
            nombrePerrito: request.NOMBRE_PERRITO || null,
            idAdopcion:
                request.ID_ADOPCION === null || request.ID_ADOPCION === undefined
                    ? null
                    : Number(request.ID_ADOPCION),
            idEstadoProceso:
                request.ID_ESTADO_PROCESO === null || request.ID_ESTADO_PROCESO === undefined
                    ? null
                    : Number(request.ID_ESTADO_PROCESO),
            estadoProceso: request.ESTADO_PROCESO || null,
            fechaAdopcion: serializeDateOnly(request.FECHA_ADOPCION)
        }));
}

function buildPurchases({ purchases, purchaseItems, purchaseInvoices }) {
    const itemsBySaleId = purchaseItems.reduce((accumulator, item) => {
        const currentItems = accumulator.get(Number(item.ID_VENTA)) || [];
        currentItems.push({
            idVenta: Number(item.ID_VENTA),
            idProducto: Number(item.ID_PRODUCTO),
            producto: item.PRODUCTO || null,
            tipoMovimiento: item.TIPO_MOVIMIENTO || null,
            cantidad: Number(item.CANTIDAD || 0),
            precioUnitario: roundMoney(item.PRECIO_UNITARIO || 0),
            total: roundMoney(item.TOTAL || 0),
            idEstado: Number(item.ID_ESTADO),
            estado: item.ESTADO || null
        });
        accumulator.set(Number(item.ID_VENTA), currentItems);
        return accumulator;
    }, new Map());

    const invoicesBySaleId = purchaseInvoices.reduce((accumulator, invoice) => {
        const currentInvoices = accumulator.get(Number(invoice.ID_VENTA)) || [];
        currentInvoices.push({
            idFactura: invoice.ID_FACTURA,
            idEstado: Number(invoice.ID_ESTADO),
            estado: invoice.ESTADO || null,
            moneda: invoice.MONEDA || null,
            simbolo: invoice.SIMBOLO || null,
            totalFactura: roundMoney(invoice.TOTAL_FACTURA || 0),
            fechaFactura: serializeDate(invoice.FECHA_FACTURA)
        });
        accumulator.set(Number(invoice.ID_VENTA), currentInvoices);
        return accumulator;
    }, new Map());

    return purchases.map((purchase) => ({
        idVenta: Number(purchase.ID_VENTA),
        totalVenta: roundMoney(purchase.TOTAL_VENTA || 0),
        fechaVenta: serializeDate(purchase.FECHA_VENTA),
        idEstado: Number(purchase.ID_ESTADO),
        estado: purchase.ESTADO || null,
        items: itemsBySaleId.get(Number(purchase.ID_VENTA)) || [],
        facturas: invoicesBySaleId.get(Number(purchase.ID_VENTA)) || []
    }));
}

function buildFosterHomes({ fosterHomes, fosterDogs }) {
    const dogsByHomeId = fosterDogs.reduce((accumulator, dog) => {
        const currentDogs = accumulator.get(Number(dog.ID_CASA_CUNA)) || [];
        currentDogs.push({
            idPerrito: Number(dog.ID_PERRITO),
            nombrePerrito: dog.NOMBRE_PERRITO || null,
            idEstado: Number(dog.ID_ESTADO),
            estado: dog.ESTADO || null
        });
        accumulator.set(Number(dog.ID_CASA_CUNA), currentDogs);
        return accumulator;
    }, new Map());

    return fosterHomes.map((fosterHome) => ({
        idCasaCuna: Number(fosterHome.ID_CASA_CUNA),
        nombre: fosterHome.NOMBRE || null,
        ubicacion: [fosterHome.DISTRITO, fosterHome.CANTON, fosterHome.PROVINCIA, fosterHome.PAIS]
            .filter(Boolean)
            .join(', ') || null,
        calle: fosterHome.CALLE || null,
        numero: fosterHome.NUMERO || null,
        distrito: fosterHome.DISTRITO || null,
        canton: fosterHome.CANTON || null,
        provincia: fosterHome.PROVINCIA || null,
        pais: fosterHome.PAIS || null,
        idSolicitud:
            fosterHome.ID_SOLICITUD === null || fosterHome.ID_SOLICITUD === undefined
                ? null
                : Number(fosterHome.ID_SOLICITUD),
        tipoSolicitud: fosterHome.TIPO_SOLICITUD || null,
        totalPerritos: Number(fosterHome.TOTAL_PERRITOS || 0),
        idEstado: Number(fosterHome.ID_ESTADO),
        estado: fosterHome.ESTADO || null,
        perrosAlojados: dogsByHomeId.get(Number(fosterHome.ID_CASA_CUNA)) || []
    }));
}

function buildProfileFollowUps(followUpRows) {
    return followUpRows
        .filter(
            (followUp) =>
                Number(followUp.ID_ESTADO) === ACTIVE_STATE_ID &&
                isDateOnOrAfterToday(followUp.FECHA_FIN)
        )
        .map((followUp) => ({
            idSeguimiento: Number(followUp.ID_SEGUIMIENTO),
            idAdopcion:
                followUp.ID_ADOPCION === null || followUp.ID_ADOPCION === undefined
                    ? null
                    : Number(followUp.ID_ADOPCION),
            idPerrito:
                followUp.ID_PERRITO === null || followUp.ID_PERRITO === undefined
                    ? null
                    : Number(followUp.ID_PERRITO),
            nombrePerrito: followUp.NOMBRE_PERRITO || null,
            idTipoSeguimiento:
                followUp.ID_TIPO_SEGUIMIENTO === null ||
                followUp.ID_TIPO_SEGUIMIENTO === undefined
                    ? null
                    : Number(followUp.ID_TIPO_SEGUIMIENTO),
            tipoSeguimiento: followUp.TIPO_SEGUIMIENTO || null,
            fechaInicio: serializeDateOnly(followUp.FECHA_INICIO),
            fechaFin: serializeDateOnly(followUp.FECHA_FIN),
            cantidadEvidencias: Number(followUp.CANTIDAD_EVIDENCIAS || 0),
            ultimaFechaEvidencia: serializeDateOnly(followUp.ULTIMA_FECHA_EVIDENCIA)
        }));
}

async function buildProfileOverview(idCuenta) {
    const overviewRows = await profileRepository.findProfileOverviewData(idCuenta);
    const currentProfile = buildCurrentProfileFromSummaryRow(overviewRows.profile);

    if (!currentProfile) {
        throw createHttpError('Account not found', 404);
    }

    const adoptionRequests = buildAdoptionRequests(overviewRows.requests);
    const purchases = buildPurchases({
        purchases: overviewRows.purchases,
        purchaseItems: overviewRows.purchaseItems,
        purchaseInvoices: overviewRows.purchaseInvoices
    });
    const fosterHomesSummary = buildFosterHomes({
        fosterHomes: overviewRows.fosterHomes,
        fosterDogs: overviewRows.fosterDogs
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
                purchases.reduce(
                    (accumulator, purchase) => accumulator + Number(purchase.totalVenta || 0),
                    0
                )
            ),
            totalCasasCuna: fosterHomesSummary.length,
            totalPerritosAlojados: fosterHomesSummary.reduce(
                (accumulator, fosterHome) => accumulator + fosterHome.perrosAlojados.length,
                0
            )
        }
    };
}

async function getCurrentProfileFollowUps(idCuenta) {
    const followUpRows = await profileRepository.findProfileFollowUpsData(idCuenta);
    return buildProfileFollowUps(followUpRows);
}

async function getOtpTypeIdByName(expectedName) {
    const normalizedExpectedName = normalizeCatalogName(expectedName);
    const otpTypes = await catalogService.getOtpTypes();
    const matchingOtpType = otpTypes.find(
        (otpType) => normalizeCatalogName(otpType.nombre) === normalizedExpectedName
    );

    if (!matchingOtpType) {
        throw createHttpError(`OTP type "${expectedName}" is not configured`, 500);
    }

    return matchingOtpType.idTipoOtp;
}

async function getEmailChangeOtpTypeId() {
    return getOtpTypeIdByName(EMAIL_CHANGE_OTP_NAME);
}

async function getPasswordChangeOtpTypeId() {
    return getOtpTypeIdByName(PASSWORD_CHANGE_OTP_NAME);
}

async function createAndSendOtp({ idCuenta, idTipoOtp, sendEmail }) {
    await userRepository.deactivateActiveOtpsByCuenta(idCuenta, idTipoOtp);

    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const hashedCode = await bcrypt.hash(verificationCode, 10);

    await userRepository.createOTP({
        idCuenta,
        idTipoOtp,
        codigoHash: hashedCode,
        fechaExpiracion: new Date(Date.now() + PROFILE_SECURITY_OTP_TTL_MINUTES * 60 * 1000),
        fechaUso: null,
        intentos: 0,
        fechaCreacion: new Date(),
        idEstado: ACTIVE_STATE_ID
    });

    const emailSent = await sendEmail(verificationCode);

    if (!emailSent) {
        throw createHttpError('Failed to send verification email', 502);
    }

    return { emailSent: true };
}

async function assertValidCurrentPassword(account, currentPassword) {
    const passwordValidation = await verifyStoredPassword(currentPassword, account.PASSWORD_HASH);

    if (!passwordValidation.isValid) {
        throw createHttpError('Current password is incorrect', 401);
    }

    if (passwordValidation.needsMigration) {
        const migratedHash = await bcrypt.hash(currentPassword, 10);
        await userRepository.updateAccount({
            idCuenta: Number(account.ID_CUENTA),
            identificacion: normalizeIdentification(account.IDENTIFICACION),
            usuario: account.USUARIO,
            passwordHash: migratedHash,
            idEstado: Number(account.ID_ESTADO)
        });

        return {
            ...account,
            PASSWORD_HASH: migratedHash
        };
    }

    return account;
}

function getVerifiedEmailRecord(currentProfile) {
    if (!currentProfile.email || Number(currentProfile.email.ID_ESTADO) !== ACTIVE_STATE_ID) {
        throw createHttpError(
            'You need a verified email before changing your password',
            409
        );
    }

    return currentProfile.email;
}

async function revokeStoredRefreshToken(refreshTokenRecord) {
    if (!refreshTokenRecord || Number(refreshTokenRecord.ID_ESTADO) !== ACTIVE_STATE_ID) {
        return;
    }

    await refreshTokenRepository.updateRefreshToken({
        idRefreshToken: refreshTokenRecord.ID_REFRESH_TOKEN,
        idCuenta: refreshTokenRecord.ID_CUENTA,
        tokenHash: refreshTokenRecord.TOKEN_HASH,
        jti: refreshTokenRecord.JTI,
        ipAddress: refreshTokenRecord.IP_ADDRESS,
        userAgent: refreshTokenRecord.USER_AGENT,
        fechaExpiracion: refreshTokenRecord.FECHA_EXPIRACION,
        fechaRevocacion: new Date(),
        idEstado: INACTIVE_STATE_ID
    });
}

async function revokeAllRefreshTokensByAccount(idCuenta) {
    const refreshTokens = await refreshTokenRepository.findRefreshTokensByCuenta(idCuenta);

    for (const refreshTokenRecord of refreshTokens) {
        if (isRefreshTokenRecordActive(refreshTokenRecord)) {
            await revokeStoredRefreshToken(refreshTokenRecord);
        }
    }
}

async function updateCurrentProfile(idCuenta, profileData) {
    if (hasOwnProperty(profileData, 'correo') || hasOwnProperty(profileData, 'password')) {
        throw createHttpError(
            'Email and password must be changed through the verification flows',
            400
        );
    }

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
        passwordHash: currentProfile.account.PASSWORD_HASH,
        idEstado: Number(currentProfile.account.ID_ESTADO)
    });

    if (
        existingPhoneRecord &&
        normalizeIdentification(existingPhoneRecord.IDENTIFICACION) === currentProfile.identificacion
    ) {
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

async function requestCurrentEmailChange(idCuenta, payload) {
    const currentProfile = await getCurrentProfileRecord(idCuenta);
    const normalizedNewEmail = normalizeEmailAddress(payload.nuevoCorreo);
    const currentActiveEmail = (currentProfile.emails || []).find(
        (emailRecord) => Number(emailRecord.ID_ESTADO) === ACTIVE_STATE_ID
    );
    const currentEmail = normalizeEmailAddress(currentActiveEmail?.CORREO);

    if (!normalizedNewEmail) {
        throw createHttpError('Valid email is required', 400);
    }

    if (normalizedNewEmail === currentEmail) {
        throw createHttpError('The new email must be different from the current one', 409);
    }

    const emailWithSameAddress = await emailRepository.findEmailByAddress(normalizedNewEmail);

    if (
        emailWithSameAddress &&
        normalizeIdentification(emailWithSameAddress.IDENTIFICACION) !== currentProfile.identificacion
    ) {
        throw createHttpError('Email already exists', 409);
    }

    for (const emailRecord of currentProfile.emails || []) {
        if (
            Number(emailRecord.ID_ESTADO) === PENDING_STATE_ID &&
            normalizeEmailAddress(emailRecord.CORREO) !== normalizedNewEmail
        ) {
            await emailRepository.deleteEmail(currentProfile.identificacion, emailRecord.CORREO);
        }
    }

    let createdPendingEmail = false;
    let previousEmailState = null;
    let targetEmailAddress = normalizedNewEmail;

    if (
        emailWithSameAddress &&
        normalizeIdentification(emailWithSameAddress.IDENTIFICACION) === currentProfile.identificacion
    ) {
        previousEmailState = Number(emailWithSameAddress.ID_ESTADO);
        targetEmailAddress = emailWithSameAddress.CORREO;
        if (previousEmailState === ACTIVE_STATE_ID) {
            throw createHttpError('Email already exists', 409);
        }

        await emailRepository.updateEmail({
            identificacion: currentProfile.identificacion,
            correo: targetEmailAddress,
            idEstado: PENDING_STATE_ID
        });
    } else {
        await emailRepository.createEmail({
            identificacion: currentProfile.identificacion,
            correo: normalizedNewEmail,
            idEstado: PENDING_STATE_ID
        });
        createdPendingEmail = true;
    }

    try {
        await createAndSendOtp({
            idCuenta: Number(currentProfile.account.ID_CUENTA),
            idTipoOtp: await getEmailChangeOtpTypeId(),
            sendEmail: (code) =>
                sendEmailChangeOtpEmail(
                    normalizedNewEmail,
                    code,
                    PROFILE_SECURITY_OTP_TTL_MINUTES
                )
        });
    } catch (error) {
        if (createdPendingEmail) {
            await emailRepository.deleteEmail(currentProfile.identificacion, normalizedNewEmail);
        } else if (
            previousEmailState !== null &&
            previousEmailState !== PENDING_STATE_ID
        ) {
            await emailRepository.updateEmail({
                identificacion: currentProfile.identificacion,
                correo: targetEmailAddress,
                idEstado: previousEmailState
            });
        }

        throw error;
    }

    userService.invalidateAllUserCaches?.();

    return {
        emailSent: true,
        nuevoCorreo: normalizedNewEmail
    };
}

async function confirmCurrentEmailChange(idCuenta, payload) {
    const currentProfile = await getCurrentProfileRecord(idCuenta);
    const normalizedNewEmail = normalizeEmailAddress(payload.nuevoCorreo);
    const verificationCode = String(payload.codigo || '').trim();

    const pendingEmail = await emailRepository.findEmailByAddress(normalizedNewEmail);

    if (
        !pendingEmail ||
        normalizeIdentification(pendingEmail.IDENTIFICACION) !== currentProfile.identificacion ||
        Number(pendingEmail.ID_ESTADO) !== PENDING_STATE_ID
    ) {
        throw createHttpError('No pending email change was found for this address', 404);
    }

    const otp = await userRepository.findOTPByCodeAndCuenta(
        verificationCode,
        Number(currentProfile.account.ID_CUENTA),
        await getEmailChangeOtpTypeId()
    );

    if (!otp) {
        throw createHttpError('Invalid or expired verification code', 400);
    }

    await userRepository.markOTPAsUsed(otp.ID_CODIGO_OTP);

    if (
        currentProfile.email &&
        Number(currentProfile.email.ID_ESTADO) === ACTIVE_STATE_ID &&
        normalizeEmailAddress(currentProfile.email.CORREO) !== normalizedNewEmail
    ) {
        await emailRepository.updateEmail({
            identificacion: currentProfile.identificacion,
            correo: currentProfile.email.CORREO,
            idEstado: INACTIVE_STATE_ID
        });
    }

    await emailRepository.updateEmail({
        identificacion: currentProfile.identificacion,
        correo: pendingEmail.CORREO,
        idEstado: ACTIVE_STATE_ID
    });

    userService.invalidateAllUserCaches?.();

    return buildProfileOverview(idCuenta);
}

async function requestCurrentPasswordChange(idCuenta, payload) {
    const currentProfile = await getCurrentProfileRecord(idCuenta);
    const verifiedEmail = getVerifiedEmailRecord(currentProfile);
    const currentPassword = String(payload.currentPassword || '');
    const newPassword = String(payload.newPassword || '');

    if (currentPassword === newPassword) {
        throw createHttpError(
            'The new password must be different from the current password',
            400
        );
    }

    await assertValidCurrentPassword(currentProfile.account, currentPassword);

    await createAndSendOtp({
        idCuenta: Number(currentProfile.account.ID_CUENTA),
        idTipoOtp: await getPasswordChangeOtpTypeId(),
        sendEmail: (code) =>
            sendPasswordChangeOtpEmail(
                verifiedEmail.CORREO,
                code,
                PROFILE_SECURITY_OTP_TTL_MINUTES
            )
    });

    return {
        emailSent: true
    };
}

async function confirmCurrentPasswordChange(idCuenta, payload) {
    const currentProfile = await getCurrentProfileRecord(idCuenta);
    getVerifiedEmailRecord(currentProfile);

    const currentPassword = String(payload.currentPassword || '');
    const newPassword = String(payload.newPassword || '');
    const verificationCode = String(payload.codigo || '').trim();

    if (currentPassword === newPassword) {
        throw createHttpError(
            'The new password must be different from the current password',
            400
        );
    }

    await assertValidCurrentPassword(currentProfile.account, currentPassword);

    const otp = await userRepository.findOTPByCodeAndCuenta(
        verificationCode,
        Number(currentProfile.account.ID_CUENTA),
        await getPasswordChangeOtpTypeId()
    );

    if (!otp) {
        throw createHttpError('Invalid or expired verification code', 400);
    }

    await userRepository.markOTPAsUsed(otp.ID_CODIGO_OTP);

    await userRepository.updateAccount({
        idCuenta: Number(currentProfile.account.ID_CUENTA),
        identificacion: currentProfile.identificacion,
        usuario: currentProfile.account.USUARIO,
        passwordHash: await bcrypt.hash(newPassword, 10),
        idEstado: Number(currentProfile.account.ID_ESTADO)
    });

    await revokeAllRefreshTokensByAccount(Number(currentProfile.account.ID_CUENTA));
    userService.invalidateAllUserCaches?.();

    return {
        requiresReauth: true
    };
}

module.exports = {
    getCurrentProfileOverview: buildProfileOverview,
    getCurrentProfileFollowUps,
    updateCurrentProfile,
    requestCurrentEmailChange,
    confirmCurrentEmailChange,
    requestCurrentPasswordChange,
    confirmCurrentPasswordChange
};
