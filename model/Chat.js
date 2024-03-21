const { MongoClient, ObjectId} = require('mongodb');
const connectionString = process.env.MONGODB_URI || "";
const client = new MongoClient(connectionString);
const connectToDatabase  = require("../db.js")

const Chat = {

    //Renvoie une conversation avec les messages à partir de son id
    getById: async function (other_id, user_id) {
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
                                                password: 0,
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
                            "users" : {$all: [new ObjectId(other_id), user_id]}
                        }
                },
                {
                    $project:
                        {
                            users: 0,
                        }
                },
                { $limit: 1 }
            ]).toArray();
        } catch (e) {
            throw new Error("Une erreur s'est produite lors de la récupération de la conversation !");
        }
    },

    //Crée une conversation entre deux users
    //data : users : tableau contenant 2 userId
    create: async function (data) {
        try {
            const db = await connectToDatabase()
            let conversationsCollection = await db.collection("conversations");
            data.users = data.users.map(userId => new ObjectId(userId));
            let conversation = await conversationsCollection.insertOne(data);
            return conversation.insertedId;
        } catch (e) {
            throw new Error("Une erreur s'est produite lors de la création de la conversation !");
        }
    },

    //Ajoute un message à la base de données
    //data : conversationId, text, timestamp
    //user : user qui a envoyé le message
    addMessage: async function (data, userId) {
        try {
            const db = await connectToDatabase()
            let messagesCollection = await db.collection("messages");
            data.conversation = new ObjectId(data.conversation);
            data.user = new ObjectId(userId);
            let message = await messagesCollection.insertOne(data);
            return message.insertedId;
        } catch (e) {
            throw new Error("Une erreur s'est produite lors de la sauvegarde duu message !");
        }
    },

}

module.exports = Chat;