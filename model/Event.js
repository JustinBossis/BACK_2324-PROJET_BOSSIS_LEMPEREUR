const { MongoClient, ObjectId} = require('mongodb');
const connectionString = process.env.MONGODB_URI || "";
const client = new MongoClient(connectionString);

const Event = {

    getAll: async function (filter_on = null, sort_on = {date: 1}) {
        try {
            await client.connect();
            let db = client.db("projet");

            let eventsCollection = await db.collection("events");
            let filterList = {}
            if (filter_on != null) {
                for (let f of filter_on) {
                    switch (f.property) {
                        case "theme":
                            filterList.theme = f.value;
                            break;
                        case "name":
                            filterList.name = {$regex: f.value};
                            break;
                        case "price":
                            filterList.price = f.value;
                            break;
                    }
                }
            }
            return await eventsCollection.find(filterList).sort(sort_on).toArray();
        } catch (e) {
            throw e;
        } finally {
            await client.close();
        }
    },

    getById: async function (event_id) {
        try {
            await client.connect();
            let db = client.db("projet");

            let eventsCollection = await db.collection("events");
            let usersCollection = await db.collection("users");
            let data =  await eventsCollection.findOne({"_id": new ObjectId(event_id)});
            data.favorite_by = await usersCollection.find({favorites: new ObjectId(event_id)}).toArray()
            return data
        } catch (e) {
            throw e;
        } finally {
            await client.close();
        }
    },


    create: async function (data) {
        try {
            await client.connect();
            let db = client.db("projet");
            let eventsCollection = await db.collection("events");
            let event = await eventsCollection.insertOne(data);
            return event.insertedId
        } catch (e) {
            throw e;
        } finally {
            await client.close();
        }
    }

}

module.exports = Event;