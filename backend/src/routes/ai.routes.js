const express = require("express");

const {
    testAI,
    enrichProduct
} = require("../controllers/ai.controller");

const router = express.Router();

router.post(
    "/test",
    testAI
);

router.post(
    "/enrich",
    enrichProduct
);

module.exports = router;