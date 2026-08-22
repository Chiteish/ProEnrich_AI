const axios = require("axios");

const getRAGServiceUrl = () =>
    process.env.RAG_SERVICE_URL || "http://localhost:8002";

const RAG_REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Call the Python FastAPI RAG service /enrich endpoint
 */
const enrichProductWithRAG = async (payload) => {
    const serviceUrl = getRAGServiceUrl();
    try {
        const response = await axios.post(
            `${serviceUrl}/enrich`,
            payload,
            {
                timeout: RAG_REQUEST_TIMEOUT,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;
    } catch (error) {
        let customError;

        if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
            customError = new Error("RAG service request timed out");
            customError.code = "RAG_SERVICE_TIMEOUT";
            customError.status = 504;
        } else if (
            error.code === "ECONNREFUSED" ||
            error.code === "ENOTFOUND" ||
            error.code === "EHOSTUNREACH" ||
            error.code === "ENETUNREACH" ||
            !error.response
        ) {
            customError = new Error("RAG service is unavailable");
            customError.code = "RAG_SERVICE_UNAVAILABLE";
            customError.status = 503;
        } else {
            customError = new Error("RAG service returned an error");
            customError.code = "RAG_SERVICE_ERROR";
            customError.status = error.response.status || 500;
        }

        console.error("RAG Service Error:", customError.message, error.message);
        throw customError;
    }
};

module.exports = {
    enrichProductWithRAG
};
