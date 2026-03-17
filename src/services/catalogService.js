const catalogRepository = require('../repositories/catalogRepository');

async function getUserTypes() {
    const userTypes = await catalogRepository.findUserTypes();
    return userTypes.map((userType) => ({
        idTipoUsuario: userType.ID_TIPO_USUARIO,
        nombre: userType.NOMBRE,
        idEstado: userType.ID_ESTADO
    }));
}

async function getStates() {
    const states = await catalogRepository.findStates();
    return states.map((state) => ({
        idEstado: state.ID_ESTADO,
        nombre: state.NOMBRE_ESTADO
    }));
}

module.exports = { getUserTypes, getStates };
