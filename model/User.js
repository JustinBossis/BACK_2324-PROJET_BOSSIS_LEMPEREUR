const { MongoClient, ObjectId} = require('mongodb');
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');

const url = process.env.MONGODB_URI;
const dbName = 'projet';
const client = new MongoClient(url);

const User = {

    //Connexion utilisateur
    //email password
    connectUser: async function (email, password) {
        try {
            await client.connect();
            const db = client.db(dbName);
            const usersCollection = db.collection('users');
            const user = await usersCollection.findOne({email: email});
            if (!user) {
                console.log("pas de user trouvé avec l'adresse mail");
                return null;
            }
            //verifier si le password correspond
            try {
                // Comparaison du mot de passe
                return new Promise((resolve, reject) => {
                    bcrypt.compare(password, user.password, function (err, res) {
                        if (err) {
                            console.log(err);
                            reject(err);
                        }
                        if (res) {
                            // JWT
                            let tokensJWT = {
                                token: jwt.sign({id: user._id}, process.env.JWT_PRIVATE_KEY, {expiresIn: 120}),
                                refreshToken: jwt.sign({id: user._id}, process.env.JWT_PRIVATE_KEY, {expiresIn: '1d'})
                            };
                            resolve(tokensJWT);
                        } else {
                            console.log("Le mot de passe ne correspond pas");
                            reject(new Error('Le mot de passe ne correspond pas'));
                        }
                    });
                });
            } catch (error) {
                throw error;
            }
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
            const salt = bcrypt.genSaltSync(10);
            data.password = bcrypt.hashSync(data.password, salt);
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

    refreshToken: function(refreshToken) {
        return jwt.verify(refreshToken, process.env.JWT_PRIVATE_KEY, (err, decoded) => {
            if (err) {
                console.error('Erreur lors de la vérification du token :', err);
                return null;
            } else {
                let idUser = decoded.id;
                const newRefreshToken = jwt.sign({id: idUser}, process.env.JWT_PRIVATE_KEY, {expiresIn: '1d'});
                return {
                    token: jwt.sign({id: idUser}, process.env.JWT_PRIVATE_KEY, {expiresIn: 120}),
                    refreshToken: jwt.sign({id: idUser}, process.env.JWT_PRIVATE_KEY, {expiresIn: '1d'})
                }
            }
        });
    }
}

module.exports = User;