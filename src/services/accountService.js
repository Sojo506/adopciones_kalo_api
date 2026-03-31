const bcrypt = require('bcrypt');
const accountRepository = require('../repositories/accountRepository');
const catalogService = require('./catalogService');
const userRepository = require('../repositories/userRepository');
const userService = require('./userService');
const MemoryCache = require('../utils/memoryCache');

const ACCOUNT_LIST_CACHE_KEY = 'account:list';
const ACCOUNT_DETAIL_CACHE_PREFIX = 'account:detail:';
const ACCOUNT_CACHE_TTL_MS = Number(process.env.ACCOUNT_CACHE_TTL_MS || 15000);
const INACTIVE_STATE_ID = 2;
const accountQueryCache = new MemoryCache({ defaultTtlMs: ACCOUNT_CACHE_TTL_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function getAccountDetailCacheKey(idCuenta) {
    return `${ACCOUNT_DETAIL_CACHE_PREFIX}${String(idCuenta).trim()}`;
}

function invalidateAccountCache(idCuenta) {
    accountQueryCache.delete(ACCOUNT_LIST_CACHE_KEY);

    if (idCuenta !== undefined && idCuenta !== null) {
        accountQueryCache.delete(getAccountDetailCacheKey(idCuenta));
        return;
    }

    accountQueryCache.clearByPrefix(ACCOUNT_DETAIL_CACHE_PREFIX);
}

function buildAccountUserName(account) {
    if (account.USUARIO_NOMBRE) {
        return account.USUARIO_NOMBRE;
    }

    return [account.NOMBRE, account.APELLIDO_PATERNO, account.APELLIDO_MATERNO]
        .filter(Boolean)
        .join(' ');
}

function formatAccount(account, stateName = account.ESTADO) {
    return {
        idCuenta: account.ID_CUENTA,
        identificacion: account.IDENTIFICACION,
        usuarioNombre: buildAccountUserName(account) || null,
        usuario: account.USUARIO,
        fechaRegistro: account.FECHA_REGISTRO,
        idEstado: account.ID_ESTADO,
        estado: stateName || null,
        idTipoUsuario: account.ID_TIPO_USUARIO || null,
        tipoUsuario: account.TIPO_USUARIO || null
    };
}

async function getStateName(idEstado) {
    const states = await catalogService.getStates();
    const state = states.find((item) => Number(item.idEstado) === Number(idEstado));
    return state?.nombre || null;
}

async function ensureStateExists(idEstado) {
    const stateName = await getStateName(idEstado);

    if (!stateName) {
        throw createHttpError('State not found', 400);
    }

    return stateName;
}

async function ensureUserExists(identificacion) {
    const user = await userRepository.findByIdentification(identificacion);

    if (!user) {
        throw createHttpError('User not found', 404);
    }

    return user;
}

function ensureActiveAdminIsNotEditingSelf(actorAccount, targetAccount) {
    if (
        actorAccount &&
        targetAccount &&
        Number(actorAccount.ID_CUENTA) === Number(targetAccount.ID_CUENTA)
    ) {
        throw createHttpError('The active admin user cannot be modified or deleted', 403);
    }
}

async function invalidateRelatedCaches(idCuenta = null) {
    invalidateAccountCache(idCuenta);
    userService.invalidateAllUserCaches();
}

async function getAccounts() {
    return accountQueryCache.getOrSet(ACCOUNT_LIST_CACHE_KEY, async () => {
        const accounts = await accountRepository.findAllAccounts();
        return accounts.map((account) => formatAccount(account));
    });
}

async function getAccountById(idCuenta) {
    return accountQueryCache.getOrSet(getAccountDetailCacheKey(idCuenta), async () => {
        const account = await accountRepository.findAccountById(idCuenta);

        if (!account) {
            throw createHttpError('Account not found', 404);
        }

        const stateName = await getStateName(account.ID_ESTADO);
        return formatAccount(account, stateName);
    });
}

async function createAccount(accountData) {
    const payload = {
        identificacion: Number(accountData.identificacion),
        usuario: String(accountData.usuario || '').trim(),
        password: String(accountData.password || ''),
        idEstado: Number(accountData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureUserExists(payload.identificacion);

    const existingAccountByUsuario = await accountRepository.findAccountByUsuario(payload.usuario);
    if (existingAccountByUsuario) {
        throw createHttpError('Username already exists', 409);
    }

    const existingAccountByUser = await accountRepository.findAccountByIdentification(payload.identificacion);
    if (existingAccountByUser) {
        throw createHttpError('User already has an account', 409);
    }

    const result = await accountRepository.createAccount({
        identificacion: payload.identificacion,
        usuario: payload.usuario,
        passwordHash: await bcrypt.hash(payload.password, 10),
        idEstado: payload.idEstado
    });

    await invalidateRelatedCaches(result.idCuenta);
    return getAccountById(result.idCuenta);
}

async function updateAccount(idCuenta, accountData, actorAccount) {
    const existingAccount = await accountRepository.findAccountById(idCuenta);
    if (!existingAccount) {
        throw createHttpError('Account not found', 404);
    }

    ensureActiveAdminIsNotEditingSelf(actorAccount, existingAccount);

    const payload = {
        idCuenta: Number(idCuenta),
        identificacion: Number(accountData.identificacion),
        usuario: String(accountData.usuario || '').trim(),
        password: String(accountData.password || ''),
        idEstado: Number(accountData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureUserExists(payload.identificacion);

    const accountWithSameUsername = await accountRepository.findAccountByUsuario(payload.usuario);
    if (accountWithSameUsername && Number(accountWithSameUsername.ID_CUENTA) !== payload.idCuenta) {
        throw createHttpError('Username already exists', 409);
    }

    const accountForSameUser = await accountRepository.findAccountByIdentification(payload.identificacion);
    if (accountForSameUser && Number(accountForSameUser.ID_CUENTA) !== payload.idCuenta) {
        throw createHttpError('User already has an account', 409);
    }

    await accountRepository.updateAccount({
        idCuenta: payload.idCuenta,
        identificacion: payload.identificacion,
        usuario: payload.usuario,
        passwordHash: payload.password
            ? await bcrypt.hash(payload.password, 10)
            : existingAccount.PASSWORD_HASH,
        idEstado: payload.idEstado
    });

    if (
        Number(payload.idEstado) === INACTIVE_STATE_ID &&
        Number(existingAccount.ID_ESTADO) !== INACTIVE_STATE_ID
    ) {
        await userService.forceLogoutAccountSessions(payload.idCuenta, 'account_inactivated');
    }

    await invalidateRelatedCaches(payload.idCuenta);
    return getAccountById(payload.idCuenta);
}

async function deleteAccount(idCuenta, actorAccount) {
    const existingAccount = await accountRepository.findAccountById(idCuenta);
    if (!existingAccount) {
        throw createHttpError('Account not found', 404);
    }

    ensureActiveAdminIsNotEditingSelf(actorAccount, existingAccount);

    await userService.forceLogoutAccountSessions(existingAccount.ID_CUENTA, 'account_deleted');
    await accountRepository.deleteAccount(idCuenta);
    await invalidateRelatedCaches(idCuenta);
}

module.exports = {
    getAccounts,
    getAccountById,
    createAccount,
    updateAccount,
    deleteAccount
};
