const express = require('express');
const users = require("../model/User");
const router = express.Router();

// Route GET pour récupérer tous les utilisateurs
router.get('/', async (req, res) => {
    // Récupération de tous les utilisateurs
    users.getAll().then((event) => {
        res.send(event);
    }).catch(() => {
        res.status(404).send('Page not found!');
    })
});

// Route POST pour connecter un utilisateur
router.post('/connect', async (req, res) => {
    // Tentative de connexion de l'utilisateur avec l'email et le mot de passe fournis
    users.connectUser(req.body.email, req.body.password).then((event) => {
        res.send(event);
    }).catch((error) => {
        // En cas d'erreur, envoi d'une réponse avec le statut 401 et un message d'erreur
        res.status(401).send({message: error.message});
    })
});

// Route GET pour récupérer les événements favoris de l'utilisateur authentifié
router.get('/favorites', users.authenticateToken, async (req, res) => {
    // Récupération des événements favoris de l'utilisateur à partir de son ID
    users.getFavoriteEvents(req.user._id).then((events) => {
        if(events.length === 1){
            res.send(events[0].events);
        }else{
            res.status(404).send({message: "Aucun utilisateur trouvé !"});
        }
    }).catch((error) => {
        res.status(404).send({message: error.message});
    })
});

// Route GET pour récupérer les détails d'un utilisateur spécifique par son ID
router.get('/:userId', users.authenticateToken, async (req, res) => {
    // Récupération des détails de l'utilisateur à partir de son ID
    users.getById(req.user._id.toString()).then((event) => {
        res.send(event);
    }).catch((error) => {
        res.status(404).send({message: error.message});
    })
});

// Route POST pour créer un nouvel utilisateur
router.post('/',async (req, res, next) => {
    try {
        // Création de l'utilisateur avec les données fournies dans le body de la requête
        res.send (await users.createUser(req.body));
    } catch (e) {
        res.status(400).send({message: e.message});
    }
});

// Route POST pour mettre à jour les détails d'un utilisateur existant
router.post('/update', users.authenticateToken, async (req, res, next) => {
    try {
        // Mise à jour des détails de l'utilisateur avec les données fournies dans le corps de la requête
        res.send (await users.updateUser(req.body, req.user));
    } catch (e) {
        console.error("Erreur : ", e);
    }
});

// Route POST pour rafraîchir le token d'authentification
router.post('/refreshtoken',async (req, res, next) => {
    try {
        res.send(await users.useRefreshToken(req.body.refreshtoken));
    } catch (e) {
        console.error("Erreur : ", e);
        res.status(401).send({message: e.message});
    }
});

// Route POST pour ajouter un événement aux favoris de l'utilisateur
router.post('/addFavoriteEvent', users.authenticateToken, async (req, res, next) => {
    try {
        res.send(await users.addToFavorite(req.body.idEvent, req.user));
    } catch (e) {
        res.status(404).send({message: "Une erreur s'est produite lors de l'ajout aux favoris !"})
    }
});

// Route POST pour supprimer un événement des favoris de l'utilisateur
router.post('/removeFavoriteEvent', users.authenticateToken, async (req, res, next) => {
    try {
        res.send(await users.removeToFavorite(req.body.idEvent, req.user));
    } catch (e) {
        res.status(404).send({message: "Une erreur s'est produite lors de la suppression des favoris !"})
    }
});

module.exports = router;