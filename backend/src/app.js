const express = require("express");
const cors = require("cors");

const catalogRoutes = require("./routes/catalog.routes");
const jobRoutes = require("./routes/job.routes");
const aiRoutes = require("./routes/ai.routes");
const productRoutes = require("./routes/product.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const reviewRoutes = require("./routes/review.routes");
const sourceRoutes = require("./routes/source.routes");

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
app.use("/api/ai", aiRoutes);
app.use("/api/products", productRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/sources", sourceRoutes);

const { getProductAnalytics } = require("./controllers/product.controller");
app.get("/api/analytics", getProductAnalytics);

module.exports = app;