const fs = require("fs");
const csv = require("csv-parser");

const {
    updateJob,
    getJob
} = require("./job.service");


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


async function processCatalog(jobId, filePath) {

    try {

        const rows = await readCSV(filePath);

        const total = rows.length;

        updateJob(jobId, {
            status: "PROCESSING",
            total,
            processed: 0,
            progress: 0
        });

        console.log(`Processing ${total} products...`);

        for (let i = 0; i < rows.length; i++) {

            const product = rows[i];

            console.log(
                `Processing product ${i + 1}/${total}:`,
                product.Mfg_Part_Num
            );

            // TEMPORARY
            // Member 2 AI service will be called here later.

            await new Promise(resolve =>
                setTimeout(resolve, 10)
            );

            const processed = i + 1;

            const progress =
                Math.round((processed / total) * 100);

            updateJob(jobId, {
                processed,
                progress
            });
        }

        updateJob(jobId, {
            status: "COMPLETED",
            progress: 100
        });

        console.log(`Job ${jobId} completed.`);

    } catch (error) {

        console.error(
            `Job ${jobId} failed:`,
            error
        );

        updateJob(jobId, {
            status: "FAILED",
            error: error.message
        });
    }
}


module.exports = {
    processCatalog
}; 
