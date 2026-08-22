const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() +
            "-" +
            file.originalname;

        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {

    const allowedExtensions = [
        ".csv",
        ".xlsx",
        ".xls"
    ];

    const extension =
        path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(extension)) {
        cb(null, true);
    } else {
        cb(new Error("Only CSV and Excel files are allowed"));
    }
};

const upload = multer({
    storage,
    fileFilter
});

module.exports = upload; 
