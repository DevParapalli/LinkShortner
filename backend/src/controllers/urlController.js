const Url = require('../models/Url');
const { generateShortCode } = require('../utils/generateShortCode');
const { BASE_URL } = require('../config/env');

// Create a new short URL
exports.createShortUrl = async (req, res) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;
    
    // Validate input
    if (!originalUrl) {
      return res.status(400).json({
        success: false,
        message: 'Original URL is required'
      });
    }
    
    // Check if custom alias is already taken
    if (customAlias) {
      const existingAlias = await Url.findOne({ customAlias });
      if (existingAlias) {
        return res.status(400).json({
          success: false,
          message: 'Custom alias is already taken'
        });
      }
    }
    
    const shortCode = customAlias || generateShortCode(6);
    
    const newUrl = await Url.create({
      originalUrl,
      shortCode,
      customAlias: customAlias ? customAlias : null,
      userId: req.user._id,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });
    
    res.status(201).json({
      success: true,
      data: {
        id: newUrl._id,
        originalUrl: newUrl.originalUrl,
        shortUrl: `${BASE_URL}/${shortCode}`,
        shortCode,
        customAlias: newUrl.customAlias,
        expiresAt: newUrl.expiresAt,
        createdAt: newUrl.createdAt,
        clicks: newUrl.clicks
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all URLs for a user
exports.getUserUrls = async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user._id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: urls.length,
      data: urls.map(url => ({
        id: url._id,
        originalUrl: url.originalUrl,
        shortUrl: `${BASE_URL}/${url.shortCode}`,
        shortCode: url.shortCode,
        customAlias: url.customAlias,
        expiresAt: url.expiresAt,
        createdAt: url.createdAt,
        clicks: url.clicks,
        active: url.active
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Redirect from short URL to original URL
exports.redirectToOriginalUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    // Find the URL
    const url = await Url.findOne({ 
      $or: [
        { shortCode },
        { customAlias: shortCode }
      ]
    });
    
    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found'
      });
    }
    
    // Check if URL is expired
    if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
      return res.status(410).json({
        success: false,
        message: 'URL has expired'
      });
    }
    
    // Increment click count
    url.clicks++;
    await url.save();
    
    // Respond with the original URL for redirection
    res.status(200).json({
      success: true,
      originalUrl: url.originalUrl,
      urlId: url._id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a URL
exports.deleteUrl = async (req, res) => {
  try {
    const url = await Url.findOne({ 
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found'
      });
    }
    
    await url.remove();
    
    res.status(200).json({
      success: true,
      message: 'URL deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update URL status (active/inactive)
exports.updateUrlStatus = async (req, res) => {
  try {
    const { active } = req.body;
    
    if (typeof active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Active status must be a boolean'
      });
    }
    
    const url = await Url.findOne({ 
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found'
      });
    }
    
    url.active = active;
    await url.save();
    
    res.status(200).json({
      success: true,
      data: {
        id: url._id,
        active: url.active
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
