const { io } = require('socket.io-client');
const publicTopic = require('../publicTopic');
const constant = require('../constant');

const initializeSocketClient = () => {
    console.log('>> Socket.Io Connecting to Server');
    const socket = io(constant?.domain, {
        reconnection: true, // Bật tính năng tự động kết nối lại
        reconnectionAttempts: 5, // Số lần thử kết nối lại (mặc định là Infinity)
        reconnectionDelay: 1000, // Thời gian chờ trước khi thử kết nối lại (mặc định là 1000 ms)
        reconnectionDelayMax: 5000, // Thời gian chờ tối đa trước khi thử kết nối lại (mặc định là 5000 ms)
        randomizationFactor: 0.5, // Yếu tố ngẫu nhiên để tính thời gian chờ (mặc định là 0.5)
    });

    socket.on('connect', () => {
        console.log('Connected to server nodejs');
    });

    socket.on('warning', (data) => {
        publicTopic('warning', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected from server');
    });

    return socket;
};

module.exports = { initializeSocketClient };
