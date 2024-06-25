const { query } = require('../../config/db');

const highway = {
    getHighway: (callback) => {
        return query('highway_groupByName_v2', {}, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    },
};

module.exports = highway;
