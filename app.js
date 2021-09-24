const MongoClient = require('mongodb').MongoClient;
const circulationRepo = require('./repos/circulationRepo');
const data = require('./circulation.json');
const assert = require('assert');


const url = 'mongodb://localhost:27017';
const dbName = 'circulation';

async function main() {
    const client = new MongoClient(url);
    try {
        await client.connect();
        //insert -data
        const results = await circulationRepo.loadData(data);
        //console.log(results.insertedCount,results.ops);
        assert.equal(data.length, results.insertedCount);
        //get data
        const getData = await circulationRepo.get();
        assert.equal(results.insertedCount, getData.length);
        const admin = client.db(dbName).admin();
        //filter data
        const filterData = await circulationRepo.get({ Newspaper: getData[4].Newspaper });
        console.dir("filterData :" + filterData[0].Newspaper);
        assert.deepEqual(getData[4], filterData[0]);
        //get data with limit
        const getDataLimit = await circulationRepo.get({}, 3);
        assert.equal(3, getDataLimit.length);

        //findById
        let id = getData[4]._id;
        const dataById = await circulationRepo.findById(id);
        assert.deepEqual(getData[4], dataById);
        //add
        let newItem = {
            "Newspaper": "Shalabh Today",
            "Daily Circulation, 2004": 1,
            "Daily Circulation, 2013": 2,
            "Change in Daily Circulation, 2004-2013": 10,
            "Pulitzer Prize Winners and Finalists, 1990-2003": 1,
            "Pulitzer Prize Winners and Finalists, 2004-2014": 1,
            "Pulitzer Prize Winners and Finalists, 1990-2014": 2
        }
        const addedID = await circulationRepo.add(newItem);
        console.log('addedID :' + addedID);
        assert(addedID);
        //update Data
        let updateItem = {
            "Newspaper": "Shalabh New Today",
            "Daily Circulation, 2004": 1,
            "Daily Circulation, 2013": 2,
            "Change in Daily Circulation, 2004-2013": 10,
            "Pulitzer Prize Winners and Finalists, 1990-2003": 1,
            "Pulitzer Prize Winners and Finalists, 2004-2014": 1,
            "Pulitzer Prize Winners and Finalists, 1990-2014": 2
        }

        const updateValue = await circulationRepo.update(addedID, updateItem);
        console.dir("updateValue" + JSON.stringify(updateValue));
        const updatedValue = await circulationRepo.findById(addedID);
        assert.equal(updatedValue.Newspaper, "Shalabh New Today");

        //delete
        const deletedItem = await circulationRepo.deleteById(addedID);
        assert(deletedItem);
        //drop database
        await client.db(dbName).dropDatabase();
        console.log(await admin.listDatabases());
        client.close();
    }
    catch (err) {
        console.dir(err);
        //drop database
        const admin = client.db(dbName).admin();
        await client.db(dbName).dropDatabase();
        console.log(await admin.listDatabases());
        client.close();
    }


}

main();