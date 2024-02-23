const express = require('express');
const user = require("../model/User");
const router = express.Router();

router.get('/', async (req, res) => {
    console.log(await user.getById("65d8a7b0080138bf9f04bab4"));
});

module.exports = router;