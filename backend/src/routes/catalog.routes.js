const express = require("express");
const upload = require("../middleware/upload.middleware");

const {
    uploadCatalog
} = require("../controllers/catalog.controller");

const router = express.Router();

router.post(
    "/upload",
    upload.single("file"),
    uploadCatalog
);

module.exports = router;