const { query, insert } = require('../../config/db');

const region = {
    getRegion: (userId, callback) => {
        return query(
            'region',
            { userId: userId, isDelete: false },
            (err, results) => {
                if (err) return callback(err);
                const reversedResults = results.reverse();
                callback(null, reversedResults);
            },
        );
    },
    addRegion: (data, callback) => {
        return insert('region', data, callback);
    },
    addRecord: (data, callback) => {
        return insert('record', data, callback);
    },
    getRecord: (payload, callback) => {
        return query(
            'record',
            { userId: payload?.userId, isDelete: false },
            (err, results) => {
                if (err) return callback(err);
                const reversedResults = results.reverse();
                callback(null, reversedResults.slice(0, payload?.limit));
            },
        );
    },
};

module.exports = region;
