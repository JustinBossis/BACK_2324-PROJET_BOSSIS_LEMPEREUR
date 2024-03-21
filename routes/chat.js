const express = require('express');
const router = express.Router();
const chat = require("../model/Chat");
const users = require("../model/User");

// Définition d'une route GET avec un paramètre ':userId' dans l'URL pour récupérer une conversation avec un user spécifique et la créer si elle n'existe pas
// Utilisation de la fonction middleware 'authenticateToken' pour vérifier le token d'authentification de l'utilisateur
router.get('/:userId', users.authenticateToken, async (req, res) => {
    // Récupération de la conversation entre l'utilisateur authentifié (req.user._id) et l'utilisateur spécifié dans l'URL (req.params.userId)
    chat.getById(req.params.userId, req.user._id).then((conversation) => {
        // Si aucune conversation n'est trouvée, créer une nouvelle conversation entre les deux users
        if(conversation.length === 0){
            chat.create({users: [req.params.userId, req.user._id.toString()]}).then(() => {
                //Renvoyer la conversation créée
                chat.getById(req.params.userId, req.user._id).then(conv =>{
                    res.send(conv);
                }).catch((error) => {
                    res.status(404).send({message: error.message});
                });
            }).catch((error) => {
                res.status(404).send({message: error.message});
            });
        }else{
            // Si une conversation existe déjà entre les deux utilisateurs, envoyer la conversation en réponse
            res.send(conversation);
        }
    }).catch((error) => {
        res.status(404).send({message: error.message});
    })

});

module.exports = router;