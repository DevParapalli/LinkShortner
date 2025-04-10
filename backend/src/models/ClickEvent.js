const mongoose = require('mongoose');

const clickEventSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String
  },
  deviceType: {
    type: String
  },
  browser: {
    type: String
  },
  operatingSystem: {
    type: String
  },
  country: {
    type: String
  },
  city: {
    type: String
  },
  referrer: {
    type: String
  }
});

// Index for faster analytics queries
clickEventSchema.index({ urlId: 1, timestamp: 1 });

module.exports = mongoose.model('ClickEvent', clickEventSchema);