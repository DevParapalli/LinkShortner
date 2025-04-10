const express = require('express');
const router = express.Router();
const { 
  createShortUrl, 
  getUserUrls,
  redirectToOriginalUrl,
  deleteUrl,
  updateUrlStatus
} = require('../controllers/urlController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes
router.post('/', protect, createShortUrl);
router.get('/', protect, getUserUrls);
router.delete('/:id', protect, deleteUrl);
router.patch('/:id/status', protect, updateUrlStatus);

// Public routes
router.get('/:shortCode', redirectToOriginalUrl);

module.exports = router;