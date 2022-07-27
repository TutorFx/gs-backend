const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        res.status(200).send({status: 'ok'});
        
    } catch (err) {
        return res.status(400).send({error: ':('});
    }
});

module.exports = (app) => app.use("/docs", router);