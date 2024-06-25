const socketIo = require('socket.io');
const axios = require('axios');
const https = require('https');
const region = require('../app/models/Region');
const MQTTService = require('./mqttService');
require('dotenv').config();

let io = null;

const agent = new https.Agent({
    rejectUnauthorized: false,
});

function initialize(server) {
    io = socketIo(server, {
        cors: {
            origin: ['http://localhost:5173'],
            methods: ['GET', 'POST'],
            allowedHeaders: ['X-Mobicam-Token'],
            credentials: true,
        },
    });

    io.use(async (socket, next) => {
        const token = socket.handshake.headers['x-mobicam-token'];
        if (token) {
            try {
                await axios.post(
                    'https://checkapp.midvietnam.com/v1/mcompany',
                    {},
                    {
                        headers: {
                            'X-Mobicam-Token': token,
                        },
                        httpsAgent: agent,
                    },
                );
                // Connect MQTT
                const mqttService = new MQTTService(
                    process.env.MQTT_HOST,
                    null,
                    io,
                );
                await mqttService.initialize();
                mqttService.connect();
                mqttService.subscribe('live/status');
                next();
            } catch (error) {
                const err = new Error('Authentication error');
                err.data = { content: 'Authentication failed' };
                next(err);
            }
        } else {
            const err = new Error('Authentication error');
            err.data = { content: 'Please retry later' };
            next(err);
        }
    });

    io.on('connection', (socket) => {
        // console.log('New client connected:', socket.id);
        socket.on('send-data', async (userId) => {
            if (userId) {
                try {
                    const results = await new Promise((resolve, reject) => {
                        region.getRecord(
                            { limit: 10, userId },
                            (err, results) => {
                                if (err) {
                                    console.log(err);
                                    reject(err);
                                } else {
                                    resolve(results);
                                }
                            },
                        );
                    });
                    socket.emit('received', {
                        results: results,
                    });
                } catch (error) {
                    console.error(error);
                    socket.emit('error', { message: 'Error retrieving data' }); // Gửi thông báo lỗi nếu có lỗi xảy ra
                }
            }
        });

        socket.on('disconnect', () => {
            // console.log('Client disconnected:', socket.id);
        });
    });
}

function getIo() {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }

    return io;
}

module.exports = {
    initialize,
    getIo,
};
