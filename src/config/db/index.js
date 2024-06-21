const { connectToMongo } = require('./connect');

let db;

const initializeDB = async () => {
    db = await connectToMongo();
};

const query = async (collectionName, query, callback) => {
    try {
        const collection = db.collection(collectionName);
        const docs = await collection.find(query).toArray();
        callback(null, docs);
    } catch (err) {
        console.log(err);
        callback(err);
    }
};

const insert = async (collectionName, document, callback) => {
    try {
        const collection = db.collection(collectionName);
        const result = await collection.insertOne(document);
        callback(null, result);
    } catch (err) {
        console.log(err);
        callback(err);
    }
};

const update = async (
    collectionName,
    query,
    updateData,
    options = {},
    callback,
) => {
    try {
        const collection = db.collection(collectionName);
        const result = await collection.updateOne(
            query,
            { $set: updateData },
            options,
        );
        callback(null, result);
    } catch (err) {
        console.log(err);
        callback(err);
    }
};

module.exports = { query, insert, initializeDB, update };
