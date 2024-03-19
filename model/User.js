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
                            // Creation token JWT
                            let tokensJWT = {
                                token: jwt.sign({
                                    id: user._id,
                                    username: user.username,
                                    lastname: user.lastname,
                                    firstname: user.firstname,
                                    picture: user.picture
                                }, process.env.JWT_PRIVATE_KEY, {expiresIn: 120}),
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
            data.admin = false
            data.favorites = [];
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

    //Renvoie un user à partir d'un id
    //userId: id du user dont on veut recuperer les informations
    getById: async function (userId) {
        try {
            await client.connect();
            const db = client.db(dbName);
            const usersCollection = db.collection('users');
            let user = await usersCollection.findOne({_id: new ObjectId(userId)});
            if (user) {
                delete user.password;
                return user;
            }
        } catch (error) {
            throw error;
        } finally {
            await client.close();
        }
    },

    //Renvoie la liste de tout les users
    getAll: async function () {
        try {
            await client.connect();
            let db = client.db(dbName);
            let usersCollection = await db.collection("users");
            return await usersCollection.find().project({password: 0}).toArray();
        } catch (e) {
            throw e;
        } finally {
            await client.close();
        }
    },

    //Utilisation du refresh token pour generer un nouveau token et refreshToken
    //refreshToken : token
    useRefreshToken: async function (refreshToken) {
        return jwt.verify(refreshToken, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
            if (err) {
                console.error('Erreur lors de la vérification du token :', err);
                return null;
            } else {
                let idUser = decoded.id;
                let user = await User.getById(idUser);
                return {
                    token: jwt.sign({
                        id: user._id,
                        username: user.username,
                        lastname: user.lastname,
                        firstname: user.firstname,
                        picture: user.picture
                    }, process.env.JWT_PRIVATE_KEY, {expiresIn: 120}),
                    refreshToken: jwt.sign({id: idUser}, process.env.JWT_PRIVATE_KEY, {expiresIn: '1d'})
                }
            }
        });
    },

    //Extraction du token JWT, vérification de validité
    // Renvoie l'utilisateur correspondant à la requête si le token est valide
    authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (token == null) return res.sendStatus(401)
        jwt.verify(token, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
            if (err) return res.sendStatus(403)
            let idUser = decoded.id;
            req.user = await User.getById(idUser);
            next()
        })
    },

    addToFavorite: async function (idEvent, userId) {
        try {
            await client.connect();
            const db = client.db(dbName);
            const usersCollection = db.collection('users');
            let user = await usersCollection.findOne({_id: new ObjectId(userId)});
            let fav = user.favorites;
            fav.push(idEvent);
            await usersCollection.updateOne(
                {_id: new ObjectId(userId)},
                {
                    $set: {
                        favorites: fav
                    }
                });
        } catch (error) {
            throw error;
        } finally {
            await client.close();
        }
    },

    removeToFavorite: async function (idEvent, userId) {
        try {
            await client.connect();
            const db = client.db(dbName);
            const usersCollection = db.collection('users');
            let user = await usersCollection.findOne({_id: new ObjectId(userId)});
            let fav = user.favorites;
            fav = fav.filter(function(item) {
                return item !== idEvent
            })
            await usersCollection.updateOne(
                {_id: new ObjectId(userId)},
                {
                    $set: {
                        favorites: fav
                    }
                });
        } catch (error) {
            throw error;
        } finally {
            await client.close();
        }
    },

}

module.exports = User;