const bcrypt = require('bcrypt');
const crypto = require('crypto');
const addressService = require('./addressService');
const locationRepository = require('../repositories/locationRepository');
const userRepository = require('../repositories/userRepository');
const { generateAccessToken, generateRefreshToken } = require('../config/jwt');
const { sendVerificationEmail } = require('../config/email');

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

async function generateAndSendVerificationOtp(account, { failOnEmailError = false } = {}) {
    await userRepository.deactivateActiveOtpsByCuenta(account.ID_CUENTA);

    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const hashedCode = await bcrypt.hash(verificationCode, 10);

    const otpData = {
        idCuenta: account.ID_CUENTA,
        idTipoOtp: 1,
        codigoHash: hashedCode,
        fechaExpiracion: new Date(Date.now() + 24 * 60 * 60 * 1000),
        fechaUso: null,
        intentos: 0,
        fechaCreacion: new Date(),
        idEstado: 1
    };

    await userRepository.createOTP(otpData);

    const emailSent = await sendVerificationEmail(account.USUARIO, verificationCode);
    if (!emailSent && failOnEmailError) {
        throw createHttpError('Failed to send verification email', 502);
    }

    return emailSent;
}

async function getUsers() {
    const users = await userRepository.findAllUsers();
    return users.map(formatDashboardUser);
}

async function getUserByIdentification(identificacion) {
    const user = await userRepository.findUserDetailsByIdentification(identificacion);

    if (!user) {
        throw createHttpError('User not found', 404);
    }

    return formatDashboardUser(user);
}

async function getCurrentUser(idCuenta) {
    const account = await userRepository.findAccountByIdCuenta(idCuenta);
    if (!account) {
        throw createHttpError('Account not found', 404);
    }

    return {
        identificacion: account.IDENTIFICACION,
        nombre: account.NOMBRE,
        apellidoPaterno: account.APELLIDO_PATERNO,
        apellidoMaterno: account.APELLIDO_MATERNO,
        correo: account.USUARIO,
        idTipoUsuario: account.ID_TIPO_USUARIO,
        tipoUsuario: account.TIPO_USUARIO
    };
}

async function signUp(userData) {
    const existingAccount = await userRepository.findAccountByUsuario(userData.correo);
    if (existingAccount) {
        throw createHttpError('Account already exists', 409);
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

    const newUser = {
        ...userData,
        idDireccion: address.idDireccion,
        idEstado: 1, // Active
        idTipoUsuario: 11 // Cliente
    };

    const userResult = await userRepository.createUser(newUser);

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const accountData = {
        identificacion: userResult.identificacion,
        usuario: userData.correo,
        passwordHash: hashedPassword,
        idEstado: 3 // Pending verification
    };

    const accountResult = await userRepository.createAccount(accountData);
    const account = {
        ID_CUENTA: accountResult.idCuenta,
        USUARIO: userData.correo
    };
    const emailSent = await generateAndSendVerificationOtp(account);

    return {
        user: {
            identificacion: userResult.identificacion,
            nombre: newUser.nombre,
            apellidoPaterno: newUser.apellidoPaterno,
            apellidoMaterno: newUser.apellidoMaterno,
            correo: userData.correo
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
        cuenta: user.ID_CUENTA ? {
            idCuenta: user.ID_CUENTA,
            correo: user.CORREO,
            idEstado: user.ID_ESTADO_CUENTA,
            estado: user.ESTADO_CUENTA
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
    const existingAccount = await userRepository.findAccountByUsuario(userData.correo);
    if (existingAccount) {
        throw createHttpError('Account already exists', 409);
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
        usuario: userData.correo,
        passwordHash,
        idEstado: userData.idEstado
    });

    return getUserByIdentification(userData.identificacion);
}

async function updateDashboardUser(identificacion, userData, actorAccount) {
    const existingUser = await userRepository.findUserDetailsByIdentification(identificacion);
    if (!existingUser) {
        throw createHttpError('User not found', 404);
    }

    ensureActiveAdminIsNotEditingSelf(actorAccount, existingUser);

    const accountWithSameEmail = await userRepository.findAccountByUsuario(userData.correo.trim());
    if (accountWithSameEmail && hasDifferentIdentification(accountWithSameEmail.IDENTIFICACION, identificacion)) {
        throw createHttpError('Account already exists', 409);
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

    await userRepository.updateAccount({
        idCuenta: existingUser.ID_CUENTA,
        identificacion,
        usuario: userData.correo,
        passwordHash: userData.password
            ? await bcrypt.hash(userData.password, 10)
            : existingUser.PASSWORD_HASH,
        idEstado: userData.idEstado
    });

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
}

async function signIn(correo, password) {
    const account = await userRepository.findAccountByUsuario(correo);
    if (!account) {
        throw createHttpError('Invalid credentials', 401);
    }

    if (account.ID_ESTADO !== 1) {
        throw createHttpError('Account not verified. Please check your email for verification code.', 403);
    }

    const isValidPassword = await bcrypt.compare(password, account.PASSWORD_HASH);
    if (!isValidPassword) {
        throw createHttpError('Invalid credentials', 401);
    }

    const payload = { identificacion: account.IDENTIFICACION, idCuenta: account.ID_CUENTA };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
        user: {
            identificacion: account.IDENTIFICACION,
            nombre: account.NOMBRE,
            apellidoPaterno: account.APELLIDO_PATERNO,
            apellidoMaterno: account.APELLIDO_MATERNO,
            correo: account.USUARIO,
            idTipoUsuario: account.ID_TIPO_USUARIO,
            tipoUsuario: account.TIPO_USUARIO
        },
        accessToken,
        refreshToken
    };
}

async function verifyEmail(correo, code) {
    const account = await userRepository.findAccountByUsuario(correo);
    if (!account) {
        throw createHttpError('Account not found', 404);
    }

    const otp = await userRepository.findOTPByCodeAndCuenta(code, account.ID_CUENTA);
    if (!otp) {
        throw createHttpError('Invalid or expired verification code', 400);
    }

    await userRepository.markOTPAsUsed(otp.ID_CODIGO_OTP);

    await userRepository.updateAccountStatus(account.ID_CUENTA, 1); // Active

    return { message: 'Email verified successfully' };
}

async function resendVerificationEmail(correo) {
    const account = await userRepository.findAccountByUsuario(correo);
    if (!account) {
        throw createHttpError('Account not found', 404);
    }

    if (account.ID_ESTADO === 1) {
        throw createHttpError('Account is already verified', 409);
    }

    const emailSent = await generateAndSendVerificationOtp(account, { failOnEmailError: true });

    return {
        emailSent,
        message: 'A new verification code has been sent to your email.'
    };
}

module.exports = {
    getUsers,
    getUserByIdentification,
    getCurrentUser,
    signUp,
    signIn,
    verifyEmail,
    resendVerificationEmail,
    createDashboardUser,
    updateDashboardUser,
    deleteDashboardUser
};
