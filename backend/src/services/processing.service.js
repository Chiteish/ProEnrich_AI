const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const axios = require("axios");

const {
    updateJob,
    getJob,
    getAllJobs
} = require("./job.service");

const getAIServiceUrl = () =>
    process.env.AI_SERVICE_URL || "http://localhost:8001";

const AI_REQUEST_TIMEOUT = 30000; // 30 seconds timeout

// In-memory set of actively processing job IDs in this process
const activeJobs = new Set();


function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        const rows = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {
                rows.push(row);
            })
            .on("end", () => {
                resolve(rows);
            })
            .on("error", (error) => {
                reject(error);
            });
    });
}


/*
 * Convert one CSV row into the format
 * expected by Member 2 AI service.
 */
function mapRowToAIRequest(row) {
    return {
        mfg_part_num: row.Mfg_Part_Num || "",
        part_desc: row.Part_Desc || "",
        e1_brand: row.E1_Brand || "",
        unilog_brand: row.Unilog_Brand || "",
        dib_brand: row.DIB_Brand || "",
        part_manuf: row.Part_Manuf || ""
    };
}


/*
 * Check if the AI service is reachable.
 */
async function checkAIServiceHealth() {
    const serviceUrl = getAIServiceUrl();
    try {
        await axios.get(`${serviceUrl}/docs`, {
            timeout: 5000
        });
        return { available: true };
    } catch (error) {
        const isUnreachable =
            error.code === "ECONNREFUSED" ||
            error.code === "ENOTFOUND" ||
            error.code === "EHOSTUNREACH" ||
            error.code === "ENETUNREACH" ||
            error.code === "ETIMEDOUT";

        return {
            available: false,
            reason: isUnreachable
                ? `AI service is unavailable or unreachable at ${serviceUrl} (${error.code || error.message})`
                : `AI service health check failed: ${error.message}`
        };
    }
}


/*
 * Validate that AI response contains at least product_id and processing_status.
 */
function isValidAIResponse(data) {
    return Boolean(
        data &&
        typeof data === "object" &&
        data.product_id &&
        data.processing_status
    );
}


/*
 * Send one product to Member 2 AI service with 30s timeout.
 */
async function processProductWithAI(product) {
    const serviceUrl = getAIServiceUrl();
    const response = await axios.post(
        `${serviceUrl}/ai/process-product`,
        product,
        {
            timeout: AI_REQUEST_TIMEOUT
        }
    );

    return response.data;
}


/*
 * Atomically save processed AI results to backend/outputs/<jobId>.json.
 */
function saveResults(jobId, results) {
    const outputDirectory =
        path.join(process.cwd(), "outputs");

    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, {
            recursive: true
        });
    }

    const outputPath =
        path.join(
            outputDirectory,
            `${jobId}.json`
        );

    const tempPath =
        path.join(
            outputDirectory,
            `${jobId}.json.tmp`
        );

    const payload = JSON.stringify(results, null, 2);

    try {
        fs.writeFileSync(tempPath, payload, "utf-8");
        fs.renameSync(tempPath, outputPath);
    } catch (_) {
        // Direct write fallback
        fs.writeFileSync(outputPath, payload, "utf-8");
    }

    return outputPath;
}


/**
 * Check if a job is actively running in the current process.
 */
function isJobRunning(jobId) {
    return activeJobs.has(jobId);
}


/**
 * Process or resume catalog processing for a given job.
 */
async function processCatalog(jobId, filePath, options = {}) {
    const force = Boolean(options.force);
    const serviceUrl = getAIServiceUrl();

    if (activeJobs.has(jobId)) {
        console.log(`Job ${jobId} is already actively running.`);
        return;
    }

    activeJobs.add(jobId);

    const outputDirectory = path.join(process.cwd(), "outputs");
    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
    }
    const outputPath = path.join(outputDirectory, `${jobId}.json`);

    let results = [];
    let startIndex = 0;

    try {
        // Step 1: Pre-flight connectivity check to AI service
        const health = await checkAIServiceHealth();
        if (!health.available) {
            console.error(`AI service check failed for job ${jobId}:`, health.reason);
            updateJob(jobId, {
                status: "FAILED",
                error: health.reason
            });
            return;
        }

        const rows = await readCSV(filePath);
        const total = rows.length;

        if (total === 0) {
            updateJob(jobId, {
                status: "FAILED",
                error: "Uploaded CSV contains no product rows",
                total: 0,
                processed: 0,
                nextIndex: 0,
                progress: 0
            });
            return;
        }

        // Step 2: Determine resume starting point
        const currentJob = getJob(jobId);

        if (!force && currentJob && (currentJob.nextIndex > 0 || currentJob.processed > 0)) {
            startIndex = currentJob.nextIndex || currentJob.processed || 0;

            // Load already processed results from disk and slice to exactly startIndex to prevent duplicates
            if (fs.existsSync(outputPath)) {
                try {
                    const existingData = fs.readFileSync(outputPath, "utf-8");
                    const loadedResults = JSON.parse(existingData);
                    results = loadedResults.slice(0, startIndex);
                    console.log(`Resuming job ${jobId} from index ${startIndex}/${total} (loaded exactly ${results.length} prior results)`);
                } catch (readErr) {
                    console.warn(`Could not parse existing output for job ${jobId}, resetting results array:`, readErr.message);
                    results = [];
                    startIndex = 0;
                }
            }
        } else {
            results = [];
            startIndex = 0;
        }

        updateJob(jobId, {
            status: "PROCESSING",
            total,
            processed: results.length,
            nextIndex: startIndex,
            progress: Math.round((results.length / total) * 100),
            outputPath
        });

        console.log(`Job ${jobId}: Processing items ${startIndex + 1} to ${total}...`);

        for (let i = startIndex; i < total; i++) {
            const product = rows[i];
            const productId = product.Mfg_Part_Num || `ROW-${i + 1}`;

            // Save/register product in the database so it appears in the catalog
            try {
                const productModel = require("../models/product.model");
                productModel.saveProductFromCatalog({
                    mpn: product.Mfg_Part_Num || `ROW-${i + 1}`,
                    manufacturer: product.Part_Manuf || "",
                    description: product.Part_Desc || "",
                    brand: product.E1_Brand || product.Unilog_Brand || product.DIB_Brand || "",
                    e1_brand: product.E1_Brand || "",
                    unilog_brand: product.Unilog_Brand || "",
                    dib_brand: product.DIB_Brand || "",
                    part_manuf: product.Part_Manuf || "",
                    part_desc: product.Part_Desc || ""
                });
            } catch (dbError) {
                console.error("Failed to register catalog product:", dbError);
            }

            try {
                const aiRequest = mapRowToAIRequest(product);
                const aiResult = await processProductWithAI(aiRequest);

                if (!isValidAIResponse(aiResult)) {
                    throw new Error(
                        "Invalid AI response: missing required 'product_id' or 'processing_status'"
                    );
                }

                results.push({
                    input: product,
                    aiResult: aiResult
                });

                try {
                    const productModel = require("../models/product.model");
                    productModel.saveProductFromAI({
                        mpn: product.Mfg_Part_Num || `ROW-${i + 1}`,
                        manufacturer: product.Part_Manuf || "",
                        description: product.Part_Desc || "",
                        brand: product.E1_Brand || product.Unilog_Brand || product.DIB_Brand || "",
                        e1_brand: product.E1_Brand || "",
                        unilog_brand: product.Unilog_Brand || "",
                        dib_brand: product.DIB_Brand || "",
                        part_manuf: product.Part_Manuf || "",
                        part_desc: product.Part_Desc || ""
                    }, aiResult);
                } catch (dbError) {
                    console.error("Failed to save product AI result to database:", dbError);
                }

            } catch (aiError) {
                const isConnectionError =
                    aiError.code === "ECONNREFUSED" ||
                    aiError.code === "ENOTFOUND" ||
                    aiError.code === "EHOSTUNREACH" ||
                    aiError.code === "ENETUNREACH";

                if (isConnectionError) {
                    saveResults(jobId, results);
                    updateJob(jobId, {
                        status: "FAILED",
                        error: `AI service became unreachable at ${serviceUrl} during processing (${aiError.code || aiError.message})`,
                        processed: results.length,
                        nextIndex: i,
                        progress: Math.round((results.length / total) * 100),
                        outputPath
                    });
                    throw new Error(
                        `AI service became unreachable at ${serviceUrl} during processing (${aiError.code || aiError.message})`
                    );
                }

                const errorMsg =
                    aiError.code === "ECONNABORTED"
                        ? `AI service request timed out after ${AI_REQUEST_TIMEOUT / 1000} seconds`
                        : (aiError.response?.data?.message || aiError.response?.data || aiError.message);

                console.error(
                    `AI processing failed for product ${i + 1} (${productId}):`,
                    errorMsg
                );

                results.push({
                    product_id: productId,
                    status: "FAILED",
                    error: errorMsg,
                    input: product,
                    aiResult: null
                });
            }

            // Step 3: Persist results and progress incrementally after every product
            saveResults(jobId, results);

            const processedCount = results.length;
            const nextIdx = i + 1;
            const progress = Math.round((processedCount / total) * 100);

            updateJob(jobId, {
                processed: processedCount,
                nextIndex: nextIdx,
                progress,
                outputPath
            });
        }

        // Step 4: Complete job
        const failedCount = results.filter(r => r.status === "FAILED").length;
        const allFailed = total > 0 && failedCount === total;

        if (allFailed) {
            updateJob(jobId, {
                status: "FAILED",
                error: "All products failed during AI processing",
                progress: 100,
                processed: total,
                nextIndex: total,
                outputPath
            });
            console.log(`Job ${jobId} failed: all ${total} products encountered errors.`);
        } else {
            updateJob(jobId, {
                status: "COMPLETED",
                progress: 100,
                processed: total,
                nextIndex: total,
                outputPath,
                backfilled: true
            });
            console.log(`Job ${jobId} completed successfully (${total - failedCount}/${total} succeeded). Output saved to: ${outputPath}`);
        }

    } catch (error) {
        console.error(`Job ${jobId} execution stopped:`, error.message || error);

        if (results.length > 0) {
            try {
                saveResults(jobId, results);
            } catch (saveErr) {
                console.error("Failed to save partial results:", saveErr);
            }
        }

        const current = getJob(jobId);
        updateJob(jobId, {
            status: "FAILED",
            error: error.message || "Catalog processing failed",
            processed: results.length,
            nextIndex: results.length,
            outputPath: current?.outputPath || outputPath
        });

    } finally {
        activeJobs.delete(jobId);
    }
}


/**
 * Automatically recover and resume jobs that were in PROCESSING/QUEUED state when Node restarted.
 */
function resumeInterruptedJobs() {
    try {
        const jobs = getAllJobs();
        for (const [jobId, job] of Object.entries(jobs)) {
            if (
                (job.status === "PROCESSING" || job.status === "QUEUED") &&
                !activeJobs.has(jobId) &&
                job.filePath &&
                fs.existsSync(job.filePath)
            ) {
                console.log(`[Auto-Recovery] Resuming interrupted job ${jobId} from product ${(job.nextIndex || job.processed || 0) + 1}...`);
                processCatalog(jobId, job.filePath, { force: false }).catch(err => {
                    console.error(`[Auto-Recovery] Error resuming job ${jobId}:`, err.message);
                });
            }
        }
    } catch (error) {
        console.error("[Auto-Recovery] Failed to check for interrupted jobs:", error);
    }
}


module.exports = {
    processCatalog,
    isValidAIResponse,
    isJobRunning,
    resumeInterruptedJobs
};