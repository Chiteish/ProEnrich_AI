const test = require("node:test");
const assert = require("node:assert");
const http = require("http");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Ensure environment variable is set
process.env.RAG_SERVICE_URL = "http://mock-rag-service:8002";
process.env.PRODUCTS_FILE = path.resolve(__dirname, "../data/products_test.json");

const app = require("../src/app");
const productModel = require("../src/models/product.model");

test("Phase 5 Product Persistence Suite", async (t) => {
    // Start the server on a dynamic port
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    
    const enrichUrl = `http://localhost:${port}/api/ai/enrich`;
    const productsUrl = `http://localhost:${port}/api/products`;

    // Back up products.json if it exists, or create a clean test version
    const productsFile = process.env.PRODUCTS_FILE;
    let originalProductsData = null;
    if (fs.existsSync(productsFile)) {
        originalProductsData = fs.readFileSync(productsFile, "utf-8");
    }
    
    // Set to empty object for tests
    fs.mkdirSync(path.dirname(productsFile), { recursive: true });
    fs.writeFileSync(productsFile, JSON.stringify({}, null, 2), "utf-8");

    t.after(() => {
        server.close();
        // Restore products.json
        if (originalProductsData !== null) {
            fs.writeFileSync(productsFile, originalProductsData, "utf-8");
        } else {
            try {
                fs.unlinkSync(productsFile);
            } catch (e) {}
        }
    });

    t.test("TEST 1: saving enrichment and retrieving product / enrichment / assets", async (t) => {
        t.mock.method(axios, "post", async () => {
            return {
                status: 200,
                data: {
                    status: "FOUND",
                    product: { mpn: "TESTPERSIST01", manufacturer: "BrandA", description: "DescA" },
                    retrieved_evidence: [{ source: "doc.txt", text: "evidence text" }],
                    structured_attributes: { HEIGHT: "10 in", WIDTH: "20 in" },
                    web_discovery: { mfr_url: "https://branda.com" }
                }
            };
        });

        // 1. Send post to enrich
        const enrichResponse = await fetch(enrichUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mpn: "TESTPERSIST01",
                manufacturer: "BrandA",
                description: "DescA",
                missing_attributes: ["HEIGHT", "WIDTH"]
            })
        });

        assert.strictEqual(enrichResponse.status, 200);
        const enrichBody = await enrichResponse.json();
        console.log("DEBUG: enrichBody is:", JSON.stringify(enrichBody, null, 2));
        assert.strictEqual(enrichBody.status, "FOUND");

        // 2. GET /api/products
        const listResponse = await fetch(productsUrl);
        assert.strictEqual(listResponse.status, 200);
        const listBody = await listResponse.json();
        console.log("DEBUG: listBody is:", JSON.stringify(listBody, null, 2));
        assert.ok(Array.isArray(listBody));
        const found = listBody.find(p => p.mpn === "TESTPERSIST01");
        assert.ok(found);
        assert.strictEqual(found.manufacturer, "BrandA");

        // 3. GET /api/products/:mpn
        const getResponse = await fetch(`${productsUrl}/TESTPERSIST01`);
        assert.strictEqual(getResponse.status, 200);
        const getBody = await getResponse.json();
        assert.strictEqual(getBody.mpn, "TESTPERSIST01");
        assert.strictEqual(getBody.status, "validated");

        // 4. GET /api/products/:mpn/enrichment
        const enrichmentResponse = await fetch(`${productsUrl}/TESTPERSIST01/enrichment`);
        assert.strictEqual(enrichmentResponse.status, 200);
        const enrichmentBody = await enrichmentResponse.json();
        assert.strictEqual(enrichmentBody.status, "validated");
        assert.deepStrictEqual(enrichmentBody.structured_attributes, { HEIGHT: "10 in", WIDTH: "20 in" });
        assert.strictEqual(enrichmentBody.retrieved_evidence[0].source, "doc.txt");

        // 5. GET /api/products/:mpn/assets
        const assetsResponse = await fetch(`${productsUrl}/TESTPERSIST01/assets`);
        assert.strictEqual(assetsResponse.status, 200);
        const assetsBody = await assetsResponse.json();
        assert.ok(assetsBody.product_image);
        assert.strictEqual(assetsBody.product_image.available, false);
    });

    t.test("TEST 2: duplicate/update behavior", async (t) => {
        let callCount = 0;
        t.mock.method(axios, "post", async () => {
            callCount++;
            if (callCount === 1) {
                return {
                    status: 200,
                    data: {
                        status: "FOUND",
                        product: { mpn: "TESTDUP01", manufacturer: "BrandB", description: "DescB" },
                        retrieved_evidence: [],
                        structured_attributes: { HEIGHT: "12 in" },
                        web_discovery: {}
                    }
                };
            } else {
                return {
                    status: 200,
                    data: {
                        status: "FOUND",
                        product: { mpn: "TESTDUP01", manufacturer: "BrandB Updated", description: "DescB Updated" },
                        retrieved_evidence: [],
                        structured_attributes: { HEIGHT: "15 in" },
                        web_discovery: {}
                    }
                };
            }
        });

        // First enrichment
        await fetch(enrichUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mpn: "TESTDUP01",
                manufacturer: "BrandB",
                description: "DescB",
                missing_attributes: ["HEIGHT"]
            })
        });

        // Verify count
        let listBody = await (await fetch(productsUrl)).json();
        const initialCount = listBody.length;

        // Second enrichment
        await fetch(enrichUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mpn: "TESTDUP01",
                manufacturer: "BrandB Updated",
                description: "DescB Updated",
                missing_attributes: ["HEIGHT"]
            })
        });

        // Verify count remains the same
        listBody = await (await fetch(productsUrl)).json();
        assert.strictEqual(listBody.length, initialCount);

        // Verify values are updated
        const updatedProduct = await (await fetch(`${productsUrl}/TESTDUP01`)).json();
        assert.strictEqual(updatedProduct.manufacturer, "BrandB Updated");
        assert.strictEqual(updatedProduct.description, "DescB Updated");
        assert.deepStrictEqual(updatedProduct.structured_attributes, { HEIGHT: "15 in" });
    });

    t.test("TEST 3: database error handling", async (t) => {
        // Mock fs.readFileSync to throw an error
        const originalReadFileSync = fs.readFileSync;
        fs.readFileSync = () => {
            throw new Error("Disk read failure");
        };

        try {
            const listResponse = await fetch(productsUrl);
            assert.strictEqual(listResponse.status, 500);
            const listBody = await listResponse.json();
            assert.strictEqual(listBody.error, "DATABASE_ERROR");
            assert.strictEqual(listBody.message, "Failed to retrieve products from storage");
        } finally {
            // Restore readFileSync
            fs.readFileSync = originalReadFileSync;
        }
    });

    t.test("TEST 4: Not found handling", async (t) => {
        const getResponse = await fetch(`${productsUrl}/NONEXISTENTMPN`);
        assert.strictEqual(getResponse.status, 404);
        const getBody = await getResponse.json();
        assert.strictEqual(getBody.error, "NOT_FOUND");
    });
});
