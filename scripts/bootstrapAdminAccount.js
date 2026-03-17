require('dotenv').config();

const bcrypt = require('bcrypt');
const userRepository = require('../src/repositories/userRepository');
const { initializePool, closePool } = require('../src/config/db');

function slugifyAccountSegment(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '.')
        .replace(/^\.+|\.+$/g, '');
}

function buildDefaultUsername(adminUser) {
    const firstName = slugifyAccountSegment(adminUser.NOMBRE);
    const lastName = slugifyAccountSegment(adminUser.APELLIDO_PATERNO);
    const base = [firstName, lastName].filter(Boolean).join('.');
    return base || `admin.${adminUser.IDENTIFICACION}`;
}

async function main() {
    await initializePool();

    try {
        const users = await userRepository.findAllUsers();
        const adminWithAccount = users.find((user) => user.ID_TIPO_USUARIO === 1 && user.ID_CUENTA);

        if (adminWithAccount) {
            console.log('An admin account already exists.');
            console.log(JSON.stringify({
                identificacion: adminWithAccount.IDENTIFICACION,
                usuario: adminWithAccount.CORREO
            }, null, 2));
            return;
        }

        const adminUser = users.find((user) => user.ID_TIPO_USUARIO === 1);
        if (!adminUser) {
            throw new Error('No admin user record exists. Seed or create an admin user first.');
        }

        const username = process.env.BOOTSTRAP_ADMIN_USERNAME || buildDefaultUsername(adminUser);
        const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || 'Admin#2026';

        await userRepository.createAccount({
            identificacion: adminUser.IDENTIFICACION,
            usuario: username,
            passwordHash: await bcrypt.hash(password, 10),
            idEstado: adminUser.ID_ESTADO || 1
        });

        console.log('Admin account created successfully.');
        console.log(JSON.stringify({
            identificacion: adminUser.IDENTIFICACION,
            usuario: username,
            password
        }, null, 2));
    } finally {
        await closePool();
    }
}

main().catch((error) => {
    console.error('Admin bootstrap failed.');
    console.error(error);
    process.exit(1);
});
