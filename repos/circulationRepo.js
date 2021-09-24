const { MongoClient, ObjectId } = require('mongodb');

function circulationRepo() {
    const url = 'mongodb://localhost:27017';
    const dbName = 'circulation';
    const client = new MongoClient(url);
    function deleteById(id) {
        return new Promise(async (resolve, reject) => {
            try {
                await client.connect();
                const db = client.db(dbName);
                const deletedItem = await db.collection('newspaper').deleteOne({ _id: ObjectId(id) });
                resolve(deletedItem.deletedCount === 1);
                client.close();
            }
            catch (err) {
                reject(err);

            }
        });
    }
    function update(id, updateItem) {
        return new Promise(async (resolve, reject) => {
            try {
                await client.connect();
                const db = client.db(dbName);
                const updatedItem = await db.collection('newspaper').findOneAndReplace({ _id: ObjectId(id) }, updateItem, { returnDocument: 'after' });
                resolve(updatedItem.value);
                client.close();
            }
            catch (err) {
                reject(err);
            }
        });
    }
    function add(item) {
        return new Promise(async (resolve, reject) => {
            try {
                await client.connect();
                const db = client.db(dbName);
                const newItem = await db.collection('newspaper').insertOne(item);

                resolve(newItem.insertedId.toString());
                client.close();
            }
            catch (err) {
                reject(err);
            }
        });
    }

    function findById(id) {
        return new Promise(async (resolve, reject) => {
            try {
                await client.connect();
                const db = client.db(dbName);
                const item = await db.collection('newspaper').findOne({ _id: ObjectId(id) });
                resolve(item);
                client.close();
            }
            catch (err) {
                reject(err);
            }
        })
    }

    function get(query, limit) {
        return new Promise(async (resolve, reject) => {
            try {
                await client.connect();
                const db = client.db(dbName);
                const items = db.collection('newspaper').find(query);
                if (limit != null && limit > 0) {
                    items.limit(limit);
                }
                resolve(await items.toArray());
                client.close();
            }
            catch (err) {
                reject(err);
            }
        });
    }

    function loadData(data) {
        return new Promise(async (resolve, reject) => {

            try {
                await client.connect();
                const db = client.db(dbName);
                let results = await db.collection('newspaper').insertMany(data);
                resolve(results);
                client.close();
            }
            catch (err) {
                reject(err);
            }
        })
    }

    return { loadData, get, findById, add, update, deleteById };
}

module.exports = circulationRepo();