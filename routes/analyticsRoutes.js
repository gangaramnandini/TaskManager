const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Route for dashboard page
router.get('/analytics', analyticsController.renderAnalyticsPage);
// Route for analytics data API
router.get('/analytics/data', analyticsController.getAnalyticsData);

module.exports = router;
