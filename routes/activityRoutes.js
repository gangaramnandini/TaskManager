const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

// GET /activity
router.get('/', activityController.getActivityLog);

module.exports = router;
