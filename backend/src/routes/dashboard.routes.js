const express = require('express');
const { getDashboardKPIs, getDashboardPipeline, getDashboardActivity, getDashboardQuality } = require('../controllers/dashboard.controller');

const router = express.Router();

router.get('/kpis', getDashboardKPIs);
router.get('/pipeline', getDashboardPipeline);
router.get('/activity', getDashboardActivity);
router.get('/quality', getDashboardQuality);

module.exports = router;
