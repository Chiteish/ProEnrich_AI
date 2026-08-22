const { processProduct } = require("../services/ai.service");

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

module.exports = {
    testAI
};