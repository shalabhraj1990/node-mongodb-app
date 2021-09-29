const { MongoClient, ObjectId } = require('mongodb');

function circulationRepo() {
    const url = 'mongodb://localhost:27017';
    const dbName = 'circulation';
    const client = new MongoClient(url);
    function averageFinalisWithCirculation() {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);
                const average = await db.collection('newspaper')
                    .aggregate([
                        {
                            $project: {
                                "Newspaper": 1,
                                "Change in Daily Circulation, 2004-2013": 1,
                                "Pulitzer Prize Winners and Finalists, 1990-2014": 1,
                                overAllChange: {
                                    $cond: {
                                        if: { $gte: ["$Change in Daily Circulation, 2004-2013", 0]}, then: "positive", else: "negative" 
                                    }
                                }
                            }
                        },
                        {
                            $group:
                            {
                                _id: "$overAllChange",
                                avgFinalist: { $avg: "$Pulitzer Prize Winners and Finalists, 1990-2014" }
                            }
                        }
                    ]).toArray();
                resolve(average);
                client.close();
            }
            catch (err) {
                reject(err);

            }
        });
    }

    function averageFinalist() {
        return new Promise(async (resolve, reject) => {
            const client = new MongoClient(url);
            try {
                await client.connect();
                const db = client.db(dbName);
                const average = await db.collection('newspaper')
                    .aggregate([
                        {
                            $group:
                            {
                                _id: null,
                                avgFinalist: { $avg: "$Pulitzer Prize Winners and Finalists, 1990-2003" }
                            }
                        }
                    ]).toArray();
                resolve(average[0].avgFinalist);
                client.close();
            }
            catch (err) {
                reject(err);

            }
        });
    }

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

    return { loadData, get, findById, add, update, deleteById, averageFinalist,averageFinalisWithCirculation };
}

module.exports = circulationRepo();