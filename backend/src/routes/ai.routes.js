const express = require("express");

const {
    testAI,
    enrichProduct,
    getAsset
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

router.get(
    "/assets/:productId/:filename",
    getAsset
);

router.get(
    "/assets/:filename",
    getAsset
);

module.exports = router;