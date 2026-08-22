const axios = require("axios");

const getAIServiceUrl = () =>
    process.env.AI_SERVICE_URL || "http://localhost:8001";

const AI_REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Validate that AI response contains required fields.
 */
function isValidAIResponse(data) {
    return Boolean(
        data &&
        typeof data === "object" &&
        data.product_id &&
        data.processing_status
    );
}

const processProduct = async (product) => {
    const serviceUrl = getAIServiceUrl();
    try {
        const response = await axios.post(
            `${serviceUrl}/ai/process-product`,
            product,
            {
                timeout: AI_REQUEST_TIMEOUT
            }
        );

        if (!isValidAIResponse(response.data)) {
            throw new Error(
                "Invalid AI response: missing required 'product_id' or 'processing_status'"
            );
        }

        return response.data;
    } catch (error) {
        let errorMessage = error.message;

        if (error.code === "ECONNABORTED") {
            errorMessage = `AI service request timed out after ${AI_REQUEST_TIMEOUT / 1000} seconds`;
        } else if (
            error.code === "ECONNREFUSED" ||
            error.code === "ENOTFOUND" ||
            error.code === "EHOSTUNREACH" ||
            error.code === "ENETUNREACH"
        ) {
            errorMessage = `AI service is unavailable or unreachable at ${serviceUrl} (${error.code})`;
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        }

        console.error("AI Service Error:", errorMessage);

        const customError = new Error(errorMessage);
        customError.code = error.code;
        customError.status = error.response?.status || 500;
        throw customError;
    }
};

module.exports = {
    processProduct,
    isValidAIResponse
};