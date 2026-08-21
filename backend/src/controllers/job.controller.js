const {
    getJob,
    updateJob
} = require("../services/job.service");

const {
    processCatalog
} = require("../services/processing.service");


const startProcessing = async (req, res) => {

    try {

        const { jobId } = req.params;

        const job = getJob(jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        if (
            job.status === "PROCESSING" ||
            job.status === "COMPLETED"
        ) {
            return res.status(400).json({
                success: false,
                message: `Job is already ${job.status.toLowerCase()}`
            });
        }

        updateJob(jobId, {
            status: "QUEUED",
            progress: 0
        });

        // Start processing
        processCatalog(
            jobId,
            job.filePath
        );

        return res.json({
            success: true,
            message: "Catalogue processing started",
            job: getJob(jobId)
        });

    } catch (error) {

        console.error("Processing error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to start processing",
            error: error.message
        });
    }
};


const getJobStatus = async (req, res) => {

    try {

        const { jobId } = req.params;

        const job = getJob(jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        return res.json({
            success: true,
            job
        });

    } catch (error) {

        console.error("Status error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get job status",
            error: error.message
        });
    }
};


module.exports = {
    startProcessing,
    getJobStatus
};