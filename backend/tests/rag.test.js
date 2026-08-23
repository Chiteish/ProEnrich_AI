const test = require("node:test");
const assert = require("node:assert");
const http = require("http");
const axios = require("axios");

// Ensure environment variable is set
process.env.RAG_SERVICE_URL = "http://mock-rag-service:8002";

const app = require("../src/app");
const { enrichProductWithRAG } = require("../src/services/rag.service");

test("RAG Integration Suite", async (t) => {
    // Start the server on a dynamic port
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const backendUrl = `http://localhost:${port}/api/ai/enrich`;

    t.after(() => {
        server.close();
    });

    t.test("TEST 1 & 2 & 3: Successful RAG response, payload forwarding, and null preservation", async (t) => {
        t.mock.method(axios, "post", async (url, data, config) => {
            // Verify payload forwarding
            assert.strictEqual(url, "http://mock-rag-service:8002/enrich");
            assert.strictEqual(data.mpn, "PDSH4816AF");
            assert.strictEqual(data.manufacturer, "Frigidaire");
            assert.strictEqual(data.description, "Built-in Dishwasher");
            assert.deepStrictEqual(data.missing_attributes, ["HEIGHT", "WIDTH", "LENGTH"]);

            return {
                status: 200,
                data: {
                    status: "FOUND",
                    product: { mpn: "PDSH4816AF", manufacturer: "Frigidaire" },
                    retrieved_evidence: [],
                    structured_attributes: {
                        HEIGHT: null,
                        WIDTH: "24 in",
                        LENGTH: "24-1/4 in"
                    },
                    web_discovery: {
                        mfr_url: "https://www.frigidaire.com/pdsh",
                        ref_urls: []
                    }
                }
            };
        });

        const response = await fetch(backendUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mpn: "PDSH4816AF",
                manufacturer: "Frigidaire",
                description: "Built-in Dishwasher",
                missing_attributes: ["HEIGHT", "WIDTH", "LENGTH"]
            })
        });

        assert.strictEqual(response.status, 200);
        const body = await response.json();

        assert.strictEqual(body.status, "FOUND");
        assert.strictEqual(body.structured_attributes.WIDTH, "24 in");
        assert.strictEqual(body.structured_attributes.LENGTH, "24-1/4 in");
        assert.strictEqual(body.structured_attributes.HEIGHT, null); // Null preservation check
        assert.strictEqual(body.web_discovery.mfr_url, "https://www.frigidaire.com/pdsh");
    });

    t.test("TEST 4: RAG service unavailable (ECONNREFUSED)", async (t) => {
        t.mock.method(axios, "post", async () => {
            const err = new Error("connect ECONNREFUSED");
            err.code = "ECONNREFUSED";
            throw err;
        });

        const response = await fetch(backendUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mpn: "PDSH4816AF",
                manufacturer: "Frigidaire",
                description: "Built-in Dishwasher",
                missing_attributes: ["HEIGHT"]
            })
        });

        assert.strictEqual(response.status, 503);
        const body = await response.json();
        assert.strictEqual(body.error, "RAG_SERVICE_UNAVAILABLE");
        assert.strictEqual(body.message, "RAG service is unavailable");
    });

    t.test("TEST 5: RAG service timeout", async (t) => {
        t.mock.method(axios, "post", async () => {
            const err = new Error("timeout of 30000ms exceeded");
            err.code = "ECONNABORTED";
            throw err;
        });

        const response = await fetch(backendUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mpn: "PDSH4816AF",
                manufacturer: "Frigidaire",
                description: "Built-in Dishwasher",
                missing_attributes: ["HEIGHT"]
            })
        });

        assert.strictEqual(response.status, 504);
        const body = await response.json();
        assert.strictEqual(body.error, "RAG_SERVICE_TIMEOUT");
        assert.strictEqual(body.message, "RAG service request timed out");
    });

    t.test("TEST 6: RAG service returns non-2xx status code (e.g. 500)", async (t) => {
        t.mock.method(axios, "post", async () => {
            const err = new Error("Request failed with status code 500");
            err.response = {
                status: 500,
                data: "Python Stack Trace Here"
            };
            throw err;
        });

        const response = await fetch(backendUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mpn: "PDSH4816AF",
                manufacturer: "Frigidaire",
                description: "Built-in Dishwasher",
                missing_attributes: ["HEIGHT"]
            })
        });

        assert.strictEqual(response.status, 500);
        const body = await response.json();
        assert.strictEqual(body.error, "RAG_SERVICE_ERROR");
        assert.strictEqual(body.message, "RAG service returned an error");
    });

    t.test("TEST 6b: RAG service returns HTTP 404", async (t) => {
        t.mock.method(axios, "post", async () => {
            const err = new Error("Request failed with status code 404");
            err.response = {
                status: 404,
                data: "Not Found"
            };
            throw err;
        });

        const response = await fetch(backendUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mpn: "PDSH4816AF",
                manufacturer: "Frigidaire",
                description: "Built-in Dishwasher",
                missing_attributes: ["HEIGHT"]
            })
        });

        assert.strictEqual(response.status, 404);
        const body = await response.json();
        assert.strictEqual(body.error, "RAG_SERVICE_ERROR");
        assert.strictEqual(body.message, "RAG service returned an error");
    });

    t.test("TEST 7: Missing required fields (HTTP 400)", async (t) => {
        const response = await fetch(backendUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mpn: "", // Missing
                manufacturer: "Frigidaire",
                description: "Built-in Dishwasher",
                missing_attributes: []
            })
        });

        assert.strictEqual(response.status, 400);
        const body = await response.json();
        assert.strictEqual(body.error, "BAD_REQUEST");
    });

    t.test("TEST 8: RAG_SERVICE_URL environment check", async (t) => {
        const originalUrl = process.env.RAG_SERVICE_URL;
        process.env.RAG_SERVICE_URL = "http://dynamic-url-from-env:9999";
        
        t.mock.method(axios, "post", async (url) => {
            assert.strictEqual(url, "http://dynamic-url-from-env:9999/enrich");
            return { status: 200, data: { status: "FOUND" } };
        });

        try {
            await enrichProductWithRAG({
                mpn: "ABC",
                manufacturer: "XYZ",
                description: "DESC",
                missing_attributes: []
            });
        } finally {
            process.env.RAG_SERVICE_URL = originalUrl;
        }
    });

    t.test("TEST 9: Retrieve image asset successfully", async (t) => {
        const assetsUrl = `http://localhost:${port}/api/ai/assets/FRIGIDAIRE_PDSH4816AF.jpg`;
        const response = await fetch(assetsUrl);
        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.headers.get("content-type"), "image/jpeg");
    });

    t.test("TEST 10: Retrieve PDF asset successfully", async (t) => {
        const assetsUrl = `http://localhost:${port}/api/ai/assets/FRIGIDAIRE_PDSH4816AF_Specification_Sheet.pdf`;
        const response = await fetch(assetsUrl);
        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.headers.get("content-type"), "application/pdf");
    });

    t.test("TEST 11: Non-existent asset returns 404", async (t) => {
        const assetsUrl = `http://localhost:${port}/api/ai/assets/non_existent_file.jpg`;
        const response = await fetch(assetsUrl);
        assert.strictEqual(response.status, 404);
        const body = await response.json();
        assert.strictEqual(body.error, "NOT_FOUND");
    });

    t.test("TEST 12: Directory traversal attempt blocked (HTTP 400/403)", async (t) => {
        const assetsUrl = `http://localhost:${port}/api/ai/assets/..%2f..%2fpackage.json`;
        const response = await fetch(assetsUrl);
        assert.strictEqual(response.status, 400); // Because '..' doesn't match our allowed pattern
        const body = await response.json();
        assert.strictEqual(body.error, "BAD_REQUEST");
    });
});
