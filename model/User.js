const { MongoClient, ObjectId} = require('mongodb');

const url = process.env.MONGODB_URI;
const dbName = 'projet';
const client = new MongoClient(url);

let modelUser = {_id: "1", firstname: "firstname", lastname: "lastname", username:"username", email: "test@test.com",password: "test",admin:"false", favorites: [], birthdate:"01/12/2000", picture:"public/images/users/avatar.png", };

const User = {

    //Connexion utilisateur
    //email password
    connexionUser: async function (email, password) {
        try {
            await client.connect();
            const db = client.db(dbName);
            const usersCollection = db.collection('users');
            const user = await usersCollection.findOne({email: email});
            if (!user) {
                return null;
            }
            //verifier si le password correspond
            if (!password === user.password) {
                return null;
            }
            return user;
        } catch (error) {
            throw error;
        } finally {
            await client.close();
        }
    },

    //Creation d'un user
    //data: (mail/nom/prénom/nom d’utilisateur/ddn/mot de passe)
    createUser: async function (data) {
        try {
            await client.connect();
            const db = client.db(dbName);
            const usersCollection = db.collection('users');
            const newUser = {
                ...data
            };
            return (await usersCollection.insertOne(newUser)).insertedId;
        } catch (error) {
            throw error;
        } finally {
            await client.close();
        }
    },

    getById: async function(userId) {
        try {
            await client.connect();
            const db = client.db(dbName);
            const usersCollection = db.collection('users');
            return await usersCollection.findOne({ _id: new ObjectId(userId) });
        } catch (error) {
            throw error;
        } finally {
            await client.close();
        }
    },
}

module.exports = User;