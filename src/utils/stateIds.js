const ACTIVE_STATE_ID = 1;
const INACTIVE_STATE_ID = 2;
const PENDING_STATE_ID = 3;

function isActiveState(idEstado) {
    return Number(idEstado) === ACTIVE_STATE_ID;
}

function isInactiveState(idEstado) {
    return Number(idEstado) === INACTIVE_STATE_ID;
}

function isPendingState(idEstado) {
    return Number(idEstado) === PENDING_STATE_ID;
}

module.exports = {
    ACTIVE_STATE_ID,
    INACTIVE_STATE_ID,
    PENDING_STATE_ID,
    isActiveState,
    isInactiveState,
    isPendingState
};
