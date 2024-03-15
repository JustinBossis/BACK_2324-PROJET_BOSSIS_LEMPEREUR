const express = require('express');
const user = require("../model/User");
const users = require("../model/User");
const router = express.Router();

router.get('/', async (req, res) => {
    user.getAll().then((event) => {
        res.send(event);
    }).catch(() => {
        res.status(404).send('Page not found!');
    })
});

router.get('/connect', async (req, res) => {
    user.connectUser(req.query.email, req.query.password).then((event) => {
        res.send(event);
    }).catch(() => {
        res.status(404).send('Page not found!');
    })
});

router.get('/:userId', users.authenticateToken, async (req, res) => {
    user.getById(req.params.userId).then((event) => {
        res.send(event);
    }).catch(() => {
        res.status(404).send('Page not found!');
    })
});
router.post('/',async (req, res, next) => {
    try {
        /*const data= {
            firstname: "testfirst", lastname: "testlast", username:"usertest", email: "testemail@test.com",password: "tressecurise",admin:"false", favorites: [], birthdate:"01/12/2000", picture:"public/images/users/avatar.png"
        }*/
        res.send (await user.createUser(req.body));
    } catch (e) {
        console.error("Erreur : ", e);
    }
});

router.post('/refreshtoken',async (req, res, next) => {
    try {
        res.send(await user.useRefreshToken(req.body.refreshtoken));
    } catch (e) {
        console.error("Erreur : ", e);
        res.send(e);
    }
});

module.exports = router;