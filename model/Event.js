const { ObjectId} = require('mongodb');
const {connectToDatabase}  = require("../db.js")

const Event = {

    getAll: async function (filter_on = null, sort_on = {date: 1}) {
        try {
            const db = await connectToDatabase()
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
        }
    },

    getById: async function (event_id) {
        try {
            const db = await connectToDatabase()
            let eventsCollection = await db.collection("events");
            let usersCollection = await db.collection("users");
            let data =  await eventsCollection.findOne({"_id": new ObjectId(event_id)});
            data.favorite_by = await usersCollection.find({favorites: new ObjectId(event_id)}).toArray()
            return data
        } catch (e) {
            throw e;
        }
    },


    create: async function (data, user) {
        try {
            const db = await connectToDatabase()
            let eventsCollection = await db.collection("events");
            data.creator = user._id;
            let event = await eventsCollection.insertOne(data);
            return event.insertedId;
        } catch (e) {
            throw e;
        }
    },

    update: async function (id, data) {
        try {
            const db = await connectToDatabase()
            let eventsCollection = await db.collection("events");
            let event = await eventsCollection.updateOne({_id: new ObjectId(id)}, {$set: data});
            return event.acknowledged;
        } catch (e) {
            throw e;
        }
    }

}

module.exports = Event;