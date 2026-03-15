const oracledb = require('oracledb');
require('dotenv').config();

async function getConnection() {

  try {

    const connection = await oracledb.getConnection({

      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      configDir: process.env.WALLET_DIR,
      walletLocation: process.env.WALLET_DIR,
      walletPassword: process.env.DB_WALLET_PASSWORD,
      sslServerDnMatch: true

    });

    return connection;

  } catch (err) {

    console.error(err);

    throw err;

  }

}

module.exports = { getConnection };