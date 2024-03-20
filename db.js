const { MongoClient } = require("mongodb");
const connectionString = process.env.MONGODB_URI || "";

let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }

    const client = new MongoClient(connectionString);

    try {
        const conn = await client.connect();
        const db = conn.db("projet");
        cachedDb = db;
        return db;
    } catch(e) {
        console.error("Error connecting to database:", e);
        throw e; // Propagate the error
    }
}

module.exports = connectToDatabase;