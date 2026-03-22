const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL =
    process.env.PAYPAL_ENV === 'production'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';

function ensurePayPalConfigured() {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        const error = new Error('PayPal credentials are not configured (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET)');
        error.statusCode = 500;
        throw error;
    }
}

async function getAccessToken() {
    ensurePayPalConfigured();

    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

    const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });

    const data = await response.json();

    if (!response.ok) {
        const error = new Error(`PayPal authentication failed: ${data.error_description || response.status}`);
        error.statusCode = 502;
        throw error;
    }

    return data.access_token;
}

module.exports = { PAYPAL_BASE_URL, PAYPAL_CLIENT_ID, getAccessToken };
