const { MongoClient, ObjectId} = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'projet';
const client = new MongoClient(url);

let modelUser = {_id: "1", firstname: "firstname", lastname: "lastname", username:"username", email: "test@test.com",password: "test",admin:"false", favorites: [], birthdate:"01/12/2000", picture:"public/images/users/avatar.png", };

const User = {

    //Creation d'un user
    //data: (mail/nom/prénom/nom d’utilisateur/ddn/mot de passe)
    createUser : async function (data) {
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

    //Connexion utilisateur
    //email password
    connexionUser : function(email, password) {
        if (!user) {
            return null;
        }
        //verifier si le password correspond
        if (!password === user.password) {
            return null;
        }
        return user;
    },

    editUser: function(data){

    }
}

module.exports = User;