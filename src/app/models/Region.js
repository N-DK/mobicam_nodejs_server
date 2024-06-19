const { query, insert } = require('../../config/db');

const region = {
    getRegion: (userId, callback) => {
        return query('region', { userId: userId }, callback);
    },
    addRegion: (data, callback) => {
        return insert('region', data, callback);
    },
    getRecord: (payload, callback) => {
        return query('record', { userId: payload?.userId }, (err, results) => {
            if (err) return callback(err);
            callback(null, results.slice(0, payload?.limit));
        });
    },
};

module.exports = region;
