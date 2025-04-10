const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const { PORT, NODE_ENV } = require('./config/env');

// Import routes
const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const { 
  logClickEventInternal,
} = require('./controllers/analyticsController');

// Connect to database
connectDB();

// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.enable('trust proxy'); // Trust the first proxy 

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/analytics', analyticsRoutes);

// Redirect route
app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    // Make a request to the internal API
    const response = await fetch(`${req.protocol}://${req.get('host')}/api/urls/${shortCode}`);
    const data = await response.json();
    
    if (!data.success) {
      return res.status(404).send('Link not found or expired');
    }
    

    logClickEventInternal(data.urlId, req.headers['user-agent'], req.ip || req.connection.remoteAddress, req.headers.referer || 'direct');
    

    return res.status(200).json({
      success: true,
      originalUrl: data.originalUrl,
      urlId: data.urlId
    })

    // Redirect to original URL, this is valid when this is not being accessed by an API client.
    // return res.redirect(data.originalUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    return res.status(500).send('Server error');
  }
});

// Serve frontend in production
if (NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../frontend/build', 'index.html'));
  });
}

// Error handler
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;
