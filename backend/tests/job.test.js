const test = require("node:test");
const assert = require("node:assert");
const http = require("http");
const fs = require("fs");
const path = require("path");

const app = require("../src/app");

test("Ingestion Job Flow Suite", async (t) => {
    // Start the server on a dynamic port
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    
    const baseUrl = `http://localhost:${port}/api`;

    // Create a dummy CSV file on disk for testing
    const testCsvPath = path.resolve(__dirname, "test_catalog.csv");
    fs.writeFileSync(testCsvPath, "Mfg_Part_Num,Part_Desc,E1_Brand,Unilog_Brand,DIB_Brand,Part_Manuf\nTEST_SKU_99,Test description,E1,Unilog,DIB,Test Manufacturer\n");

    t.after(() => {
        server.close();
        if (fs.existsSync(testCsvPath)) {
            fs.unlinkSync(testCsvPath);
        }
    });

    let jobId = null;

    await t.test("TEST 1: Ingest CSV catalog upload", async () => {
        const fileStream = fs.createReadStream(testCsvPath);
        const form = new FormData();
        const fileContent = fs.readFileSync(testCsvPath, "utf-8");
        const fileBlob = new Blob([fileContent], { type: "text/csv" });
        form.append("file", fileBlob, "test_catalog.csv");

        const response = await fetch(`${baseUrl}/catalog/upload`, {
            method: "POST",
            body: form
        });

        assert.strictEqual(response.status, 201);
        const body = await response.json();
        assert.strictEqual(body.success, true);
        assert.ok(body.job);
        assert.ok(body.job.jobId);
        assert.strictEqual(body.job.status, "UPLOADED");
        jobId = body.job.jobId;
    });

    await t.test("TEST 2: Start processing the uploaded job", async () => {
        assert.ok(jobId, "jobId must be set from TEST 1");
        const response = await fetch(`${baseUrl}/jobs/${jobId}/process`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({})
        });

        assert.strictEqual(response.status, 200);
        const body = await response.json();
        assert.strictEqual(body.success, true);
        assert.strictEqual(body.job.status, "QUEUED");
    });

    await t.test("TEST 3: Retrieve job status", async () => {
        assert.ok(jobId, "jobId must be set from TEST 1");
        const response = await fetch(`${baseUrl}/jobs/${jobId}/status`);
        assert.strictEqual(response.status, 200);
        const body = await response.json();
        assert.strictEqual(body.success, true);
        assert.strictEqual(body.job.jobId, jobId);
        assert.ok(["QUEUED", "PROCESSING", "COMPLETED", "FAILED"].includes(body.job.status));
    });

    await t.test("TEST 4: Retrieve non-existent job status returns 404", async () => {
        const response = await fetch(`${baseUrl}/jobs/NON_EXISTENT_JOB_ID/status`);
        assert.strictEqual(response.status, 404);
        const body = await response.json();
        assert.strictEqual(body.success, false);
    });
});
