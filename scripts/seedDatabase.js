require('dotenv').config();

const fs = require('fs/promises');
const path = require('path');
const { getConnection, initializePool, closePool } = require('../src/config/db');
const userRepository = require('../src/repositories/userRepository');
const catalogRepository = require('../src/repositories/catalogRepository');
const locationRepository = require('../src/repositories/locationRepository');

const INSERTS_FILE_PATH = path.resolve(__dirname, '../src/resources/inserts.sql');
const PACKAGE_PREFIX = 'KALO.FIDE_KALO_PKG.';

function prefixPackageProcedures(sqlText) {
    return sqlText.replace(/\b(FIDE_[A-Z0-9_]+_SP)\s*\(/g, `${PACKAGE_PREFIX}$1(`);
}

function extractProcedureCalls(sqlText) {
    const lines = sqlText.split(/\r?\n/);
    const procedureCalls = [];
    let currentCall = [];
    let insideBlock = false;

    for (const rawLine of lines) {
        const line = rawLine.trim();

        if (!insideBlock) {
            if (/^BEGIN\b/i.test(line)) {
                insideBlock = true;
            }
            continue;
        }

        if (!line || line === '/' || line.startsWith('--')) {
            continue;
        }

        if (/^END;?$/i.test(line)) {
            break;
        }

        currentCall.push(line);

        if (line.endsWith(';')) {
            procedureCalls.push(currentCall.join(' ').replace(/;$/, ''));
            currentCall = [];
        }
    }

    if (currentCall.length) {
        throw new Error('Unterminated procedure call found while parsing inserts.sql');
    }

    return procedureCalls;
}

async function getCurrentDataSnapshot() {
    const [users, userTypes, countries] = await Promise.all([
        userRepository.findAllUsers(),
        catalogRepository.findUserTypes(),
        locationRepository.findCountries()
    ]);

    return {
        usersCount: users.length,
        userTypesCount: userTypes.length,
        countriesCount: countries.length
    };
}

async function seedDatabase() {
    const sqlText = await fs.readFile(INSERTS_FILE_PATH, 'utf8');
    const procedureCalls = extractProcedureCalls(prefixPackageProcedures(sqlText));

    let connection;

    try {
        connection = await getConnection();

        for (const procedureCall of procedureCalls) {
            await connection.execute(`BEGIN ${procedureCall}; END;`, {}, { autoCommit: true });
        }
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function main() {
    await initializePool();

    try {
        const before = await getCurrentDataSnapshot();

        if (before.usersCount > 0 || before.userTypesCount > 0 || before.countriesCount > 0) {
            throw new Error(
                `Database is not empty. Current counts: ${JSON.stringify(before)}`
            );
        }

        await seedDatabase();

        const after = await getCurrentDataSnapshot();
        console.log('Seed completed successfully.');
        console.log(JSON.stringify(after, null, 2));
    } finally {
        await closePool();
    }
}

main().catch((error) => {
    console.error('Database seed failed.');
    console.error(error);
    process.exit(1);
});
