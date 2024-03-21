const express = require('express');
const router = express.Router();
const chat = require("../model/Chat");
const users = require("../model/User");

router.get('/:userId', users.authenticateToken, async (req, res) => {
    chat.getById(req.params.userId, req.user._id).then((conversation) => {
        if(conversation.length === 0){
            chat.create({users: [req.params.userId, req.user._id.toString()]}).then(() => {
                chat.getById(req.params.userId, req.user._id).then(conv =>{
                    res.send(conv);
                }).catch((error) => {
                    res.status(404).send({error: error.message});
                });
            }).catch((error) => {
                res.status(404).send({error: error.message});
            });
        }else{
            res.send(conversation);
        }
    }).catch((error) => {
        res.status(404).send({error: error.message});
    })

});

module.exports = router;