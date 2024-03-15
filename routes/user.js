const express = require('express');
const user = require("../model/User");
const router = express.Router();

router.get('/', async (req, res) => {
    user.getById("65d8a7b0080138bf9f04bab4").then((event) => {
        res.send(event);
    }).catch(() => {
        res.status(404).send('Page not found!');
    })
});

router.get('/:userId', async (req, res) => {
    user.getById(req.params.userId).then((event) => {
        res.send(event);
    }).catch(() => {
        res.status(404).send('Page not found!');
    })
});

router.get('/connect/:emailUser', async (req, res) => {
    user.connectUser(req.params.emailUser, "tressecuriseMaismauvais").then((event) => {
        res.send(event);
    }).catch(() => {
        res.status(404).send('Page not found!');
    })
});

router.post('/',async (req, res, next) => {
    try {
        const data= {
            firstname: "testfirst", lastname: "testlast", username:"usertest", email: "testemail@test.com",password: "tressecurise",admin:"false", favorites: [], birthdate:"01/12/2000", picture:"public/images/users/avatar.png"
        }
        await user.createUser(data);
    } catch (e) {
        console.error("Erreur : ", e);
    }
});

module.exports = router;