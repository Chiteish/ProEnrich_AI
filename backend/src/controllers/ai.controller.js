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

module.exports = {
    testAI,
    enrichProduct
};