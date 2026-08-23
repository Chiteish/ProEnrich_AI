const { processProduct } = require("../services/ai.service");
const { enrichProductWithRAG } = require("../services/rag.service");

const testAI = async (req, res) => {
    try {

        const product = {
            mfg_part_num: "DCB518ASTS06G",
            part_desc: "Diablo 1/2 x 18 Sanding Belt 6pc",
            e1_brand: "-- Unbranded --",
            unilog_brand: "-- No Unilog Brand --",
            dib_brand: "-- No DIB Brand --",
            part_manuf: "Freud Inc (2435)"
        };

        const result = await processProduct(product);

        return res.json({
            success: true,
            aiResult: result
        });

    } catch (error) {

        console.error("AI integration test failed:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const enrichProduct = async (req, res) => {
    try {
        const { mpn, manufacturer, description, missing_attributes } = req.body;

        // Validation: mpn, manufacturer, description, missing_attributes (must be array)
        if (!mpn || !manufacturer || !description || !missing_attributes) {
            return res.status(400).json({
                error: "BAD_REQUEST",
                message: "mpn, manufacturer, description, and missing_attributes are required"
            });
        }

        if (!Array.isArray(missing_attributes)) {
            return res.status(400).json({
                error: "BAD_REQUEST",
                message: "missing_attributes must be an array of strings"
            });
        }

        const result = await enrichProductWithRAG({
            mpn,
            manufacturer,
            description,
            missing_attributes
        });

        if (result.status === "FOUND" && result.web_discovery) {
            const { processAssets } = require("../services/asset.service");
            const assetManifest = await processAssets(mpn, result.web_discovery);
            result.assets = assetManifest;
        } else {
            result.assets = {
                product_image: { available: false, url: null, external_url: null, error: null },
                alternate_images: [],
                specification_sheet: { available: false, url: null, external_url: null, error: null },
                manual: { available: false, url: null, external_url: null, error: null }
            };
        }

        // Save complete result to database
        try {
            const productModel = require("../models/product.model");
            productModel.saveProductEnrichment(
                { mpn, manufacturer, description, missing_attributes },
                result
            );
        } catch (dbError) {
            console.error("Failed to save product enrichment to database:", dbError);
        }

        return res.json(result);
    } catch (error) {
        console.error("Product enrichment failed:", error);

        if (error.code === "RAG_SERVICE_UNAVAILABLE") {
            return res.status(503).json({
                error: "RAG_SERVICE_UNAVAILABLE",
                message: "RAG service is unavailable"
            });
        }

        if (error.code === "RAG_SERVICE_TIMEOUT") {
            return res.status(504).json({
                error: "RAG_SERVICE_TIMEOUT",
                message: "RAG service request timed out"
            });
        }

        // Handle generic RAG service error or non-2xx status code
        const status = error.status || 500;
        return res.status(status).json({
            error: "RAG_SERVICE_ERROR",
            message: "RAG service returned an error"
        });
    }
};

const getAsset = async (req, res) => {
    try {
        const { productId, filename } = req.params;
        const path = require("path");
        const fs = require("fs");

        // If productId is not provided, this is a legacy Phase 1 route request (/assets/:filename)
        // Note: Express maps the single parameter to productId when route is /assets/:filename
        // So let's check if req.route.path is "/assets/:filename"
        const isLegacyRoute = req.route && req.route.path === "/assets/:filename";
        
        if (isLegacyRoute) {
            const legacyFilename = req.params.filename || req.params.productId;
            if (!legacyFilename || !/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|pdf)$/i.test(legacyFilename)) {
                return res.status(400).json({
                    error: "BAD_REQUEST",
                    message: "Invalid filename format"
                });
            }

            const assetsDir = path.resolve(__dirname, "../../data/assets");
            const filePath = path.join(assetsDir, legacyFilename);

            if (!filePath.startsWith(assetsDir)) {
                return res.status(403).json({
                    error: "FORBIDDEN",
                    message: "Access denied"
                });
            }

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({
                    error: "NOT_FOUND",
                    message: "Asset not found"
                });
            }

            return res.sendFile(filePath);
        }

        // Phase 2: Dynamic product-isolated asset request (/assets/:productId/:filename)
        if (!productId || !/^[a-zA-Z0-9_-]+$/.test(productId)) {
            return res.status(400).json({
                error: "BAD_REQUEST",
                message: "Invalid product identifier"
            });
        }

        if (!filename || !/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|pdf)$/i.test(filename)) {
            return res.status(400).json({
                error: "BAD_REQUEST",
                message: "Invalid filename format"
            });
        }

        const assetsDir = path.resolve(__dirname, "../../data/assets");
        const productDir = path.join(assetsDir, productId);
        const filePath = path.join(productDir, filename);

        // Security: Verify that the resolved productDir starts with assetsDir and filePath starts with productDir
        if (!productDir.startsWith(assetsDir) || !filePath.startsWith(productDir)) {
            return res.status(403).json({
                error: "FORBIDDEN",
                message: "Access denied"
            });
        }

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                error: "NOT_FOUND",
                message: "Asset not found"
            });
        }

        return res.sendFile(filePath);
    } catch (error) {
        console.error("Failed to get asset:", error);
        return res.status(500).json({
            error: "INTERNAL_SERVER_ERROR",
            message: "Failed to load asset"
        });
    }
};

module.exports = {
    testAI,
    enrichProduct,
    getAsset
};