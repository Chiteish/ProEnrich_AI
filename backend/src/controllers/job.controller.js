const fs = require("fs");
const path = require("path");

const {
    getJob,
    updateJob
} = require("../services/job.service");

const {
    processCatalog,
    isJobRunning
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

        const force =
            req.query.force === "true" ||
            req.body?.force === true;

        if (job.status === "COMPLETED" && !force) {
            return res.status(400).json({
                success: false,
                message: "Job is already completed",
                hint: "Add ?force=true to restart processing from the beginning"
            });
        }

        if (isJobRunning(jobId)) {
            return res.status(400).json({
                success: false,
                message: "Job is currently being processed",
                job: getJob(jobId)
            });
        }

        const isResuming =
            !force &&
            (job.nextIndex || job.processed || 0) > 0;

        updateJob(jobId, {
            status: "QUEUED",
            ...(force ? { progress: 0, processed: 0, nextIndex: 0 } : {})
        });

        // Start or resume processing asynchronously
        processCatalog(
            jobId,
            job.filePath,
            { force }
        );

        return res.json({
            success: true,
            message: isResuming
                ? `Catalogue processing resumed from product ${(job.nextIndex || job.processed || 0) + 1}`
                : "Catalogue processing started",
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


const getJobOutput = async (req, res) => {

    try {

        const { jobId } = req.params;

        const job = getJob(jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        // If job is in progress or pending
        if (
            job.status === "UPLOADED" ||
            job.status === "QUEUED" ||
            job.status === "PROCESSING"
        ) {
            return res.status(400).json({
                success: false,
                message: `Job is ${job.status.toLowerCase()}, not completed`,
                status: job.status
            });
        }

        // If job failed
        if (job.status === "FAILED") {
            const outputPath =
                job.outputPath ||
                path.resolve(__dirname, "../../outputs", `${jobId}.json`);

            let partialOutput = [];
            if (fs.existsSync(outputPath)) {
                try {
                    partialOutput = JSON.parse(
                        fs.readFileSync(outputPath, "utf-8")
                    );
                } catch (_) {
                    // Ignore parse error for partial output
                }
            }

            return res.status(200).json({
                success: false,
                jobId: job.jobId,
                status: "FAILED",
                error: job.error || "Job processing failed",
                output: partialOutput
            });
        }

        // If job completed
        const outputPath =
            job.outputPath ||
            path.resolve(__dirname, "../../outputs", `${jobId}.json`);

        if (!fs.existsSync(outputPath)) {
            return res.status(404).json({
                success: false,
                message: "Output file not found for this job"
            });
        }

        let output;
        try {
            const rawOutput = fs.readFileSync(outputPath, "utf-8");
            output = JSON.parse(rawOutput);
        } catch (parseError) {
            return res.status(500).json({
                success: false,
                message: "Failed to parse job output file",
                error: parseError.message
            });
        }

        return res.json({
            success: true,
            jobId: job.jobId,
            status: "COMPLETED",
            output
        });

    } catch (error) {

        console.error("Output retrieval error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve job output",
            error: error.message
        });
    }
};


const downloadJobOutput = async (req, res) => {

    try {

        const { jobId } = req.params;

        const job = getJob(jobId);

        // 1. Unknown job
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        // 2. Job still processing / pending
        if (
            job.status === "UPLOADED" ||
            job.status === "QUEUED" ||
            job.status === "PROCESSING"
        ) {
            return res.status(400).json({
                success: false,
                message: `Job is ${job.status.toLowerCase()}, not completed`,
                status: job.status
            });
        }

        // 3. Failed job
        if (job.status === "FAILED") {
            return res.status(400).json({
                success: false,
                message: "Cannot download output for a failed job",
                status: job.status,
                error: job.error || "Job processing failed"
            });
        }

        // 4. Ensure status is COMPLETED
        if (job.status !== "COMPLETED") {
            return res.status(400).json({
                success: false,
                message: "Job is not completed",
                status: job.status
            });
        }

        // 5. Use existing job.outputPath
        const outputPath =
            job.outputPath ||
            path.resolve(__dirname, "../../outputs", `${jobId}.json`);

        if (!fs.existsSync(outputPath)) {
            return res.status(404).json({
                success: false,
                message: "Output file not found for this job"
            });
        }

        // 6. Return as downloadable file with filename proenrich_<jobId>_output.json
        const downloadFilename = `proenrich_${jobId}_output.json`;

        return res.download(outputPath, downloadFilename, (err) => {
            if (err && !res.headersSent) {
                console.error("Download error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Error sending file for download",
                    error: err.message
                });
            }
        });

    } catch (error) {

        console.error("Download error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to process download request",
            error: error.message
        });
    }
};


module.exports = {
    startProcessing,
    getJobStatus,
    getJobOutput,
    downloadJobOutput
};