const ClickEvent = require('../models/ClickEvent');
const Url = require('../models/Url');
const { parseUserAgent } = require('../utils/deviceDetection');
const mongoose = require('mongoose');

// Log click event
exports.logClickEvent = async (req, res) => {
  try {
    const { urlId } = req.body;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    const referrer = req.headers.referer || 'direct';
    
    // Check if URL exists
    const url = await Url.findById(urlId);
    if (!url) {
      // return res.status(404).json({
      //   success: false,
      //   message: 'URL not found'
      // });
      console.error('URL not found:', urlId);
    }

    // Parse user agent
    const deviceInfo = parseUserAgent(userAgent);
    
    // Create click event
    await ClickEvent.create({
      urlId,
      ipAddress,
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      operatingSystem: deviceInfo.operatingSystem,
      referrer
    });
    
    res.status(201).json({
      success: true,
      message: 'Click event logged successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
    console.error('Error logging click event:', error);
  }
};

exports.logClickEventInternal = async (urlId, userAgent, ipAddress, referrer) => {
  
  const url = await Url.findById(urlId);
    if (!url) {
      // return res.status(404).json({
      //   success: false,
      //   message: 'URL not found'
      // });
      console.error('URL not found:', urlId);
    }

    // Parse user agent
    const deviceInfo = parseUserAgent(userAgent);
    
    // Create click event
    await ClickEvent.create({
      urlId,
      ipAddress,
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      operatingSystem: deviceInfo.operatingSystem,
      referrer
    });

    console.log('Click event logged successfully:', urlId);
}

// Get analytics for a specific URL
exports.getUrlAnalytics = async (req, res) => {
  try {
    const { urlId } = req.params;
    
    // Check if URL belongs to user
    const url = await Url.findOne({ 
      _id: urlId,
      userId: req.user._id
    });
    
    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found'
      });
    }
    
    // Get basic URL info
    const urlData = {
      id: url._id,
      originalUrl: url.originalUrl,
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      shortCode: url.shortCode,
      customAlias: url.customAlias,
      expiresAt: url.expiresAt,
      createdAt: url.createdAt,
      clicks: url.clicks,
      active: url.active
    };
    
    // Get click events
    const clickEvents = await ClickEvent.find({ urlId }).sort({ timestamp: 1 });
    
    // Get clicks by date
    const clicksByDate = await ClickEvent.aggregate([
      { $match: { urlId: mongoose.Types.ObjectId(urlId) } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get clicks by device
    const clicksByDevice = await ClickEvent.aggregate([
      { $match: { urlId: mongoose.Types.ObjectId(urlId) } },
      {
        $group: {
          _id: '$deviceType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get clicks by browser
    const clicksByBrowser = await ClickEvent.aggregate([
      { $match: { urlId: mongoose.Types.ObjectId(urlId) } },
      {
        $group: {
          _id: '$browser',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        url: urlData,
        totalClicks: url.clicks,
        clickEvents,
        clicksByDate: clicksByDate.map(item => ({
          date: item._id,
          count: item.count
        })),
        clicksByDevice: clicksByDevice.map(item => ({
          device: item._id || 'unknown',
          count: item.count
        })),
        clicksByBrowser: clicksByBrowser.map(item => ({
          browser: item._id || 'unknown',
          count: item.count
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get analytics for all user URLs
exports.getUserAnalytics = async (req, res) => {
  try {
    // Get all user URLs
    const urls = await Url.find({ userId: req.user._id });
    
    // Get total clicks
    const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
    
    // Get clicks by date for all URLs
    const clicksByDate = await ClickEvent.aggregate([
      { 
        $match: { 
          urlId: { 
            $in: urls.map(url => mongoose.Types.ObjectId(url._id)) 
          } 
        } 
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get top performing URLs
    const topUrls = urls
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)
      .map(url => ({
        id: url._id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        clicks: url.clicks
      }));
    
    // Get device breakdown
    const deviceBreakdown = await ClickEvent.aggregate([
      { 
        $match: { 
          urlId: { 
            $in: urls.map(url => mongoose.Types.ObjectId(url._id)) 
          } 
        } 
      },
      {
        $group: {
          _id: '$deviceType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalUrls: urls.length,
        totalClicks,
        clicksByDate: clicksByDate.map(item => ({
          date: item._id,
          count: item.count
        })),
        topUrls,
        deviceBreakdown: deviceBreakdown.map(item => ({
          device: item._id || 'unknown',
          count: item.count
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
