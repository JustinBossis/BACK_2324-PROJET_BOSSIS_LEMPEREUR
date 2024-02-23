const { MongoClient, ObjectId} = require('mongodb');
const User = require("./User");

const url = process.env.MONGODB_URI;
const dbName = 'projet';
const client = new MongoClient(url);

let modelConversations = {_id: "1", users:["1", "2"]}

const Conversation = {

    //Recuperer toutes les conversations d'un user
    getAllByUserId: async function (userId) {
        try {
            await client.connect();
            const db = client.db(dbName);
            const conversationsCollection = db.collection('conversations');
            return await conversationsCollection.find({users: new ObjectId(userId)}).toArray();
        } catch (error) {
            throw error;
        } finally {
            await client.close();
        }
    },
}

module.exports = Conversation;