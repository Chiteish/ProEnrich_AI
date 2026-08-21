const jobs = new Map();


function createJob(catalogId, filePath) {

    const jobId = `JOB-${Date.now()}`;

    const job = {

        jobId,

        catalogId,

        filePath,

        status: "UPLOADED",

        progress: 0,

        total: 0,

        processed: 0,

        createdAt: new Date(),

        updatedAt: new Date()

    };

    jobs.set(jobId, job);

    return job;
}


function getJob(jobId) {

    return jobs.get(jobId);

}


function updateJob(jobId, updates) {

    const job = jobs.get(jobId);

    if (!job) {
        return null;
    }

    Object.assign(job, updates);

    job.updatedAt = new Date();

    jobs.set(jobId, job);

    return job;
}


module.exports = {

    createJob,

    getJob,

    updateJob

};