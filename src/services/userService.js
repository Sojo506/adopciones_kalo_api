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
    return userRepository.findAllUsers();
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
        correo: account.USUARIO
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
        idTipoUsuario: 1 // ADMIN DE MOMENTO
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
            correo: account.USUARIO
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

module.exports = { getUsers, getCurrentUser, signUp, signIn, verifyEmail, resendVerificationEmail };
