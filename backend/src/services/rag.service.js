const axios = require("axios");

const getRAGServiceUrl = () =>
    process.env.RAG_SERVICE_URL || "http://localhost:8002";

const RAG_REQUEST_TIMEOUT = Number(process.env.RAG_REQUEST_TIMEOUT_MS) || 180000;

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
            console.error(`RAG Service Timeout: URL=${serviceUrl}/enrich timeout=${RAG_REQUEST_TIMEOUT}ms code=${error.code || "ECONNABORTED"} message="${error.message}"`);
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
            console.error(`RAG Service Unavailable: URL=${serviceUrl}/enrich code=${error.code} message="${error.message}"`);
            customError = new Error("RAG service is unavailable");
            customError.code = "RAG_SERVICE_UNAVAILABLE";
            customError.status = 503;
        } else {
            const httpStatus = error.response ? error.response.status : 500;
            const safeResponseBody = error.response && error.response.data 
                ? JSON.stringify(error.response.data).substring(0, 500) 
                : "No response body";
            console.error(`RAG Service HTTP Error: URL=${serviceUrl}/enrich status=${httpStatus} body="${safeResponseBody}" message="${error.message}"`);
            customError = new Error("RAG service returned an error");
            customError.code = "RAG_SERVICE_ERROR";
            customError.status = httpStatus;
        }

        throw customError;
    }
};

module.exports = {
    enrichProductWithRAG
};
