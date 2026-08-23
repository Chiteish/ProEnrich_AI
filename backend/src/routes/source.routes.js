const express = require('express');
const { getSources } = require('../controllers/source.controller');

const router = express.Router();

router.get('/', getSources);

module.exports = router;
