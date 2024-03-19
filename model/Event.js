const { MongoClient, ObjectId} = require('mongodb');
const crypto = require("crypto");
const {extname} = require("path");
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


    create: async function (data, user, file) {
        const filename = crypto.randomUUID().toString()+extname(file.name);
        let uploadPath = __dirname + '/../public/images/events/' + filename;
        await file.mv(uploadPath)
        try {
            await client.connect();
            let db = client.db("projet");
            let eventsCollection = await db.collection("events");
            data.creator = user._id;
            data.picture = process.env.URL+"/images/events/"+filename;
            let event = await eventsCollection.insertOne(data);
            return event.insertedId;
        } catch (e) {
            throw e;
        } finally {
            await client.close();
        }
    },

    update: async function (id, data) {
        try {
            await client.connect();
            let db = client.db("projet");
            let eventsCollection = await db.collection("events");
            let event = await eventsCollection.updateOne({_id: new ObjectId(id)}, {$set: data});
            return event.acknowledged;
        } catch (e) {
            throw e;
        } finally {
            await client.close();
        }
    }

}

module.exports = Event;