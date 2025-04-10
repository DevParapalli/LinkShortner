const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create default user if not exists
    const User = require('../models/User');
    const defaultUser = await User.findOne({ email: 'intern@dacoid.com' });
    
    if (!defaultUser) {
      await User.create({
        email: 'intern@dacoid.com',
        password: 'Test123'
      });
      console.log('Default user created');
    }
    
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
