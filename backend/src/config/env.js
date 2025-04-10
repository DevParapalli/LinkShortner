require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'supersecretkey',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  BASE_URL: process.env.BASE_URL || 'http://localhost:5000'
};