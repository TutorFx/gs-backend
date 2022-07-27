const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  res.send({ status: 'ok' });
});

module.exports = (app) => app.use("/", router);