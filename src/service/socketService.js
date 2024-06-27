const socketIo = require('socket.io');
const MQTTService = require('./mqttService');
require('dotenv').config();

let io = null;

function initialize(server) {
    io = socketIo(server, {
        pingTimeout: 60000, // Thời gian chờ để phát hiện ngắt kết nối (mặc định là 5000 ms)
        pingInterval: 25000, // Khoảng thời gian giữa các lần kiểm tra kết nối (mặc định là 25000 ms)
        cors: {
            origin: ['http://localhost:5173'],
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.on('connection', async (socket) => {
        // Connect MQTT
        const mqttService = new MQTTService(process.env.MQTT_HOST, null, io);
        await mqttService.initialize();
        mqttService.connect();
        mqttService.subscribe('live/status');

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
