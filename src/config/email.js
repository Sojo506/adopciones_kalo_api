const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

async function sendVerificationEmail(to, code) {
    const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM}>`,
        to: to,
        subject: 'Verificación de Correo - Adopciones KALO',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Verificación de Correo Electrónico</h2>
                <p>¡Bienvenido a Adopciones KALO!</p>
                <p>Para completar tu registro, por favor verifica tu correo electrónico usando el siguiente código:</p>
                <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #007bff; font-size: 32px; margin: 0;">${code}</h1>
                </div>
                <p>Este código expirará en 24 horas.</p>
                <p>Si no solicitaste esta verificación, ignora este mensaje.</p>
                <br>
                <p>Saludos,<br>Equipo de Adopciones KALO</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

module.exports = { sendVerificationEmail };