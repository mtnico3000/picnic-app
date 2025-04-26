/**
 * Docker Database Initialization Script
 * 
 * This script initializes the MongoDB database with default data when running in Docker.
 * It's designed to be run once when the container starts for the first time.
 */

const mongoose = require('mongoose');
const Picnic = require('../models/Picnic');
const Config = require('../models/Config');
require('dotenv').config();

// Sample picnic data
const samplePicnics = [
  {
    name: 'Welcome Picnic',
    location: 'Central Park',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    description: 'This is a sample picnic created by the Docker initialization script.',
    coordinates: { lat: 40.785091, lng: -73.968285 },
    items: [
      { name: 'Food', list: 'Sandwiches, Drinks' },
      { name: 'Equipment', list: 'Blanket, Games' }
    ]
  },
  {
    name: 'Beach Day',
    location: 'Sunny Beach',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    description: 'A day at the beach with friends and family.',
    coordinates: { lat: 34.0259, lng: -118.7798 },
    items: [
      { name: 'Essentials', list: 'Sunscreen, Beach Towels, Umbrellas' },
      { name: 'Food & Drinks', list: 'Cooler, Snacks' }
    ]
  }
];

// Default configuration
const defaultConfig = {
  appName: 'Picnic App',
  theme: 'light',
  allowPublicAccess: true,
  maxPicnicsPerUser: 10,
  defaultEmoji: '🧺',
  amenitiesDistance: 1000,
  initialized: true
};

// Connect to MongoDB
const connectAndInitialize = async () => {
  try {
    // Set strictQuery to false to prepare for Mongoose 7
    mongoose.set('strictQuery', false);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
    });
    
    console.log('MongoDB connected successfully');
    
    // Check if data already exists
    const picnicCount = await Picnic.countDocuments();
    const configExists = await Config.findOne({ initialized: true });
    
    // Only initialize if no data exists
    if (picnicCount === 0) {
      console.log('Initializing sample picnics...');
      await Picnic.insertMany(samplePicnics);
      console.log(`${samplePicnics.length} sample picnics created`);
    } else {
      console.log(`Database already contains ${picnicCount} picnics. Skipping initialization.`);
    }
    
    // Initialize config if it doesn't exist
    if (!configExists) {
      console.log('Initializing default configuration...');
      await Config.create(defaultConfig);
      console.log('Default configuration created');
    } else {
      console.log('Configuration already exists. Skipping initialization.');
    }
    
    console.log('Database initialization complete');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    process.exit(0);
  } catch (err) {
    console.error('Error during database initialization:', err.message);
    process.exit(1);
  }
};

// Run the initialization
connectAndInitialize();
