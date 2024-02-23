const express = require('express');
const router = express.Router();
const events = require("../model/Event");

router.get('/', async (req, res) => {
    let filters = req.query.filter != null ? JSON.parse(req.query.filter):[];
    let sort = req.query.sort != null ? JSON.parse(req.query.sort):{};
    res.send(await events.getAll(filters, sort));
});

module.exports = router;