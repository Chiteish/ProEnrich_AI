const fs = require("fs");
const path = require("path");

const DATA_DIR = path.resolve(__dirname, "../../data");
const JOBS_FILE = path.join(DATA_DIR, "jobs.json");

/**
 * Ensure data directory and jobs.json file exist.
 */
function ensureJobsFile() {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        if (!fs.existsSync(JOBS_FILE)) {
            fs.writeFileSync(JOBS_FILE, JSON.stringify({}, null, 2), "utf-8");
        }
    } catch (error) {
        console.error("Failed to ensure jobs storage file:", error);
    }
}

/**
 * Read all jobs from persistent JSON store.
 */
function readJobs() {
    try {
        ensureJobsFile();
        const rawData = fs.readFileSync(JOBS_FILE, "utf-8");
        if (!rawData.trim()) {
            return {};
        }
        return JSON.parse(rawData);
    } catch (error) {
        console.error("Error reading jobs from JSON store:", error);
        return {};
    }
}

/**
 * Write jobs object to persistent JSON store.
 */
function writeJobs(jobs) {
    try {
        ensureJobsFile();
        fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2), "utf-8");
    } catch (error) {
        console.error("Error writing jobs to JSON store:", error);
    }
}

/**
 * Create a new job and persist it.
 */
function createJob(catalogId, filePath) {
    const jobId = `JOB-${Date.now()}`;
    const now = new Date().toISOString();

    const job = {
        jobId,
        catalogId,
        filePath,
        status: "UPLOADED",
        progress: 0,
        total: 0,
        processed: 0,
        nextIndex: 0,
        createdAt: now,
        updatedAt: now
    };

    const jobs = readJobs();
    jobs[jobId] = job;
    writeJobs(jobs);

    return job;
}

/**
 * Retrieve a job by jobId from persistent storage.
 */
function getJob(jobId) {
    const jobs = readJobs();
    return jobs[jobId] || null;
}

/**
 * Retrieve all jobs from persistent storage.
 */
function getAllJobs() {
    return readJobs();
}

/**
 * Update an existing job and persist changes.
 */
function updateJob(jobId, updates) {
    const jobs = readJobs();
    const job = jobs[jobId];

    if (!job) {
        return null;
    }

    Object.assign(job, updates);
    job.updatedAt = new Date().toISOString();

    jobs[jobId] = job;
    writeJobs(jobs);

    return job;
}

module.exports = {
    createJob,
    getJob,
    getAllJobs,
    updateJob
};