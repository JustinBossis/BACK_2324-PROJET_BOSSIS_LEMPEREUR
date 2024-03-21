const express = require('express');
const router = express.Router();
const events = require("../model/Event");
const users = require("../model/User");

router.get('/', users.authenticateToken, async (req, res) => {
    try{
        let filters = req.query.filter != null ? JSON.parse(req.query.filter):[];
        let sort = req.query.sort != null ? JSON.parse(req.query.sort):{};
        res.send(await events.getAll(filters, sort));
    }catch (error){
        res.status(404).send({error: error.message});
    }
});

router.get('/user/:userId', users.authenticateToken, async (req, res) => {
    events.getByCreator(req.params.userId).then((events) => {
        res.send(events);
    }).catch((error) => {
        res.status(404).send({error: error.message});
    })
});

router.get('/:eventId', users.authenticateToken, async (req, res) => {
    events.getById(req.params.eventId).then((event) => {
        res.send(event);
    }).catch((error) => {
        res.status(404).send({error: error.message});
    })

});

router.post('/', users.authenticateToken, async(req, res) => {
    events.create(req.body, req.user).then((eventId) => {
        res.send(eventId);
    }).catch((e) => {
        res.status(400).send({error: e.message});
    })
});

router.put('/:eventId', users.authenticateToken, async(req, res) => {
    events.update(req.params.eventId, req.body).then((result) => {
        res.send(result);
    }).catch((e) => {
        res.status(400).send({error: e.message});
    })
});

module.exports = router;