const socketIo = require('socket.io');
const region = require('../app/models/Region');
let io = null;

function initialize(server) {
    io = socketIo(server, {
        cors: {
            origin: ['http://localhost:5173'],
        },
    });
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);
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
                    io.emit('received', results);
                } catch (error) {
                    console.error(error);
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
