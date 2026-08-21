/**
 * Complete list of all 252 columns required by the company's Expected Delivery Output format.
 */
const EXPECTED_COLUMNS = [
    "MFR URL",
    "Ref URL 1",
    "Ref URL 2",
    "Ref URL 3",
    "Ref URL 4",
    "Ref URL 5",
    "PART_NUMBER",
    "Dept",
    "Class",
    "Fine",
    "SKU - MY_PART_NUMBER",
    "Mfg_Part_Num",
    "Part_Desc",
    "E1_Brand",
    "Unilog_Brand",
    "DIB_Brand",
    "Part_Manuf",
    "MANUFACTURER_NAME",
    "BRAND_NAME",
    "TRADE_NAME",
    "MANUFACTURER_PART_NUMBER",
    "ALTERNATE_PART_NUMBER",
    "Classpath",
    "MOBILE_DESC",
    "INVOICE_DESC",
    "SHORT_DESC",
    "LONG_DESC1",
    "RETAIL_DESC",
    "MARKETING_DESCRIPTION",
    "ITEM_FEATURES_1",
    "ITEM_FEATURES_2",
    "ITEM_FEATURES_3",
    "ITEM_FEATURES_4",
    "ITEM_FEATURES_5",
    "ITEM_FEATURES_6",
    "ITEM_FEATURES_7",
    "ITEM_FEATURES_8",
    "ITEM_FEATURES_9",
    "ITEM_FEATURES_10",
    "ITEM_FEATURES_11",
    "ITEM_FEATURES_12",
    "ITEM_FEATURES_13",
    "ITEM_FEATURES_14",
    "ITEM_FEATURES_15",
    "ITEM_FEATURES_16",
    "ITEM_FEATURES_17",
    "ITEM_FEATURES_18",
    "ITEM_FEATURES_19",
    "ITEM_FEATURES_20",
    "With",
    "Standard/Approvals",
    "Prop 65",
    "Application",
    "Includes",
    "Product Name",
    ...Array.from({ length: 50 }, (_, i) => [
        `ATTRIBUTE_LABEL ${i + 1}`,
        `ATTRIBUTE_VALUE ${i + 1}`,
        `ATTRIBUTE_UOM ${i + 1}`
    ]).flat(),
    "UPC",
    "EAN",
    "GTIN",
    "UNSPSC",
    "Warranty",
    "List Price",
    "Selling Qty",
    "Selling UOM",
    "Standard Packaging Information",
    "LENGTH",
    "LENGTH_UOM",
    "HEIGHT",
    "HEIGHT_UOM",
    "WIDTH",
    "WIDTH_UOM",
    "WEIGHT",
    "WEIGHT_UOM",
    "VOLUME",
    "VOLUME_UOM",
    "Product Image",
    "Alternate Image 1",
    "Alternate Image 2",
    "Alternate Image 3",
    "Alternate Image 4",
    "SDS",
    "SDS_1",
    "Warranty Information",
    "Catalog",
    "Specification Sheet",
    "Instruction/Installation Manual",
    "Service Manual",
    "Owners/User Manual",
    "Line Drawing",
    "MTR",
    "RoHS",
    "Full Engineering Drawing",
    "Energy Star Guide",
    "Technical Bulletin",
    "Submittal",
    "Compatibility Chart",
    "Size Chart",
    "Product Label/Insert",
    "Video Link",
    "Video Link 1",
    "Country Of Origin",
    "Discontinued",
    "Actual Image (Yes/No)"
];

/**
 * Extract numerical value and unit of measure from a string if present.
 */
function parseValueAndUOM(val) {
    if (typeof val !== "string") {
        return { value: val ?? "", uom: "" };
    }

    const trimmed = val.trim();
    // Match pattern like "120 V", "15 A", "47 dBA", "50-1/4 in", "6 pc"
    const match = trimmed.match(/^([\d/.\-\s]+)\s+([a-zA-Z°]+(?:\s*[a-zA-Z]+)?)$/);
    if (match) {
        return {
            value: match[1].trim(),
            uom: match[2].trim()
        };
    }

    return {
        value: trimmed,
        uom: ""
    };
}

/**
 * Format a single product entry into the 252-column flat company delivery structure.
 * 
 * @param {Object} productRecord - The product item containing { input, aiResult, product_id, status, error }
 * @returns {Object} Flat object containing all 252 expected keys
 */
function formatProductToExpectedFlat(productRecord) {
    const input = productRecord.input || {};
    const ai = productRecord.aiResult || {};
    const identity = ai.identity || {};
    const classification = ai.classification || {};
    const understanding = ai.understanding || {};
    const attributes = Array.isArray(ai.attributes) ? ai.attributes : [];

    // Initialize all 252 columns to empty string
    const flatRow = {};
    for (const col of EXPECTED_COLUMNS) {
        flatRow[col] = "";
    }

    // 1. Identifiers
    const mpn = input.Mfg_Part_Num || identity.mpn || productRecord.product_id || "";
    flatRow["Mfg_Part_Num"] = mpn;
    flatRow["MANUFACTURER_PART_NUMBER"] = identity.mpn || mpn;
    flatRow["PART_NUMBER"] = mpn;

    // 2. Source Baseline
    flatRow["Part_Desc"] = input.Part_Desc || "";
    flatRow["E1_Brand"] = input.E1_Brand || "";
    flatRow["Unilog_Brand"] = input.Unilog_Brand || "";
    flatRow["DIB_Brand"] = input.DIB_Brand || "";
    flatRow["Part_Manuf"] = input.Part_Manuf || "";

    // 3. Resolved Entities
    const manufCanonical = identity.manufacturer?.canonical_value;
    const manufRaw = identity.manufacturer?.raw_value || input.Part_Manuf || "";
    flatRow["MANUFACTURER_NAME"] = manufCanonical || (identity.manufacturer?.method === "placeholder" ? "" : manufRaw);

    const brandCanonical = identity.brand?.canonical_value;
    const brandRaw = identity.brand?.raw_value || input.E1_Brand || input.Unilog_Brand || input.DIB_Brand || "";
    flatRow["BRAND_NAME"] = brandCanonical || (identity.brand?.method === "placeholder" ? "" : brandRaw);

    // 4. Classification & Taxonomy
    flatRow["Dept"] = classification.department || "";
    flatRow["Class"] = classification.class_name || "";
    flatRow["Fine"] = classification.fine || "";
    flatRow["Classpath"] = classification.classpath || "";

    // 5. Product Name / Type
    if (understanding.product_type) {
        // Capitalize words for clean presentation
        flatRow["Product Name"] = understanding.product_type
            .split(" ")
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
    }

    // 6. Quantity
    if (understanding.quantity) {
        flatRow["Selling Qty"] = String(understanding.quantity);
    }

    // 7. Dynamic Attributes (up to 50 slots)
    for (let i = 0; i < Math.min(attributes.length, 50); i++) {
        const attr = attributes[i];
        const slot = i + 1;
        flatRow[`ATTRIBUTE_LABEL ${slot}`] = attr.label || "";

        const parsed = parseValueAndUOM(attr.value);
        flatRow[`ATTRIBUTE_VALUE ${slot}`] = attr.uom ? String(attr.value) : parsed.value;
        flatRow[`ATTRIBUTE_UOM ${slot}`] = attr.uom || parsed.uom || "";
    }

    return flatRow;
}

/**
 * Format a complete job output array into an array of 252-column flat records.
 */
function formatJobOutputToExpectedRows(jobOutputArray) {
    if (!Array.isArray(jobOutputArray)) {
        return [];
    }
    return jobOutputArray.map(formatProductToExpectedFlat);
}

/**
 * Convert 252-column flat records to a valid CSV string.
 */
function formatRowsToCSV(flatRows) {
    if (!Array.isArray(flatRows) || flatRows.length === 0) {
        return EXPECTED_COLUMNS.join(",") + "\r\n";
    }

    const escapeCSV = (val) => {
        if (val === null || val === undefined) return "";
        const str = String(val);
        if (str.includes(",") || str.includes("\"") || str.includes("\n") || str.includes("\r")) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const headerLine = EXPECTED_COLUMNS.map(escapeCSV).join(",");
    const dataLines = flatRows.map(row => {
        return EXPECTED_COLUMNS.map(col => escapeCSV(row[col] ?? "")).join(",");
    });

    return [headerLine, ...dataLines].join("\r\n");
}

module.exports = {
    EXPECTED_COLUMNS,
    formatProductToExpectedFlat,
    formatJobOutputToExpectedRows,
    formatRowsToCSV
};
