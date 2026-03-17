const oracledb = require('oracledb');
require('dotenv').config();

const POOL_ALIAS = 'kaloPool';
let poolInitializationPromise = null;

function getExistingPool() {
  try {
    return oracledb.getPool(POOL_ALIAS);
  } catch (error) {
    return null;
  }
}

function buildPoolConfig() {
  return {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING,
    configDir: process.env.WALLET_DIR,
    walletLocation: process.env.WALLET_DIR,
    walletPassword: process.env.DB_WALLET_PASSWORD,
    sslServerDnMatch: true,
    poolAlias: POOL_ALIAS,
    poolMin: Number(process.env.DB_POOL_MIN || 1),
    poolMax: Number(process.env.DB_POOL_MAX || 10),
    poolIncrement: Number(process.env.DB_POOL_INCREMENT || 1),
    poolTimeout: Number(process.env.DB_POOL_TIMEOUT || 60),
    queueTimeout: Number(process.env.DB_QUEUE_TIMEOUT || 15000),
    stmtCacheSize: Number(process.env.DB_STMT_CACHE_SIZE || 40)
  };
}

async function initializePool() {
  const existingPool = getExistingPool();
  if (existingPool) {
    return existingPool;
  }

  if (!poolInitializationPromise) {
    poolInitializationPromise = oracledb.createPool(buildPoolConfig())
      .catch((error) => {
        poolInitializationPromise = null;
        throw error;
      });
  }

  return poolInitializationPromise;
}

async function getPool() {
  return getExistingPool() || initializePool();
}

async function getConnection() {
  try {
    const pool = await getPool();
    const connection = await pool.getConnection();

    return connection;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function closePool(drainTimeInSeconds = 10) {
  const existingPool = getExistingPool();
  if (!existingPool) {
    poolInitializationPromise = null;
    return;
  }

  await existingPool.close(drainTimeInSeconds);
  poolInitializationPromise = null;
}

module.exports = { initializePool, getConnection, closePool };
