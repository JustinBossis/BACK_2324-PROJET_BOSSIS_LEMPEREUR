const { ObjectId} = require('mongodb');
const connectToDatabase  = require("../db.js")

const Event = {

    // Méthode pour récupérer tous les événements
    getAll: async function (filter_on = null, sort_on = {date: 1}) {
        try {
            // Connexion à la base de données
            const db = await connectToDatabase()
            let eventsCollection = await db.collection("events");
            let filterList = {}
            // Si un filtre est spécifié, l'appliquer
            if (filter_on != null) {
                for (let f of filter_on) {
                    switch (f.property) {
                        case "theme":
                            filterList.theme = f.value;
                            break;
                        case "name":
                            filterList.name = {$regex: f.value, $options: "i"};
                            break;
                        case "price":
                            filterList.price = f.value;
                            break;
                        default:
                            throw new Error("Impossible de trier selon la propriété suivante : ", f.property)
                    }
                }
            }
            // Retourner les événements selon les filtres et le tri spécifiés
            return await eventsCollection.find(filterList).sort(sort_on).toArray();
        } catch (e) {
            throw new Error("Une erreur s'est produite lors de la récupération des évènements !")
        }
    },

    // Méthode pour récupérer un événement par son ID
    getById: async function (event_id) {
        try {
            const db = await connectToDatabase()
            let eventsCollection = await db.collection("events");
            let usersCollection = await db.collection("users");
            let data =  await eventsCollection.findOne({"_id": new ObjectId(event_id)});
            // Si l'événement existe, récupérer les utilisateurs qui l'ont ajouté à leurs favoris
            if(data){
                data.favorite_by = await usersCollection.find({favorites: new ObjectId(event_id)}).toArray()
                return data
            }else{
                throw new Error("Cet évènement n'existe pas !")
            }
        } catch (e) {
            throw new Error("Une erreur s'est produite lors de la récupération de l'évènement !")
        }
    },

    // Méthode pour récupérer les événements créés par un utilisateur spécifique
    getByCreator: async function (user_id) {
        try {
            const db = await connectToDatabase()
            let eventsCollection = await db.collection("events");
            return await eventsCollection.find({"creator": new ObjectId(user_id)}).toArray()
        } catch (e) {
            throw new Error("Une erreur s'est produite lors de la récupération des évènements !")
        }
    },


    // Méthode pour créer un nouvel événement
    create: async function (data, user) {
        try {
            const db = await connectToDatabase()
            let eventsCollection = await db.collection("events");
            // Vérification de la validité de la date
            if((new Date(data.date)).getTime() > 0){
                data.timestamp = (new Date(data.date)).getTime()
                delete data.date;
            }else{
                throw new Error("La date indiquée n'est pas valide !");
            }
            data.creator = user._id;
            // Insertion de l'événement dans la collection
            let event = await eventsCollection.insertOne(data);
            return event.insertedId;
        } catch (e) {
            throw new Error("Une erreur est survenue lors de la création de l'évènement !");
        }
    },

    // Méthode pour mettre à jour un événement existant
    update: async function (id, data) {
        try {
            const db = await connectToDatabase()
            let eventsCollection = await db.collection("events");
            data.creator = new ObjectId(data.creator);
            if((new Date(data.date)).getTime() > 0){
                data.timestamp = (new Date(data.date)).getTime()
                delete data.date;
            }else{
                throw new Error("La date indiquée n'est pas valide !");
            }
            // Mise à jour de l'événement dans la collection
            let event = await eventsCollection.updateOne({_id: new ObjectId(id)}, {$set: data});
            return event.acknowledged;
        } catch (e) {
            throw new Error("Une erreur est survenue lors de la mise à jour de l'évènement !");
        }
    }

}

module.exports = Event;