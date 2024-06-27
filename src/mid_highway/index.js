const { makeId } = require('../../mid_track/utils/makeId');
const { initializeSocketClient } = require('./socketClient');

global.__trackTopic = {};

const midHighWay = {
    socket: null,

    init() {
        initializeSocketClient();
    },

    track(chanel, callback) {
        if (!chanel || !callback) return;

        const id = makeId(20);

        __trackTopic[id] = {
            chanel,
            callback,
        };

        console.log(
            '>> module__midTrack >> CREATED NEW TRACK TOPIC',
            chanel,
            id,
        );

        return id;
    },

    destroy(trackId) {
        if (__trackTopic?.[trackId]) {
            delete __trackTopic?.[trackId];
        }
    },
};

module.exports = midHighWay;
