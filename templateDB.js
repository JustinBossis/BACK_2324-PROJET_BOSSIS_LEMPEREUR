const { MongoClient, ObjectId} = require('mongodb');

const args = process.argv.slice(2);
const url = args[0] ?? 'mongodb://localhost:27017';
const dbName = args[1] ?? "projet";
const client = new MongoClient(url);

async function main() {
    await client.connect();
    console.log(`Connected successfully to MongoDB server: ${url}`);
    console.log(`Inserting data into database: ${dbName}`);

    await insertData(dbName);
    return 'done.';
}

main()
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close());


async function insertData(dbName) {
    const users = getUsers();
    const messages = getMessages();
    const conversations = getConversations();
    const events = getEvents();
    let promises = [];

    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    const messagesCollection = db.collection('messages');
    const conversationsCollection = db.collection('conversations');
    const eventsCollection = db.collection('events');

    /*try {
        await usersCollection.insertMany(users);
    } catch (error) {
        console.error('Error inserting users:', error);
    }*/

    /*try {
        await messagesCollection.insertMany(messages);
    } catch (error) {
        console.error('Error inserting messages:', error);
    }*/
/*
    try {
        await conversationsCollection.insertMany(conversations);
    } catch (error) {
        console.error('Error inserting conversations:', error);
    }

    try {
        await eventsCollection.insertMany(events);
    } catch (error) {
        console.error('Error inserting events:', error);
    }*/

    return Promise.all(promises);
}

function getUsers(){
    return [
        {firstname: "firstname", lastname: "lastname", username:"username", email: "test@test.com",password: "test",admin:"false", favorites: [], birthdate:"01/12/2000", picture:"public/images/users/avatar.png", },
        {firstname: "firstname2", lastname: "lastname2", username:"username2", email: "test2@test.com",password: "test2",admin:"true", favorites: [], birthdate:"01/12/2010", picture:"public/images/users/avatar.png", },
    ];
}

function getMessages(){
    return [
        {conversation:new ObjectId("65d8a86a68e2792f60fde14d"), text:"bla bla", timestamp:1708694146, user:{_id: "65d8a7b0080138bf9f04bab5", firstname: "firstname2", lastname:"lastname2", picture:"public/images/users/avatar.png"}},
    ];
}

function getConversations(){
    return [
        {users:[new ObjectId("65d8a7b0080138bf9f04bab4"), new ObjectId("65d8a7b0080138bf9f04bab5")]}
    ];
}

function getEvents(){
    return [{
        name: "Evenement",
        picture: "public/images/users/avatar.png",
        price: 5,
        date: 1708694146,
        theme: "sport",
        creator: new ObjectId("65d8a7b0080138bf9f04bab4")
    }]
}