const axios = require('axios');
const https = require('https');

const agent = new https.Agent({
    rejectUnauthorized: false, // Bỏ qua xác minh chứng chỉ
});

async function verifyUser(req, res, next) {
    const token = req.headers['authentication-token'];
    if (!token) {
        return res.status(401).json({
            result: 0,
            message: 'Missing Authentication-Token header',
        });
    }
    try {
        const response = await axios.post(
            'https://checkapp.midvietnam.com/v1/mcompany',
            {},
            {
                headers: {
                    'X-Mobicam-Token': token,
                },
                httpsAgent: agent,
            },
        );
        const body = req?.body || {};
        req.body = { ...body, userId: response?.data?.data?.id };
        next();
    } catch (error) {
        console.error('Error while verifying user:', error);
        return res.status(500).json({
            result: 0,
            message: 'Internal Server Error',
        });
    }
}

module.exports = { verifyUser };
