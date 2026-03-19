const oracledb = require('oracledb');

const OUT_CURSOR_BIND_NAME = 'outCursor';
const FETCH_BATCH_SIZE = Number(process.env.ORACLE_FETCH_BATCH_SIZE || 250);
const DB_OBJECT_SCHEMA = process.env.DB_OBJECT_SCHEMA || 'KALO';

async function fetchRowsFromCursor(resultSet) {
    const rows = [];
    const columnNames = resultSet.metaData?.map((column) => column.name) || [];

    while (true) {
        const batch = await resultSet.getRows(FETCH_BATCH_SIZE);
        if (!batch.length) {
            break;
        }

        rows.push(
            ...batch.map((row) => {
                if (!Array.isArray(row)) {
                    return row;
                }

                return Object.fromEntries(
                    columnNames.map((columnName, index) => [columnName, row[index]])
                );
            })
        );
    }

    return rows;
}

function assertSafeSequenceName(sequenceName) {
    if (!/^[A-Z0-9_$.]+$/i.test(sequenceName)) {
        throw new Error(`Unsafe Oracle sequence name: ${sequenceName}`);
    }
}

function qualifyDbObjectName(objectName) {
    if (objectName.includes('.')) {
        return objectName;
    }

    return `${DB_OBJECT_SCHEMA}.${objectName}`;
}

async function getCurrentSequenceValue(connection, sequenceName) {
    const qualifiedSequenceName = qualifyDbObjectName(sequenceName);
    assertSafeSequenceName(qualifiedSequenceName);

    const result = await connection.execute(
        `SELECT ${qualifiedSequenceName}.CURRVAL AS ID FROM DUAL`,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows?.[0]?.ID ?? null;
}

module.exports = {
    OUT_CURSOR_BIND_NAME,
    fetchRowsFromCursor,
    getCurrentSequenceValue,
    qualifyDbObjectName
};
