const { MongoClient, ObjectId} = require('mongodb');
const connectionString = process.env.MONGODB_URI || "";
const client = new MongoClient(connectionString);

const Chat = {

    getAll: async function () {
        try {
            await client.connect();
            let db = client.db("projet");

            let conversationsCollection = await db.collection("conversations");
            return await conversationsCollection.aggregate([{$lookup: { from: "users", localField: "users", foreignField: "_id", as: "users_data", pipeline: [{ $project: { firstname: 1, lastname: 1, username: 1, picture: 1 } }]}}]).toArray();
        } catch (e) {
            throw e;
        } finally {
            await client.close();
        }
    },

    getById: async function (conversation_id) {
        try {
            await client.connect();
            let db = client.db("projet");

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
        } finally {
            await client.close();
        }
    },


    create: async function (data) {
        try {
            await client.connect();
            let db = client.db("projet");
            let conversationsCollection = await db.collection("conversations");
            let conversation = await conversationsCollection.insertOne(data);
            return conversation.insertedId;
        } catch (e) {
            throw e;
        } finally {
            await client.close();
        }
    },

    addMessage: async function (data) {
        try {
            await client.connect();
            let db = client.db("projet");
            let messagesCollection = await db.collection("messages");
            let message = await messagesCollection.insertOne(data);
            return message.insertedId;
        } catch (e) {
            throw e;
        } finally {
            await client.close();
        }
    },

}

module.exports = Chat;