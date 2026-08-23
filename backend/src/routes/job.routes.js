const express = require("express");

const {
    startProcessing,
    getJobStatus,
    getJobOutput,
    downloadJobOutput
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

router.get(
    "/:jobId/output",
    getJobOutput
);

router.get(
    "/:jobId/output/download",
    downloadJobOutput
);

module.exports = router;
