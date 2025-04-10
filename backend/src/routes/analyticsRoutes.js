const express = require('express');
const router = express.Router();
const { 
  logClickEvent,
  getUrlAnalytics,
  getUserAnalytics
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// Routes
router.post('/click', logClickEvent);
router.get('/url/:urlId', protect, getUrlAnalytics);
router.get('/user', protect, getUserAnalytics);

module.exports = router;
