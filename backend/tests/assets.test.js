const test = require("node:test");
const assert = require("node:assert");
const http = require("http");
const fs = require("fs");
const path = require("path");
const app = require("../src/app");
const axios = require("axios");

// Set env variable to mock URL
process.env.RAG_SERVICE_URL = "http://mock-rag-service:8002";
process.env.LOCAL_ASSET_DIRS = path.resolve(__dirname, "../data/assets");

test("Phase 2 Dynamic Asset Suite", async (t) => {
  // Start the backend Express server on a dynamic port
  const backendServer = http.createServer(app);
  await new Promise((resolve) => backendServer.listen(0, resolve));
  const backendPort = backendServer.address().port;
  const enrichUrl = `http://localhost:${backendPort}/api/ai/enrich`;
  const getAssetUrl = (productId, filename) => `http://localhost:${backendPort}/api/ai/assets/${productId}/${filename}`;

  // Start a local mock HTTP server to serve test assets
  const assetServer = http.createServer((req, res) => {
    if (req.url === "/product.jpg") {
      res.writeHead(200, { "Content-Type": "image/jpeg" });
      res.end("mock_main_image_data");
    } else if (req.url === "/alt1.jpg") {
      res.writeHead(200, { "Content-Type": "image/jpeg" });
      res.end("mock_alt_1_image_data");
    } else if (req.url === "/alt2.jpg") {
      res.writeHead(200, { "Content-Type": "image/jpeg" });
      res.end("mock_alt_2_image_data");
    } else if (req.url === "/spec.pdf") {
      res.writeHead(200, { "Content-Type": "application/pdf" });
      res.end("mock_pdf_spec_data");
    } else if (req.url === "/manual.pdf") {
      res.writeHead(200, { "Content-Type": "application/pdf" });
      res.end("mock_pdf_manual_data");
    } else if (req.url === "/large.jpg") {
      res.writeHead(200, { "Content-Type": "image/jpeg", "Content-Length": "10000000" });
      res.end("oversized data");
    } else if (req.url === "/stream_large.jpg") {
      res.writeHead(200, { "Content-Type": "image/jpeg" });
      const buffer = Buffer.alloc(1024 * 1024); // 1 MB
      for (let i = 0; i < 6; i++) {
        res.write(buffer);
      }
      res.end();
    } else if (req.url === "/error.jpg") {
      res.writeHead(500);
      res.end("error");
    } else {
      res.writeHead(404);
      res.end("not found");
    }
  });

  await new Promise((resolve) => assetServer.listen(0, resolve));
  const assetPort = assetServer.address().port;
  const mockBaseUrl = `http://127.0.0.1:${assetPort}`;

  // Set up trusted local test files
  const testAssetsDir = path.resolve(__dirname, "../data/assets");
  fs.mkdirSync(testAssetsDir, { recursive: true });
  fs.writeFileSync(path.join(testAssetsDir, "trusted_test_image.jpg"), "fake jpg content");
  fs.writeFileSync(path.join(testAssetsDir, "trusted_test_doc.pdf"), "fake pdf content");

  // Create an untrusted file outside
  const untrustedDir = path.resolve(__dirname, "../scratch_test");
  fs.mkdirSync(untrustedDir, { recursive: true });
  fs.writeFileSync(path.join(untrustedDir, "untrusted_file.jpg"), "untrusted content");

  // Cleanup after all tests finish
  t.after(() => {
    backendServer.close();
    assetServer.close();
    
    // Clean up test files
    try {
      fs.unlinkSync(path.join(testAssetsDir, "trusted_test_image.jpg"));
      fs.unlinkSync(path.join(testAssetsDir, "trusted_test_doc.pdf"));
      fs.unlinkSync(path.join(untrustedDir, "untrusted_file.jpg"));
      fs.rmdirSync(untrustedDir);
    } catch (e) {}

    // Clean up test directories
    const assetsDir = path.resolve(__dirname, "../data/assets");
    ["TEST_PRODUCT_001", "TEST_PRODUCT_002", "TEST_PRODUCT_003", "TEST_PRODUCT_004", "TEST_PRODUCT_005", "TEST_PRODUCT_006", "TEST_PRODUCT_007", "TEST_PRODUCT_008"].forEach((dir) => {
      const p = path.join(assetsDir, dir);
      if (fs.existsSync(p)) {
        fs.rmSync(p, { recursive: true, force: true });
      }
    });
  });

  // TEST 1: Product image remote download succeeds
  t.test("TEST 1: Product image remote download succeeds", async (t) => {
    t.mock.method(axios, "post", async () => {
      return {
        status: 200,
        data: {
          status: "FOUND",
          product: { mpn: "TEST_PRODUCT_001", manufacturer: "Acme" },
          retrieved_evidence: [],
          structured_attributes: { HEIGHT: null },
          web_discovery: {
            mfr_url: "https://acme.org",
            product_image: `${mockBaseUrl}/product.jpg`
          }
        }
      };
    });

    const response = await fetch(enrichUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mpn: "TEST_PRODUCT_001",
        manufacturer: "Acme",
        description: "Test description",
        missing_attributes: ["HEIGHT"]
      })
    });

    assert.strictEqual(response.status, 200);
    const body = await response.json();
    
    assert.strictEqual(body.status, "FOUND");
    assert.ok(body.assets);
    assert.strictEqual(body.assets.product_image.available, true);
    assert.strictEqual(body.assets.product_image.url, "/api/ai/assets/TEST_PRODUCT_001/product.jpg");

    // Verify downloaded file exists on disk
    const savedPath = path.resolve(__dirname, "../data/assets/TEST_PRODUCT_001/product.jpg");
    assert.ok(fs.existsSync(savedPath));
    assert.strictEqual(fs.readFileSync(savedPath, "utf8"), "mock_main_image_data");
  });

  // TEST 2: PDF remote download succeeds
  t.test("TEST 2: PDF remote download succeeds", async (t) => {
    t.mock.method(axios, "post", async () => {
      return {
        status: 200,
        data: {
          status: "FOUND",
          product: { mpn: "TEST_PRODUCT_002", manufacturer: "Acme" },
          retrieved_evidence: [],
          structured_attributes: { HEIGHT: null },
          web_discovery: {
            mfr_url: "https://acme.org",
            specification_sheet: `${mockBaseUrl}/spec.pdf`
          }
        }
      };
    });

    const response = await fetch(enrichUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mpn: "TEST_PRODUCT_002",
        manufacturer: "Acme",
        description: "Test description",
        missing_attributes: ["HEIGHT"]
      })
    });

    assert.strictEqual(response.status, 200);
    const body = await response.json();
    assert.strictEqual(body.assets.specification_sheet.available, true);
    assert.strictEqual(body.assets.specification_sheet.url, "/api/ai/assets/TEST_PRODUCT_002/specification-sheet.pdf");

    const savedPath = path.resolve(__dirname, "../data/assets/TEST_PRODUCT_002/specification-sheet.pdf");
    assert.ok(fs.existsSync(savedPath));
  });

  // TEST 3: Multiple alternate images work
  t.test("TEST 3: Multiple alternate images work", async (t) => {
    t.mock.method(axios, "post", async () => {
      return {
        status: 200,
        data: {
          status: "FOUND",
          product: { mpn: "TEST_PRODUCT_003", manufacturer: "Acme" },
          retrieved_evidence: [],
          structured_attributes: { HEIGHT: null },
          web_discovery: {
            mfr_url: "https://acme.org",
            alternate_images: [
              `${mockBaseUrl}/alt1.jpg`,
              `${mockBaseUrl}/alt2.jpg`
            ]
          }
        }
      };
    });

    const response = await fetch(enrichUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mpn: "TEST_PRODUCT_003",
        manufacturer: "Acme",
        description: "Test description",
        missing_attributes: ["HEIGHT"]
      })
    });

    assert.strictEqual(response.status, 200);
    const body = await response.json();
    assert.strictEqual(body.assets.alternate_images.length, 2);
    assert.strictEqual(body.assets.alternate_images[0].available, true);
    assert.strictEqual(body.assets.alternate_images[0].url, "/api/ai/assets/TEST_PRODUCT_003/alternate-1.jpg");
    assert.strictEqual(body.assets.alternate_images[1].url, "/api/ai/assets/TEST_PRODUCT_003/alternate-2.jpg");
  });

  // TEST 4: Product with zero assets
  t.test("TEST 4: Product with zero assets", async (t) => {
    t.mock.method(axios, "post", async () => {
      return {
        status: 200,
        data: {
          status: "FOUND",
          product: { mpn: "TEST_PRODUCT_004", manufacturer: "Acme" },
          retrieved_evidence: [],
          structured_attributes: { HEIGHT: null },
          web_discovery: {
            mfr_url: "https://acme.org",
            product_image: null,
            alternate_images: [],
            specification_sheet: null,
            manual: null
          }
        }
      };
    });

    const response = await fetch(enrichUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mpn: "TEST_PRODUCT_004",
        manufacturer: "Acme",
        description: "Test description",
        missing_attributes: ["HEIGHT"]
      })
    });

    assert.strictEqual(response.status, 200);
    const body = await response.json();
    assert.strictEqual(body.assets.product_image.available, false);
    assert.strictEqual(body.assets.alternate_images.length, 0);
  });

  // TEST 7 & 8: HTTPS external fallback on failed download
  t.test("TEST 7 & 8: HTTPS external fallback on failed download", async (t) => {
    t.mock.method(axios, "post", async () => {
      return {
        status: 200,
        data: {
          status: "FOUND",
          product: { mpn: "TEST_PRODUCT_005", manufacturer: "Acme" },
          retrieved_evidence: [],
          structured_attributes: { HEIGHT: null },
          web_discovery: {
            mfr_url: "https://acme.org",
            product_image: `${mockBaseUrl}/error.jpg`
          }
        }
      };
    });

    const response = await fetch(enrichUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mpn: "TEST_PRODUCT_005",
        manufacturer: "Acme",
        description: "Test description",
        missing_attributes: ["HEIGHT"]
      })
    });

    assert.strictEqual(response.status, 200);
    const body = await response.json();
    assert.strictEqual(body.assets.product_image.available, false);
    assert.strictEqual(body.assets.product_image.external_url, `${mockBaseUrl}/error.jpg`);
    assert.strictEqual(body.assets.product_image.error, "DOWNLOAD_FAILED");
  });

  // TEST 10: Invalid protocol rejection
  t.test("TEST 10: Invalid protocol rejection", async (t) => {
    t.mock.method(axios, "post", async () => {
      return {
        status: 200,
        data: {
          status: "FOUND",
          product: { mpn: "TEST_PRODUCT_006", manufacturer: "Acme" },
          retrieved_evidence: [],
          structured_attributes: { HEIGHT: null },
          web_discovery: {
            mfr_url: "https://acme.org",
            product_image: "file:///etc/passwd"
          }
        }
      };
    });

    const response = await fetch(enrichUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mpn: "TEST_PRODUCT_006",
        manufacturer: "Acme",
        description: "Test description",
        missing_attributes: ["HEIGHT"]
      })
    });

    assert.strictEqual(response.status, 200);
    const body = await response.json();
    assert.strictEqual(body.assets.product_image.available, false);
    assert.strictEqual(body.assets.product_image.external_url, "file:///etc/passwd");
    assert.strictEqual(body.assets.product_image.error, "INVALID_PROTOCOL");
  });

  // TEST 11: Path traversal protection
  t.test("TEST 11: Path traversal protection", async (t) => {
    // Use raw http.get to bypass client-side fetch URL normalization
    await new Promise((resolve, reject) => {
      http.get({
        host: "localhost",
        port: backendPort,
        path: "/api/ai/assets/TEST_PRODUCT_001/%2e%2e%2f%2e%2e%2fpackage.json"
      }, (res) => {
        assert.strictEqual(res.statusCode, 400);
        resolve();
      }).on("error", reject);
    });

    await new Promise((resolve, reject) => {
      http.get({
        host: "localhost",
        port: backendPort,
        path: "/api/ai/assets/%2e%2e/product.jpg"
      }, (res) => {
        assert.strictEqual(res.statusCode, 400);
        resolve();
      }).on("error", reject);
    });
  });

  // TEST 13: Content-Type MIME type check and extension check
  t.test("TEST 13: Content-Type MIME type check", async (t) => {
    const res = await fetch(getAssetUrl("TEST_PRODUCT_001", "product.jpg"));
    assert.strictEqual(res.status, 200);
    assert.ok(res.headers.get("content-type").includes("image/jpeg"));
  });

  // TEST 14: File size > 5 MB rejection
  t.test("TEST 14: File size > 5 MB rejection", async (t) => {
    t.mock.method(axios, "post", async () => {
      return {
        status: 200,
        data: {
          status: "FOUND",
          product: { mpn: "TEST_PRODUCT_007", manufacturer: "Acme" },
          retrieved_evidence: [],
          structured_attributes: { HEIGHT: null },
          web_discovery: {
            mfr_url: "https://acme.org",
            product_image: `${mockBaseUrl}/large.jpg`
          }
        }
      };
    });

    const response = await fetch(enrichUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mpn: "TEST_PRODUCT_007",
        manufacturer: "Acme",
        description: "Test description",
        missing_attributes: ["HEIGHT"]
      })
    });

    assert.strictEqual(response.status, 200);
    const body = await response.json();
    assert.strictEqual(body.assets.product_image.available, false);
    assert.strictEqual(body.assets.product_image.error, "FILE_TOO_LARGE");
  });

  // TEST 14 stream version: File size > 5 MB stream download limit
  t.test("TEST 14 stream version: File size > 5 MB stream download limit", async (t) => {
    t.mock.method(axios, "post", async () => {
      return {
        status: 200,
        data: {
          status: "FOUND",
          product: { mpn: "TEST_PRODUCT_008", manufacturer: "Acme" },
          retrieved_evidence: [],
          structured_attributes: { HEIGHT: null },
          web_discovery: {
            mfr_url: "https://acme.org",
            product_image: `${mockBaseUrl}/stream_large.jpg`
          }
        }
      };
    });

    const response = await fetch(enrichUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mpn: "TEST_PRODUCT_008",
        manufacturer: "Acme",
        description: "Test description",
        missing_attributes: ["HEIGHT"]
      })
    });

    assert.strictEqual(response.status, 200);
    const body = await response.json();
    assert.strictEqual(body.assets.product_image.available, false);
    assert.strictEqual(body.assets.product_image.error, "FILE_TOO_LARGE");
  });

  // TEST 15: Null values are preserved
  t.test("TEST 15: Null values are preserved", async (t) => {
    t.mock.method(axios, "post", async () => {
      return {
        status: 200,
        data: {
          status: "FOUND",
          product: { mpn: "TEST_PRODUCT_001", manufacturer: "Acme" },
          retrieved_evidence: [],
          structured_attributes: {
            HEIGHT: null,
            WIDTH: "24 in"
          },
          web_discovery: {}
        }
      };
    });

    const response = await fetch(enrichUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mpn: "TEST_PRODUCT_001",
        manufacturer: "Acme",
        description: "Test description",
        missing_attributes: ["HEIGHT", "WIDTH"]
      })
    });

    assert.strictEqual(response.status, 200);
    const body = await response.json();
    assert.strictEqual(body.structured_attributes.HEIGHT, null);
    assert.strictEqual(body.structured_attributes.WIDTH, "24 in");
  });

  // TEST 17: Original RAG response remains intact
  t.test("TEST 17: Original RAG response remains intact", async (t) => {
    t.mock.method(axios, "post", async () => {
      return {
        status: 200,
        data: {
          status: "FOUND",
          product: { mpn: "TEST_PRODUCT_001", manufacturer: "Acme", description: "Hello", missing_attributes: [] },
          retrieved_evidence: [{ source: "doc.txt" }],
          structured_attributes: { HEIGHT: "12 in" },
          web_discovery: { mfr_url: "https://acme.org" }
        }
      };
    });

    const response = await fetch(enrichUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mpn: "TEST_PRODUCT_001",
        manufacturer: "Acme",
        description: "Test description",
        missing_attributes: ["HEIGHT"]
      })
    });

    assert.strictEqual(response.status, 200);
    const body = await response.json();
    assert.strictEqual(body.status, "FOUND");
    assert.deepStrictEqual(body.product, { mpn: "TEST_PRODUCT_001", manufacturer: "Acme", description: "Hello", missing_attributes: [] });
    assert.strictEqual(body.retrieved_evidence[0].source, "doc.txt");
    assert.strictEqual(body.structured_attributes.HEIGHT, "12 in");
    assert.strictEqual(body.web_discovery.mfr_url, "https://acme.org");
    assert.ok(body.assets);
  });

  // TEST C: Existing local JPG is copied successfully
  t.test("TEST C: Existing local JPG is copied successfully", async (t) => {
    t.mock.method(axios, "post", async () => {
      return {
        status: 200,
        data: {
          status: "FOUND",
          product: { mpn: "TEST_PRODUCT_002", manufacturer: "Acme" },
          retrieved_evidence: [],
          structured_attributes: {},
          web_discovery: {
            product_image: "trusted_test_image.jpg"
          }
        }
      };
    });

    const response = await fetch(enrichUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mpn: "TEST_PRODUCT_002",
        manufacturer: "Acme",
        description: "Test description",
        missing_attributes: []
      })
    });

    assert.strictEqual(response.status, 200);
    const body = await response.json();
    assert.strictEqual(body.assets.product_image.available, true);
    assert.strictEqual(body.assets.product_image.source, "local");
    assert.strictEqual(body.assets.product_image.filename, "trusted_test_image.jpg");
    assert.ok(body.assets.product_image.url.includes("TEST_PRODUCT_002/product.jpg"));
  });

  // TEST D: Existing local PDF is copied successfully
  t.test("TEST D: Existing local PDF is copied successfully", async (t) => {
    t.mock.method(axios, "post", async () => {
      return {
        status: 200,
        data: {
          status: "FOUND",
          product: { mpn: "TEST_PRODUCT_003", manufacturer: "Acme" },
          retrieved_evidence: [],
          structured_attributes: {},
          web_discovery: {
            specification_sheet: "trusted_test_doc.pdf"
          }
        }
      };
    });

    const response = await fetch(enrichUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mpn: "TEST_PRODUCT_003",
        manufacturer: "Acme",
        description: "Test description",
        missing_attributes: []
      })
    });

    assert.strictEqual(response.status, 200);
    const body = await response.json();
    assert.strictEqual(body.assets.specification_sheet.available, true);
    assert.strictEqual(body.assets.specification_sheet.source, "local");
    assert.strictEqual(body.assets.specification_sheet.filename, "trusted_test_doc.pdf");
    assert.ok(body.assets.specification_sheet.url.includes("TEST_PRODUCT_003/specification-sheet.pdf"));
  });

  // TEST E: Missing local asset returns an appropriate error
  t.test("TEST E: Missing local asset returns an appropriate error", async (t) => {
    t.mock.method(axios, "post", async () => {
      return {
        status: 200,
        data: {
          status: "FOUND",
          product: { mpn: "TEST_PRODUCT_004", manufacturer: "Acme" },
          retrieved_evidence: [],
          structured_attributes: {},
          web_discovery: {
            product_image: "missing_local_file.jpg"
          }
        }
      };
    });

    const response = await fetch(enrichUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mpn: "TEST_PRODUCT_004",
        manufacturer: "Acme",
        description: "Test description",
        missing_attributes: []
      })
    });

    assert.strictEqual(response.status, 200);
    const body = await response.json();
    assert.strictEqual(body.assets.product_image.available, false);
    assert.strictEqual(body.assets.product_image.error, "INVALID_PROTOCOL");
  });

  // TEST F: ../ traversal is rejected
  t.test("TEST F: ../ traversal is rejected", async (t) => {
    t.mock.method(axios, "post", async () => {
      return {
        status: 200,
        data: {
          status: "FOUND",
          product: { mpn: "TEST_PRODUCT_005", manufacturer: "Acme" },
          retrieved_evidence: [],
          structured_attributes: {},
          web_discovery: {
            product_image: "../scratch_test/untrusted_file.jpg"
          }
        }
      };
    });

    const response = await fetch(enrichUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mpn: "TEST_PRODUCT_005",
        manufacturer: "Acme",
        description: "Test description",
        missing_attributes: []
      })
    });

    assert.strictEqual(response.status, 200);
    const body = await response.json();
    assert.strictEqual(body.assets.product_image.available, false);
    assert.strictEqual(body.assets.product_image.error, "INVALID_PROTOCOL");
  });

  // TEST G: absolute Windows path is rejected
  t.test("TEST G: absolute Windows path is rejected", async (t) => {
    t.mock.method(axios, "post", async () => {
      return {
        status: 200,
        data: {
          status: "FOUND",
          product: { mpn: "TEST_PRODUCT_006", manufacturer: "Acme" },
          retrieved_evidence: [],
          structured_attributes: {},
          web_discovery: {
            product_image: "C:\\trusted_test_image.jpg"
          }
        }
      };
    });

    const response = await fetch(enrichUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mpn: "TEST_PRODUCT_006",
        manufacturer: "Acme",
        description: "Test description",
        missing_attributes: []
      })
    });

    assert.strictEqual(response.status, 200);
    const body = await response.json();
    assert.strictEqual(body.assets.product_image.available, false);
    assert.strictEqual(body.assets.product_image.error, "INVALID_PROTOCOL");
  });

  // TEST H: UNC path is rejected
  t.test("TEST H: UNC path is rejected", async (t) => {
    t.mock.method(axios, "post", async () => {
      return {
        status: 200,
        data: {
          status: "FOUND",
          product: { mpn: "TEST_PRODUCT_007", manufacturer: "Acme" },
          retrieved_evidence: [],
          structured_attributes: {},
          web_discovery: {
            product_image: "\\\\localhost\\trusted_test_image.jpg"
          }
        }
      };
    });

    const response = await fetch(enrichUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mpn: "TEST_PRODUCT_007",
        manufacturer: "Acme",
        description: "Test description",
        missing_attributes: []
      })
    });

    assert.strictEqual(response.status, 200);
    const body = await response.json();
    assert.strictEqual(body.assets.product_image.available, false);
    assert.strictEqual(body.assets.product_image.error, "INVALID_PROTOCOL");
  });

  // TEST I: local file outside trusted directories cannot be accessed
  t.test("TEST I: local file outside trusted directories cannot be accessed", async (t) => {
    t.mock.method(axios, "post", async () => {
      return {
        status: 200,
        data: {
          status: "FOUND",
          product: { mpn: "TEST_PRODUCT_008", manufacturer: "Acme" },
          retrieved_evidence: [],
          structured_attributes: {},
          web_discovery: {
            product_image: "untrusted_file.jpg"
          }
        }
      };
    });

    const response = await fetch(enrichUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mpn: "TEST_PRODUCT_008",
        manufacturer: "Acme",
        description: "Test description",
        missing_attributes: []
      })
    });

    assert.strictEqual(response.status, 200);
    const body = await response.json();
    assert.strictEqual(body.assets.product_image.available, false);
    assert.strictEqual(body.assets.product_image.error, "INVALID_PROTOCOL");
  });
});
