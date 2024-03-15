const express = require('express');
const router = express.Router();
const chat = require("../model/Chat");

router.get('/', async (req, res) => {
    chat.getAll().then((conversations) => {
        res.send(conversations);
    }).catch(() => {
        res.status(404).send('Page not found!');
    })
});

router.get('/:chatId', async (req, res) => {
    chat.getById(req.params.chatId).then((conversation) => {
        res.send(conversation);
    }).catch(() => {
        res.status(404).send('Page not found!');
    })

});

router.post('/', async(req, res) => {
    chat.create(req.body).then((chatId) => {
        res.send(chatId);
    }).catch(() => {
        res.status(400).send()
    })
});

module.exports = router;