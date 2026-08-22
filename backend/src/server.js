require("dotenv").config();

const app = require("./app");
const { resumeInterruptedJobs } = require("./services/processing.service");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // Auto-resume any interrupted jobs on server bootup
    resumeInterruptedJobs();
});