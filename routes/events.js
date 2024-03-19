const express = require('express');
const router = express.Router();
const events = require("../model/Event");
const users = require("../model/User");

router.get('/', users.authenticateToken, async (req, res) => {
    let filters = req.query.filter != null ? JSON.parse(req.query.filter):[];
    let sort = req.query.sort != null ? JSON.parse(req.query.sort):{};
    res.send(await events.getAll(filters, sort));
});

router.get('/:eventId', users.authenticateToken, async (req, res) => {
    events.getById(req.params.eventId).then((event) => {
        res.send(event);
    }).catch(() => {
        res.status(404).send('Page not found!');
    })

});

router.post('/', users.authenticateToken, async(req, res) => {
    events.create(req.body, req.user).then((eventId) => {
        res.send(eventId);
    }).catch(() => {
        res.status(400).send()
    })
});

router.put('/:eventId', users.authenticateToken, async(req, res) => {
    events.update(req.params.eventId, req.body).then((result) => {
        res.send(result);
    }).catch(() => {
        res.status(400).send()
    })
});

module.exports = router;