const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { ensureAuthenticated } = require('../middleware/auth');

// Protect all analytics routes
router.use(ensureAuthenticated);

// Main analytics page
router.get('/analytics', analyticsController.renderAnalyticsPage);

// Endpoint to get analytics data
router.get('/analytics/data', analyticsController.getAnalyticsData);

module.exports = router;
