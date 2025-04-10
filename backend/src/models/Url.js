const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true
  },
  customAlias: {
    type: String,
    sparse: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: null
  },
  clicks: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  }
});

// Index for faster lookups
urlSchema.index({ shortCode: 1 });
urlSchema.index({ userId: 1 });

module.exports = mongoose.model('Url', urlSchema);