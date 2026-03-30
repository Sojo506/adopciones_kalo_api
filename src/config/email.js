const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

function buildOtpEmailHtml({
    title,
    headline,
    intro,
    code,
    expiresInText,
    accentColor = '#007bff'
}) {
    return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>${title}</h2>
                <p>${headline}</p>
                <p>${intro}</p>
                <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
                    <h1 style="color: ${accentColor}; font-size: 32px; margin: 0;">${code}</h1>
                </div>
                <p>Este codigo expirara en ${expiresInText}.</p>
                <p>Si no solicitaste esta operacion, ignora este mensaje.</p>
                <br>
                <p>Saludos,<br>Equipo de Adopciones KALO</p>
            </div>
        `;
}

async function sendOtpEmail({ to, subject, title, headline, intro, code, expiresInText, accentColor }) {
    const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM}>`,
        to,
        subject,
        html: buildOtpEmailHtml({
            title,
            headline,
            intro,
            code,
            expiresInText,
            accentColor
        })
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

async function sendVerificationEmail(to, code) {
    return sendOtpEmail({
        to,
        subject: 'Verificacion de correo - Adopciones KALO',
        title: 'Verificacion de correo electronico',
        headline: 'Bienvenido a Adopciones KALO.',
        intro: 'Para completar tu registro, verifica tu correo con el siguiente codigo.',
        code,
        expiresInText: '24 horas',
        accentColor: '#007bff'
    });
}

async function sendEmailChangeOtpEmail(to, code, ttlMinutes) {
    return sendOtpEmail({
        to,
        subject: 'Confirmacion de cambio de correo - Adopciones KALO',
        title: 'Confirma tu nuevo correo',
        headline: 'Recibimos una solicitud para cambiar el correo de tu cuenta.',
        intro: 'Ingresa este codigo para confirmar que deseas usar esta direccion como nuevo correo principal.',
        code,
        expiresInText: `${ttlMinutes} minutos`,
        accentColor: '#2e6da4'
    });
}

async function sendPasswordChangeOtpEmail(to, code, ttlMinutes) {
    return sendOtpEmail({
        to,
        subject: 'Confirmacion de cambio de contrasena - Adopciones KALO',
        title: 'Confirma el cambio de tu contrasena',
        headline: 'Recibimos una solicitud para actualizar la contrasena de tu cuenta.',
        intro: 'Usa este codigo para autorizar el cambio. Si no fuiste tu, ignora este mensaje y revisa tu cuenta.',
        code,
        expiresInText: `${ttlMinutes} minutos`,
        accentColor: '#d6a24a'
    });
}

async function sendInvoiceEmail(to, pdfBuffer, invoiceId) {
    const mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM}>`,
        to,
        subject: `Factura #${invoiceId} — Adopciones KALO`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #11253d;">Gracias por tu compra</h2>
                <p>Hola,</p>
                <p>Adjuntamos la factura <strong>#${invoiceId}</strong> correspondiente a tu compra en la tienda de Adopciones KALO.</p>
                <p>Cada compra apoya directamente a los perritos que esperan un hogar.</p>
                <br>
                <p>Saludos,<br>Equipo de Adopciones KALO</p>
            </div>
        `,
        attachments: [
            {
                filename: `factura-${invoiceId}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }
        ]
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Invoice email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending invoice email:', error);
        return false;
    }
}

module.exports = {
    sendOtpEmail,
    sendVerificationEmail,
    sendEmailChangeOtpEmail,
    sendPasswordChangeOtpEmail,
    sendInvoiceEmail
};
