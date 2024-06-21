const { query, insert, update } = require('../../config/db');

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
    deleteRegion: (_id, callback) => {
        return update(
            'region',
            { _id: _id },
            { isDelete: true, update_time: Date.now() },
            {},
            (err, result) => {
                if (err) return callback(err);
                callback(null, result);
            },
        );
    },
    updateRegion: (_id, data, callback) => {
        return update(
            'region',
            { _id },
            { ...data, update_time: Date.now() },
            {},
            (err, result) => {
                if (err) return callback(err);
                callback(null, result);
            },
        );
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
