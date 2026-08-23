const {
    validateAndReadCSV
} = require("../services/catalog.service");

const {
    createJob
} = require("../services/job.service");

const { randomUUID } = require("crypto");


const uploadCatalog = async (req, res) => {

    try {

        // Check file
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No CSV file uploaded"
            });
        }


        // Read and validate CSV
        const csvData = await validateAndReadCSV(
            req.file.path
        );


        // Generate catalog ID
        const catalogId = `CAT-${randomUUID()}`;


        // Catalog information
        const catalog = {

            catalogId,

            filename: req.file.originalname,

            storedFile: req.file.filename,

            filePath: req.file.path,

            rows: csvData.rowCount,

            columns: csvData.columnCount,

            headers: csvData.headers

        };


        // Validation status
        const validationStatus =
            csvData.warningCount > 0
                ? "VALID_WITH_WARNINGS"
                : "VALID";


        // Create Job
        const job = createJob(
            catalogId,
            req.file.path
        );


        // Response
        return res.status(201).json({

            success: true,

            message: "Catalogue validated successfully",

            catalog,

            validation: {

                status: validationStatus,

                warningCount: csvData.warningCount,

                warnings: csvData.rowWarnings

            },

            job

        });

    } catch (error) {

        console.error(
            "Catalogue validation error:",
            error
        );


        return res.status(400).json({

            success: false,

            status: "REJECTED",

            message:
                error.message ||
                "Catalogue validation failed",

            errorType:
                error.type ||
                "UNKNOWN_ERROR",

            missingColumns:
                error.missingColumns ||
                []

        });
    }
};


module.exports = {
    uploadCatalog
};