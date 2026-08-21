const express = require("express");

const {
    startProcessing,
    getJobStatus
} = require("../controllers/job.controller");

const router = express.Router();

router.post(
    "/:jobId/process",
    startProcessing
);

router.get(
    "/:jobId/status",
    getJobStatus
);

module.exports = router; 
