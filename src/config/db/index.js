const { connectToMongo } = require('./connect');

const query = async (collectionName, query, callback) => {
    try {
        const db = await connectToMongo();
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
        const db = await connectToMongo();
        const collection = db.collection(collectionName);
        const result = await collection.insertOne(document);
        callback(null, result);
    } catch (err) {
        console.log(err);
        callback(err);
    }
};

module.exports = { query, insert };
