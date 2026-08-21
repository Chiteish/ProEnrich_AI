const express = require("express");
const cors = require("cors");

const catalogRoutes = require("./routes/catalog.routes");
const jobRoutes = require("./routes/job.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        message: "Product Intelligence Backend is running"
    });

});


app.use("/api/catalog", catalogRoutes);

app.use("/api/jobs", jobRoutes);


module.exports = app;