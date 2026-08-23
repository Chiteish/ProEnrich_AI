const fs = require("fs");
const path = require("path");

const DATA_DIR = path.resolve(__dirname, "../../data");
const PRODUCTS_FILE = process.env.PRODUCTS_FILE || path.join(DATA_DIR, "products.json");

/**
 * Ensure data directory and products.json file exist.
 */
function ensureProductsFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    let needsSeed = false;
    if (!fs.existsSync(PRODUCTS_FILE)) {
      needsSeed = true;
    } else {
      const content = fs.readFileSync(PRODUCTS_FILE, "utf-8").trim();
      if (content === "" || content === "{}") {
        needsSeed = true;
      }
    }
    
    if (needsSeed) {
      const seedData = {
        "DCB518ASTS06G": {
          id: "prod-001",
          mpn: "DCB518ASTS06G",
          mfrPartNum: "DCB518ASTS06G",
          description: "Diablo 1/2\"x18\" Sanding Belt 6pc",
          manufacturer: "Freud Inc",
          brand: "Diablo",
          status: "commerce-ready",
          completeness: 94,
          confidence: 95,
          inputFields: 6,
          outputFields: 252,
          missing_attributes: [],
          retrieved_evidence: [],
          structured_attributes: {},
          web_discovery: {},
          assets: { product_image: null, alternate_images: [], specification_sheet: null, manual: null }
        },
        "PDSH4816AF": {
          id: "prod-011",
          mpn: "PDSH4816AF",
          mfrPartNum: "PDSH4816AF",
          description: "Built-in Dishwasher",
          manufacturer: "Frigidaire",
          brand: "Frigidaire",
          status: "review",
          completeness: 50,
          confidence: 60,
          inputFields: 6,
          outputFields: 252,
          missing_attributes: ["HEIGHT", "WIDTH", "LENGTH", "WEIGHT", "VOLUME", "UPC", "UNSPSC"],
          retrieved_evidence: [],
          structured_attributes: {},
          web_discovery: {},
          assets: { product_image: null, alternate_images: [], specification_sheet: null, manual: null }
        }
      };
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(seedData, null, 2), "utf-8");
    }
  } catch (error) {
    console.error("Failed to ensure products storage file:", error);
  }
}

/**
 * Read all products from persistent JSON store.
 */
function readProducts() {
  try {
    ensureProductsFile();
    const rawData = fs.readFileSync(PRODUCTS_FILE, "utf-8");
    if (!rawData.trim()) {
      return {};
    }
    return JSON.parse(rawData);
  } catch (err) {
    if (err instanceof SyntaxError || err.name === "SyntaxError") {
      console.error("Error parsing products.json, returning empty database:", err);
      return {};
    }
    throw err;
  }
}

/**
 * Write products object to persistent JSON store.
 */
function writeProducts(products) {
  ensureProductsFile();
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
}

/**
 * Save or update product enrichment results.
 */
function saveProductEnrichment(productData, enrichmentResult) {
  if (!productData || !productData.mpn) {
    throw new Error("Invalid product data: missing MPN");
  }

  const mpnKey = productData.mpn.toUpperCase();
  const products = readProducts();

  const now = new Date().toISOString();
  
  // Format the product document
  const record = {
    mpn: productData.mpn,
    mfrPartNum: productData.mpn, // frontend compatibility
    manufacturer: productData.manufacturer || "",
    description: productData.description || "",
    brand: productData.brand || productData.manufacturer || "",
    status: enrichmentResult.status === "FOUND" ? "validated" : "review",
    completeness: enrichmentResult.status === "FOUND" ? 75 : 0,
    confidence: enrichmentResult.status === "FOUND" ? 95 : 0,
    inputFields: 6,
    outputFields: 252,
    enrichedAt: now,
    missing_attributes: productData.missing_attributes || [],
    retrieved_evidence: enrichmentResult.retrieved_evidence || [],
    structured_attributes: enrichmentResult.structured_attributes || {},
    web_discovery: enrichmentResult.web_discovery || {},
    assets: enrichmentResult.assets || {
      product_image: null,
      alternate_images: [],
      specification_sheet: null,
      manual: null
    }
  };

  products[mpnKey] = record;
  writeProducts(products);
  return record;
}

/**
 * Get product by MPN (case-insensitive)
 */
function getProduct(mpn) {
  if (!mpn) return null;
  const products = readProducts();
  
  const mpnKey = mpn.toUpperCase();
  if (products[mpnKey]) {
    return products[mpnKey];
  }
  
  for (const prod of Object.values(products)) {
    if (prod.id && prod.id.toLowerCase() === mpn.toLowerCase()) {
      return prod;
    }
  }
  
  if (mpn.toLowerCase().startsWith("prod-")) {
    const stripped = mpn.substring(5).toUpperCase();
    if (products[stripped]) {
      return products[stripped];
    }
  }

  return null;
}

/**
 * Get all products as an array
 */
function getAllProducts() {
  const products = readProducts();
  return Object.values(products);
}

/**
 * Save product from catalog upload/processing.
 * If product already exists, preserve its existing enrichment but update catalog metadata.
 */
function saveProductFromCatalog(productData) {
  if (!productData || !productData.mpn) return null;
  const mpnKey = productData.mpn.toUpperCase();
  const products = readProducts();

  if (products[mpnKey]) {
    // Already exists. Update basic fields if not set.
    products[mpnKey].manufacturer = products[mpnKey].manufacturer || productData.manufacturer || "";
    products[mpnKey].description = products[mpnKey].description || productData.description || "";
    products[mpnKey].brand = products[mpnKey].brand || productData.brand || "";
    products[mpnKey].e1_brand = products[mpnKey].e1_brand || productData.e1_brand || "";
    products[mpnKey].unilog_brand = products[mpnKey].unilog_brand || productData.unilog_brand || "";
    products[mpnKey].dib_brand = products[mpnKey].dib_brand || productData.dib_brand || "";
    products[mpnKey].part_manuf = products[mpnKey].part_manuf || productData.part_manuf || "";
    products[mpnKey].part_desc = products[mpnKey].part_desc || productData.part_desc || "";
  } else {
    // Create new draft record
    products[mpnKey] = {
      id: `prod-${productData.mpn.toLowerCase()}`,
      mpn: productData.mpn,
      mfrPartNum: productData.mpn, // frontend compatibility
      manufacturer: productData.manufacturer || "",
      description: productData.description || "",
      brand: productData.brand || productData.manufacturer || "",
      status: "draft",
      completeness: 0,
      confidence: 0,
      inputFields: 6,
      outputFields: 252,
      enrichedAt: null,
      missing_attributes: [],
      retrieved_evidence: [],
      structured_attributes: {},
      web_discovery: {},
      assets: {
        product_image: null,
        alternate_images: [],
        specification_sheet: null,
        manual: null
      },
      e1_brand: productData.e1_brand || "",
      unilog_brand: productData.unilog_brand || "",
      dib_brand: productData.dib_brand || "",
      part_manuf: productData.part_manuf || "",
      part_desc: productData.part_desc || ""
    };
  }

  writeProducts(products);
  return products[mpnKey];
}

/**
 * Save product enrichment results from AI service during catalog processing.
 */
function saveProductFromAI(productData, aiResult) {
  if (!productData || !productData.mpn) return null;
  const mpnKey = productData.mpn.toUpperCase();
  const products = readProducts();

  const structured_attributes = {};
  if (aiResult && Array.isArray(aiResult.attributes)) {
    aiResult.attributes.forEach(attr => {
      if (attr.label) {
        structured_attributes[attr.label.toUpperCase()] = attr.value;
      }
    });
  }

  const existing = products[mpnKey] || {};
  
  const record = {
    ...existing,
    mpn: productData.mpn,
    mfrPartNum: productData.mpn,
    manufacturer: aiResult?.identity?.manufacturer?.canonical_value || productData.manufacturer || existing.manufacturer || "",
    description: productData.description || existing.description || "",
    brand: aiResult?.identity?.brand?.canonical_value || productData.brand || existing.brand || "",
    status: aiResult?.processing_status === "completed" ? "validated" : "review",
    completeness: aiResult?.processing_status === "completed" ? 75 : (existing.completeness || 0),
    confidence: aiResult?.identity?.manufacturer?.confidence !== undefined ? Math.round(aiResult.identity.manufacturer.confidence * 100) : (existing.confidence || 95),
    inputFields: 6,
    outputFields: 252,
    enrichedAt: new Date().toISOString(),
    missing_attributes: aiResult?.missing_attributes || existing.missing_attributes || [],
    retrieved_evidence: aiResult?.evidence || existing.retrieved_evidence || [],
    structured_attributes: {
      ...(existing.structured_attributes || {}),
      ...structured_attributes
    },
    web_discovery: aiResult?.web_discovery || existing.web_discovery || {},
    assets: aiResult?.assets || existing.assets || {
      product_image: null,
      alternate_images: [],
      specification_sheet: null,
      manual: null
    },
    department: aiResult?.classification?.department || existing.department || "",
    class: aiResult?.classification?.class_name || existing.class || "",
    fine: aiResult?.classification?.fine || existing.fine || "",
    e1_brand: productData.e1_brand || existing.e1_brand || "",
    unilog_brand: productData.unilog_brand || existing.unilog_brand || "",
    dib_brand: productData.dib_brand || existing.dib_brand || "",
    part_manuf: productData.part_manuf || existing.part_manuf || "",
    part_desc: productData.part_desc || existing.part_desc || "",
    aiResult: aiResult || existing.aiResult || null
  };

  products[mpnKey] = record;
  writeProducts(products);
  return record;
}

/**
 * Automatically recover/import processed catalog products from completed job outputs.
 */
function backfillCompletedJobs() {
  const jobsFile = path.resolve(__dirname, "../../data/jobs.json");
  if (!fs.existsSync(jobsFile)) return;
  
  try {
    const rawJobs = fs.readFileSync(jobsFile, "utf-8");
    if (!rawJobs.trim()) return;
    const jobs = JSON.parse(rawJobs);
    
    let updatedAny = false;
    let productsUpdated = false;
    const products = readProducts();

    for (const [jobId, job] of Object.entries(jobs)) {
      if (job.status === "COMPLETED" && !job.backfilled) {
        const outputPath = job.outputPath || path.resolve(__dirname, "../../outputs", `${jobId}.json`);
        if (fs.existsSync(outputPath)) {
          console.log(`[Backfill] Importing completed job ${jobId} results into products database...`);
          try {
            const rawOutput = fs.readFileSync(outputPath, "utf-8");
            const results = JSON.parse(rawOutput);
            
            let count = 0;
            for (const item of results) {
              if (!item || !item.input) continue;
              const mpn = item.input.Mfg_Part_Num || item.product_id || "";
              if (!mpn) continue;
              const mpnKey = mpn.toUpperCase();
              
              const structured_attributes = {};
              if (item.aiResult && Array.isArray(item.aiResult.attributes)) {
                item.aiResult.attributes.forEach(attr => {
                  if (attr.label) {
                    structured_attributes[attr.label.toUpperCase()] = attr.value;
                  }
                });
              }
              
              const existing = products[mpnKey] || {};
              const record = {
                ...existing,
                mpn: mpn,
                mfrPartNum: mpn,
                manufacturer: item.aiResult?.identity?.manufacturer?.canonical_value || item.input.Part_Manuf || existing.manufacturer || "",
                description: item.input.Part_Desc || existing.description || "",
                brand: item.aiResult?.identity?.brand?.canonical_value || item.input.E1_Brand || item.input.Unilog_Brand || item.input.DIB_Brand || existing.brand || "",
                status: item.aiResult?.processing_status === "completed" ? "validated" : "review",
                completeness: item.aiResult?.processing_status === "completed" ? 75 : (existing.completeness || 0),
                confidence: item.aiResult?.identity?.manufacturer?.confidence !== undefined ? Math.round(item.aiResult.identity.manufacturer.confidence * 100) : (existing.confidence || 95),
                inputFields: 6,
                outputFields: 252,
                enrichedAt: new Date().toISOString(),
                missing_attributes: item.aiResult?.missing_attributes || existing.missing_attributes || [],
                retrieved_evidence: item.aiResult?.evidence || existing.retrieved_evidence || [],
                structured_attributes: {
                  ...(existing.structured_attributes || {}),
                  ...structured_attributes
                },
                web_discovery: item.aiResult?.web_discovery || existing.web_discovery || {},
                assets: item.aiResult?.assets || existing.assets || {
                  product_image: null,
                  alternate_images: [],
                  specification_sheet: null,
                  manual: null
                },
                department: item.aiResult?.classification?.department || existing.department || "",
                class: item.aiResult?.classification?.class_name || existing.class || "",
                fine: item.aiResult?.classification?.fine || existing.fine || "",
                e1_brand: item.input.E1_Brand || existing.e1_brand || "",
                unilog_brand: item.input.Unilog_Brand || existing.unilog_brand || "",
                dib_brand: item.input.DIB_Brand || existing.dib_brand || "",
                part_manuf: item.input.Part_Manuf || existing.part_manuf || "",
                part_desc: item.input.Part_Desc || existing.part_desc || "",
                aiResult: item.aiResult || existing.aiResult || null
              };
              products[mpnKey] = record;
              productsUpdated = true;
              count++;
            }
            
            job.backfilled = true;
            updatedAny = true;
            console.log(`[Backfill] Successfully imported ${count} products from job ${jobId}.`);
          } catch (err) {
            console.error(`[Backfill] Failed to parse/import output for job ${jobId}:`, err);
            job.backfilled = true;
            updatedAny = true;
          }
        }
      }
    }
    
    if (productsUpdated) {
      writeProducts(products);
    }

    if (updatedAny) {
      try {
        const freshRaw = fs.readFileSync(jobsFile, "utf-8");
        const freshJobs = freshRaw.trim() ? JSON.parse(freshRaw) : {};
        for (const [jobId, job] of Object.entries(jobs)) {
          if (job.backfilled && freshJobs[jobId]) {
            freshJobs[jobId].backfilled = true;
          }
        }
        fs.writeFileSync(jobsFile, JSON.stringify(freshJobs, null, 2), "utf-8");
      } catch (mergeErr) {
        console.error("[Backfill] Failed to merge backfill state safely:", mergeErr);
        fs.writeFileSync(jobsFile, JSON.stringify(jobs, null, 2), "utf-8");
      }
    }
  } catch (err) {
    console.error("[Backfill] Failed to run backfill check:", err);
  }
}

// Run backfill scan on startup to ingest any pre-processed job files
backfillCompletedJobs();

module.exports = {
  saveProductEnrichment,
  saveProductFromCatalog,
  saveProductFromAI,
  getProduct,
  getAllProducts
};
