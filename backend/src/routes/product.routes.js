const express = require("express");
const {
    getProducts,
    getProductByMpn,
    getProductEnrichment,
    getProductAssets,
    getProductAttributes,
    getProductEvidence
} = require("../controllers/product.controller");

const router = express.Router();

router.get("/", getProducts);
router.get("/:mpn", getProductByMpn);
router.get("/:mpn/enrichment", getProductEnrichment);
router.get("/:mpn/assets", getProductAssets);
router.get("/:mpn/attributes", getProductAttributes);
router.get("/:mpn/evidence", getProductEvidence);

module.exports = router;
