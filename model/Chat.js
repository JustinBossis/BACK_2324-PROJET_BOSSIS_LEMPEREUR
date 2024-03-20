const { MongoClient, ObjectId} = require('mongodb');
const connectionString = process.env.MONGODB_URI || "";
const client = new MongoClient(connectionString);
const connectToDatabase  = require("../db.js")

const Chat = {

    //Renvoie toutes les conversations
    getAll: async function () {
        try {
            const db = await connectToDatabase()
            let conversationsCollection = await db.collection("conversations");
            return await conversationsCollection.aggregate([{$lookup: { from: "users", localField: "users", foreignField: "_id", as: "users_data", pipeline: [{ $project: { firstname: 1, lastname: 1, username: 1, picture: 1 } }]}}]).toArray();
        } catch (e) {
            throw e;
        }
    },

    //Renvoie une conversation avec les messages à partir de son id
    getById: async function (conversation_id) {
        try {

            const db = await connectToDatabase()
            let conversationsCollection = await db.collection("conversations");
            return  await conversationsCollection.aggregate([
                {
                    $lookup:
                        {
                            from: "users",
                            localField: "users",
                            foreignField: "_id",
                            as: "users_data",
                            pipeline:
                                [
                                    {
                                        $project:
                                            {
                                                firstname: 1,
                                                lastname: 1,
                                                username: 1,
                                                picture: 1
                                            }
                                    }
                                ]
                        }
                },
                {
                    $lookup:
                        {
                            from: "messages",
                            localField: "_id",
                            foreignField: "conversation",
                            as: "messages",
                            pipeline:
                                [
                                    {
                                        $sort: {
                                            timestamp: 1
                                        }
                                    }
                                ]
                        }
                },
                {
                    $match:
                        {
                            "_id" : new ObjectId(conversation_id)
                        }
                },
                { $limit: 1 }
            ]).toArray();
        } catch (e) {
            throw e;
        }
    },

    //Crée une conversation entre deux users
    //data : users : tableau contenant 2 userId
    create: async function (data) {
        try {
            const db = await connectToDatabase()
            let conversationsCollection = await db.collection("conversations");
            let conversation = await conversationsCollection.insertOne(data);
            return conversation.insertedId;
        } catch (e) {
            throw e;
        }
    },

    //Ajoute un message à la base de données
    //data : conversationId, text, timestamp
    //user : user qui a envoyé le message
    addMessage: async function (data, user) {
        try {
            const db = await connectToDatabase()
            let messagesCollection = await db.collection("messages");
            data.user = user._id;
            let message = await messagesCollection.insertOne(data);
            return message.insertedId;
        } catch (e) {
            throw e;
        }
    },

}

module.exports = Chat;