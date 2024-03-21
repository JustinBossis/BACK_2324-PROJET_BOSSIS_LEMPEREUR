const express = require('express');
const router = express.Router();
const chat = require("../model/Chat");
const users = require("../model/User");

router.get('/', users.authenticateToken, async (req, res) => {
    chat.getAll().then((conversations) => {
        res.send(conversations);
    }).catch(() => {
        res.status(404).send('Page not found!');
    })
});

router.get('/:userId', users.authenticateToken, async (req, res) => {
    chat.getById(req.params.userId, req.user._id).then((conversation) => {
        if(conversation.length === 0){
            chat.create({users: [req.params.userId, req.user._id.toString()]}).then(() => {
                chat.getById(req.params.userId, req.user._id).then(conv =>{
                    res.send(conv);
                });
            })
        }
        res.send(conversation);
    }).catch(() => {
        res.status(404).send('Page not found!');
    })

});

router.post('/', users.authenticateToken, async(req, res) => {
    chat.create(req.body).then((chatId) => {
        res.send(chatId);
    }).catch(() => {
        res.status(400).send()
    })
});

module.exports = router;