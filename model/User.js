const { MongoClient, ObjectId} = require('mongodb');
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');
const connectToDatabase = require("../db.js")


const User = {

    //Connexion utilisateur
    //email password
    connectUser: async function (email, password) {
        try {
            const db = await connectToDatabase()
            const usersCollection = db.collection('users');
            const user = await usersCollection.findOne({email: email});
            if (!user) {
                throw new Error("Cette adresse email n'existe pas !");
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
                                }, process.env.JWT_PRIVATE_KEY, {expiresIn: 6000}),
                                refreshToken: jwt.sign({id: user._id}, process.env.JWT_PRIVATE_KEY, {expiresIn: '1d'})
                            };
                            resolve(tokensJWT);
                        } else {
                            reject(new Error("Le mot de passe n'est pas bon!"));
                        }
                    });
                });
            } catch (error) {
                throw error;
            }
        } catch (error) {
            throw error;
        }
    },

    //Creation d'un user
    //data: (mail/nom/prénom/nom d’utilisateur/ddn/mot de passe)
    createUser: async function (data) {
        try {
            const db = await connectToDatabase()
            const usersCollection = db.collection('users');
            const user = await usersCollection.findOne({email: email});
            if (user) {
                throw new Error("Cette adresse email est déjà utilisée !");
            }

            const salt = bcrypt.genSaltSync(10);
            data.password = bcrypt.hashSync(data.password, salt);
            data.admin = false
            data.favorites = [];
            const newUser = {
                ...data
            };
            return (await usersCollection.insertOne(newUser)).insertedId;
        } catch (error) {
            throw new Error("Une erreur est survenue lors de la création de l'utilisateur !");
        }
    },

    //Modification d'un user
    //data: (mail/nom d’utilisateur/mot de passe)
    //user : user dont on modifie les champs
    updateUser: async function (data, user) {
        try {
            const db = await connectToDatabase()
            const usersCollection = db.collection('users');
            const salt = bcrypt.genSaltSync(10);
            data.password = bcrypt.hashSync(data.password, salt);
            await usersCollection.updateOne(
                { _id: user._id }, { $set: { data } }
            );
            return user._id.toString();
        } catch (error) {
            throw error;
        }
    },

    //Renvoie un user à partir d'un id
    //userId: id du user dont on veut recuperer les informations
    getById: async function (userId) {
        try {
            const db = await connectToDatabase()
            const usersCollection = db.collection('users');
            let user = await usersCollection.findOne({_id: new ObjectId(userId)});
            if (user) {
                delete user.password;
                return user;
            }else{
                throw new Error("Utilisateur non trouvé !")
            }
        } catch (error) {
            throw error;
        }
    },

    //Renvoie la liste de tout les users
    getAll: async function () {
        try {
            const db = await connectToDatabase()
            let usersCollection = await db.collection("users");
            return await usersCollection.find().project({password: 0}).toArray();
        } catch (e) {
            throw e;
        }
    },

    //Utilisation du refresh token pour generer des nouveaux token et refreshToken
    //refreshToken : token
    useRefreshToken: async function (refreshToken) {
        return jwt.verify(refreshToken, process.env.JWT_PRIVATE_KEY, async (err, decoded) => {
            if (err) {
                throw new Error("Le token est invalide !");
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
                    }, process.env.JWT_PRIVATE_KEY, {expiresIn: 6000}),
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

    //Ajouter un evenement à la liste des favoris de l'utilisateur
    //idEvent : id de l'evenment a ajouté à la liste des favoris
    //user: user à qui on ajoute l'evenement aux favoris
    addToFavorite: async function (idEvent, user) {
        try {
            const db = await connectToDatabase()
            const usersCollection = db.collection('users');
            let fav = user.favorites;
            fav.push(new ObjectId(idEvent));
            await usersCollection.updateOne(
                {_id: user._id},
                {
                    $set: {
                        favorites: fav
                    }
                });
        } catch (error) {
            throw error;
        }
    },

    //Enlever un evenement de la liste des favoris de l'utilisateur
    //idEvent : id de l'evenment a enlevé de la liste des favoris
    //user: user à qui on retire l'evenement des favoris
    removeToFavorite: async function (idEvent, user) {
        try {
            const db = await connectToDatabase()
            const usersCollection = db.collection('users');
            let fav = user.favorites;
            fav = fav.filter(function(item) {
                return item.toString() !== idEvent
            })
            await usersCollection.updateOne(
                {_id: user._id},
                {
                    $set: {
                        favorites: fav
                    }
                });
        } catch (error) {
            throw error;
        }
    },

}

module.exports = User;