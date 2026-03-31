const connectionsByAccount = new Map();
const HEARTBEAT_INTERVAL_MS = Number(process.env.AUTH_EVENT_HEARTBEAT_MS || 25000);

let nextConnectionId = 1;

function writeEvent(res, eventName, payload) {
    if (res.writableEnded) {
        return;
    }

    res.write(`event: ${eventName}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function removeConnection(idCuenta, connectionId) {
    const bucket = connectionsByAccount.get(idCuenta);
    if (!bucket) {
        return;
    }

    bucket.delete(connectionId);

    if (bucket.size === 0) {
        connectionsByAccount.delete(idCuenta);
    }
}

function registerAccountConnection(idCuenta, res) {
    const normalizedIdCuenta = Number(idCuenta);
    const connectionId = nextConnectionId++;
    const heartbeat = setInterval(() => {
        if (!res.writableEnded) {
            res.write(`: keep-alive ${Date.now()}\n\n`);
        }
    }, HEARTBEAT_INTERVAL_MS);

    if (!connectionsByAccount.has(normalizedIdCuenta)) {
        connectionsByAccount.set(normalizedIdCuenta, new Map());
    }

    connectionsByAccount.get(normalizedIdCuenta).set(connectionId, { res, heartbeat });
    writeEvent(res, 'session-ready', { ok: true });

    let isClosed = false;

    return () => {
        if (isClosed) {
            return;
        }

        isClosed = true;
        clearInterval(heartbeat);
        removeConnection(normalizedIdCuenta, connectionId);
    };
}

function broadcastForceLogout(idCuenta, payload = {}) {
    const normalizedIdCuenta = Number(idCuenta);
    const bucket = connectionsByAccount.get(normalizedIdCuenta);

    if (!bucket || bucket.size === 0) {
        return 0;
    }

    const activeConnections = Array.from(bucket.entries());

    for (const [connectionId, connection] of activeConnections) {
        clearInterval(connection.heartbeat);
        writeEvent(connection.res, 'force-logout', payload);
        connection.res.end();
        removeConnection(normalizedIdCuenta, connectionId);
    }

    return activeConnections.length;
}

module.exports = {
    registerAccountConnection,
    broadcastForceLogout
};
