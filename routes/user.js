const express = require('express');
const users = require("../model/User");
const router = express.Router();

router.get('/', async (req, res) => {
    users.getAll().then((event) => {
        res.send(event);
    }).catch(() => {
        res.status(404).send('Page not found!');
    })
});

router.post('/connect', async (req, res) => {
    users.connectUser(req.body.email, req.body.password).then((event) => {
        res.send(event);
    }).catch((error) => {
        res.status(401).send({error: error.message});
    })
});

router.get('/:userId', users.authenticateToken, async (req, res) => {
    users.getById(req.user._id.toString()).then((event) => {
        res.send(event);
    }).catch((error) => {
        res.status(404).send({error: error.message});
    })
});
router.post('/',async (req, res, next) => {
    try {
        /*const data= {
            firstname: "testfirst", lastname: "testlast", username:"usertest", email: "testemail@test.com",password: "tressecurise",admin:"false", favorites: [], birthdate:"01/12/2000", picture:"public/images/users/avatar.png"
        }*/
        res.send (await users.createUser(req.body));
    } catch (e) {
        res.status(400).send({error: e.message});
    }
});

router.post('/update', users.authenticateToken, async (req, res, next) => {
    try {
        res.send (await users.updateUser(req.body, req.user));
    } catch (e) {
        console.error("Erreur : ", e);
    }
});

router.post('/refreshtoken',async (req, res, next) => {
    try {
        res.send(await users.useRefreshToken(req.body.refreshtoken));
    } catch (e) {
        console.error("Erreur : ", e);
        res.status(401).send({error: e.message});
    }
});

router.post('/addFavoriteEvent', users.authenticateToken, async (req, res, next) => {
    try {
        res.send(await users.addToFavorite(req.body.idEvent, req.user));
    } catch (e) {
        res.status(404).send({error: "Une erreur s'est produite lors de l'ajout aux favoris !"})
    }
});

router.post('/removeFavoriteEvent', users.authenticateToken, async (req, res, next) => {
    try {
        res.send(await users.removeToFavorite(req.body.idEvent, req.user));
    } catch (e) {
        res.status(404).send({error: "Une erreur s'est produite lors de la suppression des favoris !"})
    }
});

module.exports = router;