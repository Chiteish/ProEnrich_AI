const fs = require("fs");
const csv = require("csv-parser");

const REQUIRED_COLUMNS = [
    "Mfg_Part_Num",
    "Part_Desc",
    "E1_Brand",
    "Unilog_Brand",
    "DIB_Brand",
    "Part_Manuf"
];

function validateAndReadCSV(filePath) {
    return new Promise((resolve, reject) => {

        const rows = [];
        let headers = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on("headers", (csvHeaders) => {
                headers = csvHeaders.map(header => header.trim());
            })
            .on("data", (row) => {
                rows.push(row);
            })
            .on("end", () => {

                // 1. Check required columns
                const missingColumns = REQUIRED_COLUMNS.filter(
                    column => !headers.includes(column)
                );

                if (missingColumns.length > 0) {
                    return reject({
                        type: "SCHEMA_ERROR",
                        message: "Required columns are missing",
                        missingColumns
                    });
                }

                // 2. Empty dataset
                if (rows.length === 0) {
                    return reject({
                        type: "EMPTY_DATASET",
                        message: "CSV contains no product records"
                    });
                }

                // 3. Row-level warnings
                const rowWarnings = [];

                rows.forEach((row, index) => {

                    const rowNumber = index + 2;

                    if (!row.Mfg_Part_Num?.trim()) {
                        rowWarnings.push({
                            row: rowNumber,
                            field: "Mfg_Part_Num",
                            message: "Missing manufacturer part number"
                        });
                    }

                    if (!row.Part_Desc?.trim()) {
                        rowWarnings.push({
                            row: rowNumber,
                            field: "Part_Desc",
                            message: "Missing product description"
                        });
                    }
                });

                resolve({
                    headers,
                    rows,
                    rowCount: rows.length,
                    columnCount: headers.length,
                    warningCount: rowWarnings.length,
                    rowWarnings
                });
            })
            .on("error", (error) => {
                reject({
                    type: "CSV_PARSE_ERROR",
                    message: "Failed to read CSV",
                    error: error.message
                });
            });
    });
}

module.exports = {
    validateAndReadCSV,
    REQUIRED_COLUMNS
};