const express = require('express');
const router = express.Router();
const events = require("../model/Event");
const users = require("../model/User");

// Route GET pour récupérer tous les événements avec des filtres et tris specifies
// Utilisation de la fonction 'authenticateToken' pour vérifier le token d'authentification de l'utilisateur
router.get('/', users.authenticateToken, async (req, res) => {
    try{
        // Récupération des filtres et du tri depuis les paramètres de requête
        let filters = req.query.filter != null ? JSON.parse(req.query.filter):[];
        let sort = req.query.sort != null ? JSON.parse(req.query.sort):{};
        // Récupération de tous les événements avec les filtres et le tri spécifiés
        res.send(await events.getAll(filters, sort));
    }catch (error){
        // En cas d'erreur, envoyer une réponse avec le statut 404 et un message d'erreur
        res.status(404).send({message: error.message});
    }
});

// Route GET pour récupérer tous les événements créés par un utilisateur spécifique
router.get('/user/:userId', users.authenticateToken, async (req, res) => {
    events.getByCreator(req.params.userId).then((events) => {
        res.send(events);
    }).catch((error) => {
        // En cas d'erreur, envoyer une réponse avec le statut 404 et un message d'erreur
        res.status(404).send({message: error.message});
    })
});

// Route GET pour récupérer un événement par son ID
router.get('/:eventId', users.authenticateToken, async (req, res) => {
    events.getById(req.params.eventId).then((event) => {
        res.send(event);
    }).catch((error) => {
        // En cas d'erreur, envoyer une réponse avec le statut 404 et un message d'erreur
        res.status(404).send({message: error.message});
    })

});

// Route POST pour créer un nouvel événement
router.post('/', users.authenticateToken, async(req, res) => {
    // Création de l'événement avec les données fournies dans le body de la requête
    events.create(req.body, req.user).then((eventId) => {
        // Envoi de l'ID de l'événement créé en réponse
        res.send(eventId);
    }).catch((e) => {
        // En cas d'erreur, envoyer une réponse avec le statut 400 et un message d'erreur
        res.status(400).send({message: e.message});
    })
});

// Route PUT pour mettre à jour un événement existant
router.put('/:eventId', users.authenticateToken, async(req, res) => {
    // Mise à jour de l'événement avec les données fournies dans le body de la requête
    events.update(req.params.eventId, req.body).then((result) => {
        res.send(result);
    }).catch((e) => {
        // En cas d'erreur, envoyer une réponse avec le statut 400 et un message d'erreur
        res.status(400).send({message: e.message});
    })
});

module.exports = router;