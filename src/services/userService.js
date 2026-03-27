const bcrypt = require('bcrypt');
const crypto = require('crypto');
const addressService = require('./addressService');
const catalogService = require('./catalogService');
const emailRepository = require('../repositories/emailRepository');
const locationRepository = require('../repositories/locationRepository');
const phoneRepository = require('../repositories/phoneRepository');
const refreshTokenRepository = require('../repositories/refreshTokenRepository');
const userRepository = require('../repositories/userRepository');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const { sendVerificationEmail } = require('../config/email');
const MemoryCache = require('../utils/memoryCache');

const USER_LIST_CACHE_KEY = 'user:list';
const USER_DETAIL_CACHE_PREFIX = 'user:detail:';
const USER_CACHE_TTL_MS = Number(process.env.USER_CACHE_TTL_MS || 15000);
const ACTIVE_STATE_ID = 1;
const INACTIVE_STATE_ID = 2;
const PENDING_STATE_ID = 3;
const CLIENT_USER_TYPE_ID = 2;
const EMAIL_VERIFICATION_OTP_TYPE_ID = 1;
const EMAIL_VERIFICATION_OTP_NAME = 'Verificacion de correo';
const userQueryCache = new MemoryCache({ defaultTtlMs: USER_CACHE_TTL_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function isBcryptHash(value) {
    return typeof value === 'string' && /^\$2[aby]\$\d{2}\$/.test(value);
}

function normalizeCatalogName(value) {
    return String(value || '')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
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

function getUserDetailCacheKey(identificacion) {
    return `${USER_DETAIL_CACHE_PREFIX}${String(identificacion).trim()}`;
}

function invalidateUserCache(identificacion) {
    userQueryCache.delete(USER_LIST_CACHE_KEY);

    if (identificacion !== undefined && identificacion !== null) {
        userQueryCache.delete(getUserDetailCacheKey(identificacion));
        return;
    }

    userQueryCache.clearByPrefix(USER_DETAIL_CACHE_PREFIX);
}

async function getUserTypeIdByName(expectedName, { fallbackId = null } = {}) {
    const normalizedExpectedName = normalizeCatalogName(expectedName);
    const userTypes = await catalogService.getUserTypes();
    const matchingUserType = userTypes.find(
        (userType) => normalizeCatalogName(userType.nombre) === normalizedExpectedName
    );

    if (matchingUserType) {
        return matchingUserType.idTipoUsuario;
    }

    if (fallbackId !== null) {
        const fallbackUserType = userTypes.find(
            (userType) => Number(userType.idTipoUsuario) === Number(fallbackId)
        );

        if (fallbackUserType) {
            return fallbackUserType.idTipoUsuario;
        }
    }

    if (!matchingUserType) {
        throw createHttpError(`User type "${expectedName}" is not configured`, 500);
    }

    return matchingUserType.idTipoUsuario;
}

async function getOtpTypeIdByName(expectedName, { fallbackId = null } = {}) {
    const normalizedExpectedName = normalizeCatalogName(expectedName);
    const otpTypes = await catalogService.getOtpTypes();
    const matchingOtpType = otpTypes.find(
        (otpType) => normalizeCatalogName(otpType.nombre) === normalizedExpectedName
    );

    if (matchingOtpType) {
        return matchingOtpType.idTipoOtp;
    }

    if (fallbackId !== null) {
        const fallbackOtpType = otpTypes.find(
            (otpType) => Number(otpType.idTipoOtp) === Number(fallbackId)
        );

        if (fallbackOtpType) {
            return fallbackOtpType.idTipoOtp;
        }
    }

    throw createHttpError(`OTP type "${expectedName}" is not configured`, 500);
}

async function getEmailVerificationOtpTypeId() {
    return getOtpTypeIdByName(EMAIL_VERIFICATION_OTP_NAME, {
        fallbackId: EMAIL_VERIFICATION_OTP_TYPE_ID
    });
}

async function generateAndSendVerificationOtp(account, { failOnEmailError = false } = {}) {
    const verificationOtpTypeId = await getEmailVerificationOtpTypeId();
    await userRepository.deactivateActiveOtpsByCuenta(account.ID_CUENTA, verificationOtpTypeId);

    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const hashedCode = await bcrypt.hash(verificationCode, 10);

    const otpData = {
        idCuenta: account.ID_CUENTA,
        idTipoOtp: verificationOtpTypeId,
        codigoHash: hashedCode,
        fechaExpiracion: new Date(Date.now() + 24 * 60 * 60 * 1000),
        fechaUso: null,
        intentos: 0,
        fechaCreacion: new Date(),
        idEstado: 1
    };

    await userRepository.createOTP(otpData);

    const verificationEmail = account.CORREO || account.EMAIL || account.USUARIO;
    const emailSent = await sendVerificationEmail(verificationEmail, verificationCode);
    if (!emailSent && failOnEmailError) {
        throw createHttpError('Failed to send verification email', 502);
    }

    return emailSent;
}

function pickPrimaryEmail(emailRows) {
    const activeEmails = emailRows.filter((email) => Number(email.ID_ESTADO) === 1);
    return activeEmails[0] || emailRows[0] || null;
}

function hasSameEmail(left, right) {
    return String(left || '').trim().toLowerCase() === String(right || '').trim().toLowerCase();
}

function isActiveState(idEstado) {
    return Number(idEstado) === ACTIVE_STATE_ID;
}

function isPendingState(idEstado) {
    return Number(idEstado) === PENDING_STATE_ID;
}

function isAvailableEmailState(idEstado) {
    return isActiveState(idEstado) || isPendingState(idEstado);
}

function isAvailableAccountState(idEstado) {
    return isActiveState(idEstado) || isPendingState(idEstado);
}

function isRefreshTokenRecordActive(refreshTokenRecord) {
    return (
        Number(refreshTokenRecord?.ID_ESTADO) === ACTIVE_STATE_ID &&
        !refreshTokenRecord?.FECHA_REVOCACION &&
        new Date(refreshTokenRecord.FECHA_EXPIRACION).getTime() > Date.now()
    );
}

function formatSessionUser(account, primaryEmail) {
    const idEstadoCorreo = primaryEmail ? Number(primaryEmail.ID_ESTADO) : null;

    return {
        identificacion: account.IDENTIFICACION,
        nombre: account.NOMBRE,
        apellidoPaterno: account.APELLIDO_PATERNO,
        apellidoMaterno: account.APELLIDO_MATERNO,
        usuario: account.USUARIO,
        correo: primaryEmail?.CORREO || null,
        idTipoUsuario: account.ID_TIPO_USUARIO,
        tipoUsuario: account.TIPO_USUARIO,
        idEstadoCuenta: Number(account.ID_ESTADO),
        idEstadoCorreo,
        emailVerified: isActiveState(idEstadoCorreo)
    };
}

function buildRefreshTokenPayload(account) {
    return {
        identificacion: account.IDENTIFICACION,
        idCuenta: account.ID_CUENTA,
        jti: crypto.randomUUID()
    };
}

async function issueRefreshToken(account, requestMetadata = {}) {
    const refreshTokenPayload = buildRefreshTokenPayload(account);
    const refreshToken = generateRefreshToken(refreshTokenPayload);
    const decodedRefreshToken = verifyRefreshToken(refreshToken);
    const refreshTokenExpiresAt = new Date(decodedRefreshToken.exp * 1000);

    await refreshTokenRepository.createRefreshToken({
        idCuenta: account.ID_CUENTA,
        tokenHash: await bcrypt.hash(refreshToken, 10),
        jti: refreshTokenPayload.jti,
        ipAddress: requestMetadata.ipAddress || null,
        userAgent: requestMetadata.userAgent || null,
        fechaExpiracion: refreshTokenExpiresAt,
        fechaRevocacion: null,
        idEstado: ACTIVE_STATE_ID
    });

    return {
        refreshToken,
        refreshTokenExpiresAt
    };
}

async function buildSessionTokens(account, requestMetadata = {}) {
    const accessToken = generateAccessToken({
        identificacion: account.IDENTIFICACION,
        idCuenta: account.ID_CUENTA
    });
    const { refreshToken, refreshTokenExpiresAt } = await issueRefreshToken(account, requestMetadata);
    const primaryEmail = await getPrimaryEmailByIdentification(account.IDENTIFICACION);

    return {
        user: formatSessionUser(account, primaryEmail),
        accessToken,
        refreshToken,
        refreshTokenExpiresAt
    };
}

async function findStoredRefreshToken(rawRefreshToken) {
    let decodedRefreshToken;

    try {
        decodedRefreshToken = verifyRefreshToken(rawRefreshToken);
    } catch (error) {
        throw createHttpError('Invalid refresh token', 401);
    }

    if (!decodedRefreshToken?.idCuenta || !decodedRefreshToken?.jti) {
        throw createHttpError('Invalid refresh token', 401);
    }

    const refreshTokens = await refreshTokenRepository.findRefreshTokensByCuenta(decodedRefreshToken.idCuenta);
    const matchingRefreshTokens = refreshTokens.filter(
        (refreshTokenRecord) =>
            isRefreshTokenRecordActive(refreshTokenRecord) &&
            String(refreshTokenRecord.JTI || '') === String(decodedRefreshToken.jti)
    );

    for (const refreshTokenRecord of matchingRefreshTokens) {
        if (await bcrypt.compare(rawRefreshToken, refreshTokenRecord.TOKEN_HASH)) {
            return {
                decodedRefreshToken,
                refreshTokenRecord
            };
        }
    }

    throw createHttpError('Invalid refresh token', 401);
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

async function getPrimaryEmailByIdentification(identificacion) {
    const emails = await emailRepository.findEmailsByIdentification(identificacion);
    return pickPrimaryEmail(emails);
}

async function findAccountContextByEmail(correo) {
    const emailRecord = await emailRepository.findEmailByAddress(correo);

    if (!emailRecord || !isAvailableEmailState(emailRecord.ID_ESTADO)) {
        return { account: null, emailRecord: null };
    }

    return {
        account: await userRepository.findAccountByIdentification(emailRecord.IDENTIFICACION),
        emailRecord
    };
}

async function findAccountByEmail(correo) {
    const { account } = await findAccountContextByEmail(correo);
    return account;
}

async function findAccountByLoginIdentifier(identifier) {
    const normalizedIdentifier = String(identifier || '').trim();
    const accountByUsername = await userRepository.findAccountByUsuario(normalizedIdentifier);

    if (accountByUsername) {
        return accountByUsername;
    }

    return findAccountByEmail(normalizedIdentifier);
}

async function getUsers() {
    return userQueryCache.getOrSet(USER_LIST_CACHE_KEY, async () => {
        const users = await userRepository.findAllUsers();
        return users.map(formatDashboardUser);
    });
}

async function getUserByIdentification(identificacion) {
    return userQueryCache.getOrSet(getUserDetailCacheKey(identificacion), async () => {
        const user = await userRepository.findUserDetailsByIdentification(identificacion);

        if (!user) {
            throw createHttpError('User not found', 404);
        }

        return formatDashboardUser(user);
    });
}

async function getCurrentUser(idCuenta) {
    const account = await userRepository.findAccountByIdCuenta(idCuenta);
    if (!account) {
        throw createHttpError('Account not found', 404);
    }

    const primaryEmail = await getPrimaryEmailByIdentification(account.IDENTIFICACION);
    return formatSessionUser(account, primaryEmail);
}

async function signUp(userData) {
    const normalizedUsername = String(userData.usuario || '').trim();
    const normalizedEmail = String(userData.correo || '').trim();
    const normalizedPhone = String(userData.telefono || '').trim();

    const existingAccount = await userRepository.findAccountByUsuario(normalizedUsername);
    if (existingAccount) {
        throw createHttpError('Username already exists', 409);
    }

    const existingEmail = await emailRepository.findEmailByAddress(normalizedEmail);
    if (existingEmail) {
        throw createHttpError('Email already exists', 409);
    }

    const existingPhone = await phoneRepository.findPhoneByNumber(normalizedPhone);
    if (existingPhone) {
        throw createHttpError('Phone already exists', 409);
    }

    const existingUser = await userRepository.findByIdentification(userData.identificacion);
    if (existingUser) {
        throw createHttpError('User already exists', 409);
    }

    const districtHierarchy = await locationRepository.findDistrictHierarchy({
        idPais: userData.idPais,
        idProvincia: userData.idProvincia,
        idCanton: userData.idCanton,
        idDistrito: userData.idDistrito
    });

    if (!districtHierarchy) {
        throw createHttpError('The selected country, province, canton, and district combination is invalid', 400);
    }

    const clientUserTypeId = await getUserTypeIdByName('Cliente', {
        fallbackId: CLIENT_USER_TYPE_ID
    });

    const address = await addressService.createAddress({
        idDistrito: userData.idDistrito,
        calle: userData.calle,
        numero: userData.numero
    });

    const newUser = {
        ...userData,
        idDireccion: address.idDireccion,
        idEstado: 1, // Active
        idTipoUsuario: clientUserTypeId
    };

    const userResult = await userRepository.createUser(newUser);

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const accountData = {
        identificacion: userResult.identificacion,
        usuario: normalizedUsername,
        passwordHash: hashedPassword,
        idEstado: PENDING_STATE_ID
    };

    const accountResult = await userRepository.createAccount(accountData);
    await emailRepository.createEmail({
        identificacion: userResult.identificacion,
        correo: normalizedEmail,
        idEstado: PENDING_STATE_ID
    });
    await phoneRepository.createPhone({
        identificacion: userResult.identificacion,
        telefono: normalizedPhone,
        idEstado: 1
    });

    const account = {
        ID_CUENTA: accountResult.idCuenta,
        USUARIO: normalizedUsername,
        CORREO: normalizedEmail
    };
    const emailSent = await generateAndSendVerificationOtp(account);
    invalidateUserCache(userResult.identificacion);

    return {
        user: {
            identificacion: userResult.identificacion,
            nombre: newUser.nombre,
            apellidoPaterno: newUser.apellidoPaterno,
            apellidoMaterno: newUser.apellidoMaterno,
            usuario: normalizedUsername,
            correo: normalizedEmail
        },
        emailSent,
        message: emailSent
            ? 'User created. Please check your email for verification code.'
            : 'User created, but we could not send the verification email. Please request a new code.'
    };
}

function ensureActiveAdminIsNotEditingSelf(actorAccount, targetUser) {
    if (
        actorAccount &&
        actorAccount.ID_TIPO_USUARIO === 1 &&
        targetUser &&
        targetUser.ID_CUENTA === actorAccount.ID_CUENTA
    ) {
        throw createHttpError('The active admin user cannot be modified or deleted', 403);
    }
}

function hasDifferentIdentification(left, right) {
    return String(left).trim() !== String(right).trim();
}

function formatDashboardUser(user) {
    const hasAccountData = Boolean(user.ID_CUENTA || user.USUARIO || user.CORREO);

    return {
        identificacion: user.IDENTIFICACION,
        nombre: user.NOMBRE,
        apellidoPaterno: user.APELLIDO_PATERNO,
        apellidoMaterno: user.APELLIDO_MATERNO,
        fechaRegistro: user.FECHA_REGISTRO,
        idTipoUsuario: user.ID_TIPO_USUARIO,
        tipoUsuario: user.TIPO_USUARIO,
        idEstado: user.ID_ESTADO,
        estado: user.ESTADO_USUARIO,
        cuenta: hasAccountData ? {
            idCuenta: user.ID_CUENTA || null,
            usuario: user.USUARIO || null,
            correo: user.CORREO || null,
            idEstado: user.ID_ESTADO_CUENTA || null,
            estado: user.ESTADO_CUENTA || null
        } : null,
        direccion: user.ID_DIRECCION ? {
            idDireccion: user.ID_DIRECCION,
            idPais: user.ID_PAIS,
            pais: user.PAIS,
            idProvincia: user.ID_PROVINCIA,
            provincia: user.PROVINCIA,
            idCanton: user.ID_CANTON,
            canton: user.CANTON,
            idDistrito: user.ID_DISTRITO,
            distrito: user.DISTRITO,
            calle: user.CALLE,
            numero: user.NUMERO
        } : null
    };
}

async function createDashboardUser(userData) {
    const normalizedUsername = String(userData.usuario || '').trim();
    const normalizedEmail = String(userData.correo || '').trim();

    const existingAccount = await userRepository.findAccountByUsuario(normalizedUsername);
    if (existingAccount) {
        throw createHttpError('Username already exists', 409);
    }

    const existingEmail = await emailRepository.findEmailByAddress(normalizedEmail);
    if (existingEmail) {
        throw createHttpError('Email already exists', 409);
    }

    const existingUser = await userRepository.findByIdentification(userData.identificacion);
    if (existingUser) {
        throw createHttpError('User already exists', 409);
    }

    const districtHierarchy = await locationRepository.findDistrictHierarchy({
        idPais: userData.idPais,
        idProvincia: userData.idProvincia,
        idCanton: userData.idCanton,
        idDistrito: userData.idDistrito
    });

    if (!districtHierarchy) {
        throw createHttpError('The selected country, province, canton, and district combination is invalid', 400);
    }

    const address = await addressService.createAddress({
        idDistrito: userData.idDistrito,
        calle: userData.calle,
        numero: userData.numero
    });

    await userRepository.createUser({
        identificacion: userData.identificacion,
        nombre: userData.nombre,
        apellidoPaterno: userData.apellidoPaterno,
        apellidoMaterno: userData.apellidoMaterno,
        idDireccion: address.idDireccion,
        idTipoUsuario: userData.idTipoUsuario,
        idEstado: userData.idEstado
    });

    const passwordHash = await bcrypt.hash(userData.password, 10);

    await userRepository.createAccount({
        identificacion: userData.identificacion,
        usuario: normalizedUsername,
        passwordHash,
        idEstado: userData.idEstado
    });
    await emailRepository.createEmail({
        identificacion: userData.identificacion,
        correo: normalizedEmail,
        idEstado: userData.idEstado
    });

    invalidateUserCache(userData.identificacion);
    return getUserByIdentification(userData.identificacion);
}

async function updateDashboardUser(identificacion, userData, actorAccount) {
    const existingUser = await userRepository.findUserDetailsByIdentification(identificacion);
    if (!existingUser) {
        throw createHttpError('User not found', 404);
    }

    ensureActiveAdminIsNotEditingSelf(actorAccount, existingUser);

    const normalizedUsername = String(userData.usuario || '').trim();
    const normalizedEmail = String(userData.correo || '').trim();
    const accountWithSameUsername = await userRepository.findAccountByUsuario(normalizedUsername);
    if (accountWithSameUsername && hasDifferentIdentification(accountWithSameUsername.IDENTIFICACION, identificacion)) {
        throw createHttpError('Username already exists', 409);
    }

    const emailWithSameAddress = await emailRepository.findEmailByAddress(normalizedEmail);
    if (emailWithSameAddress && hasDifferentIdentification(emailWithSameAddress.IDENTIFICACION, identificacion)) {
        throw createHttpError('Email already exists', 409);
    }

    const existingPrimaryEmail = await getPrimaryEmailByIdentification(identificacion);
    if (existingPrimaryEmail && normalizedEmail && !hasSameEmail(existingPrimaryEmail.CORREO, normalizedEmail)) {
        throw createHttpError('Use the emails module to add or change email addresses for this user', 400);
    }

    const districtHierarchy = await locationRepository.findDistrictHierarchy({
        idPais: userData.idPais,
        idProvincia: userData.idProvincia,
        idCanton: userData.idCanton,
        idDistrito: userData.idDistrito
    });

    if (!districtHierarchy) {
        throw createHttpError('The selected country, province, canton, and district combination is invalid', 400);
    }

    await userRepository.updateAddress({
        idDireccion: existingUser.ID_DIRECCION,
        idDistrito: userData.idDistrito,
        calle: userData.calle,
        numero: userData.numero,
        idEstado: userData.idEstado
    });

    await userRepository.updateUser({
        identificacion,
        nombre: userData.nombre,
        apellidoPaterno: userData.apellidoPaterno,
        apellidoMaterno: userData.apellidoMaterno,
        idDireccion: existingUser.ID_DIRECCION,
        idTipoUsuario: userData.idTipoUsuario,
        idEstado: userData.idEstado
    });

    if (existingUser.ID_CUENTA) {
        await userRepository.updateAccount({
            idCuenta: existingUser.ID_CUENTA,
            identificacion,
            usuario: normalizedUsername,
            passwordHash: userData.password
                ? await bcrypt.hash(userData.password, 10)
                : existingUser.PASSWORD_HASH,
            idEstado: userData.idEstado
        });
    } else {
        if (!userData.password) {
            throw createHttpError('Password is required to create the missing account for this user', 400);
        }

        await userRepository.createAccount({
            identificacion,
            usuario: normalizedUsername,
            passwordHash: await bcrypt.hash(userData.password, 10),
            idEstado: userData.idEstado
        });
    }

    if (normalizedEmail && !existingPrimaryEmail) {
        await emailRepository.createEmail({
            identificacion,
            correo: normalizedEmail,
            idEstado: userData.idEstado
        });
    }

    invalidateUserCache(identificacion);
    return getUserByIdentification(identificacion);
}

async function deleteDashboardUser(identificacion, actorAccount) {
    const existingUser = await userRepository.findUserDetailsByIdentification(identificacion);
    if (!existingUser) {
        throw createHttpError('User not found', 404);
    }

    ensureActiveAdminIsNotEditingSelf(actorAccount, existingUser);

    await userRepository.deleteAccount(existingUser.ID_CUENTA);
    await userRepository.deleteUser(identificacion);

    if (existingUser.ID_DIRECCION) {
        await userRepository.deleteAddress(existingUser.ID_DIRECCION);
    }

    invalidateUserCache(identificacion);
}

async function signIn(identifier, password, requestMetadata = {}) {
    const account = await findAccountByLoginIdentifier(identifier);
    if (!account) {
        throw createHttpError('Invalid credentials', 401);
    }

    if (!isAvailableAccountState(account.ID_ESTADO)) {
        throw createHttpError('Account is not available', 403);
    }

    const passwordValidation = await verifyStoredPassword(password, account.PASSWORD_HASH);
    if (!passwordValidation.isValid) {
        throw createHttpError('Invalid credentials', 401);
    }

    if (passwordValidation.needsMigration) {
        await userRepository.updateAccount({
            idCuenta: account.ID_CUENTA,
            identificacion: account.IDENTIFICACION,
            usuario: account.USUARIO,
            passwordHash: await bcrypt.hash(password, 10),
            idEstado: account.ID_ESTADO
        });
    }

    return buildSessionTokens(account, requestMetadata);
}

async function verifyEmail(correo, code) {
    const normalizedEmail = String(correo || '').trim();
    const { account, emailRecord } = await findAccountContextByEmail(normalizedEmail);
    if (!account) {
        throw createHttpError('Account not found', 404);
    }

    const verificationOtpTypeId = await getEmailVerificationOtpTypeId();
    const otp = await userRepository.findOTPByCodeAndCuenta(
        code,
        account.ID_CUENTA,
        verificationOtpTypeId
    );
    if (!otp) {
        throw createHttpError('Invalid or expired verification code', 400);
    }

    await userRepository.markOTPAsUsed(otp.ID_CODIGO_OTP);

    if (emailRecord && !isActiveState(emailRecord.ID_ESTADO)) {
        await emailRepository.updateEmail({
            identificacion: emailRecord.IDENTIFICACION,
            correo: emailRecord.CORREO,
            idEstado: ACTIVE_STATE_ID
        });
    }

    await userRepository.updateAccountStatus(account.ID_CUENTA, ACTIVE_STATE_ID);
    invalidateUserCache(account.IDENTIFICACION);

    return { message: 'Email verified successfully' };
}

async function resendVerificationEmail(correo) {
    const normalizedEmail = String(correo || '').trim();
    const { account, emailRecord } = await findAccountContextByEmail(normalizedEmail);
    if (!account) {
        throw createHttpError('Account not found', 404);
    }

    if (isActiveState(emailRecord?.ID_ESTADO)) {
        throw createHttpError('Account is already verified', 409);
    }

    const emailSent = await generateAndSendVerificationOtp(
        { ...account, CORREO: normalizedEmail },
        { failOnEmailError: true }
    );

    return {
        emailSent,
        message: 'A new verification code has been sent to your email.'
    };
}

async function refreshSession(rawRefreshToken, requestMetadata = {}) {
    if (!rawRefreshToken) {
        throw createHttpError('Refresh token is required', 401);
    }

    const { decodedRefreshToken, refreshTokenRecord } = await findStoredRefreshToken(rawRefreshToken);
    const account = await userRepository.findAccountByIdCuenta(decodedRefreshToken.idCuenta);

    if (!account || !isAvailableAccountState(account.ID_ESTADO)) {
        await revokeStoredRefreshToken(refreshTokenRecord);
        throw createHttpError('Account is not available', 403);
    }

    await revokeStoredRefreshToken(refreshTokenRecord);

    return buildSessionTokens(account, requestMetadata);
}

async function logout(rawRefreshToken) {
    if (!rawRefreshToken) {
        return;
    }

    try {
        const { refreshTokenRecord } = await findStoredRefreshToken(rawRefreshToken);
        await revokeStoredRefreshToken(refreshTokenRecord);
    } catch (error) {
        if (error?.statusCode === 401) {
            return;
        }

        throw error;
    }
}

module.exports = {
    getUsers,
    getUserByIdentification,
    getCurrentUser,
    signUp,
    signIn,
    refreshSession,
    logout,
    verifyEmail,
    resendVerificationEmail,
    createDashboardUser,
    updateDashboardUser,
    deleteDashboardUser,
    invalidateAllUserCaches: () => invalidateUserCache()
};
