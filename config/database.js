const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Set strictQuery to false to prepare for Mongoose 7
    mongoose.set('strictQuery', false);
    
    // Connect to MongoDB with improved options
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
    });
    
    console.log('MongoDB connected successfully');
    
    // Add event listeners for connection issues
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
    return true;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.log('App will continue without database functionality');
    console.log('Please ensure MongoDB is running at:', process.env.DB_URI);
    
    // Don't exit the process, allow the app to run without DB
    return false;
  }
};

module.exports = connectDB;
