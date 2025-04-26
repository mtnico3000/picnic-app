/**
 * Health Check Script
 * 
 * This script performs a health check on the application.
 * It can be used by Docker or monitoring tools to verify the application is running correctly.
 */

const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

// Check if the application server is responding
const checkServer = () => {
  return new Promise((resolve, reject) => {
    const options = {
      host: 'localhost',
      port: process.env.PORT || 3001,
      path: '/',
      timeout: 2000
    };

    const request = http.get(options, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        reject(new Error(`HTTP Status: ${res.statusCode}`));
      }
      res.resume(); // Consume response data to free up memory
    });

    request.on('error', (err) => {
      reject(err);
    });

    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timed out'));
    });
  });
};

// Check if the database is connected
const checkDatabase = async () => {
  try {
    // Set strictQuery to false to prepare for Mongoose 7
    mongoose.set('strictQuery', false);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 2000 // Short timeout for health check
    });
    
    // If we get here, the connection was successful
    await mongoose.connection.close();
    return true;
  } catch (err) {
    return false;
  }
};

// Run all health checks
const runHealthChecks = async () => {
  try {
    // Check server
    const serverOk = await checkServer().catch(() => false);
    
    // Check database
    const dbOk = await checkDatabase();
    
    // Log results
    console.log('Health Check Results:');
    console.log(`- Server: ${serverOk ? 'OK' : 'FAIL'}`);
    console.log(`- Database: ${dbOk ? 'OK' : 'FAIL'}`);
    
    // Exit with appropriate code
    if (serverOk && dbOk) {
      console.log('All health checks passed');
      process.exit(0);
    } else {
      console.error('One or more health checks failed');
      process.exit(1);
    }
  } catch (err) {
    console.error('Health check error:', err.message);
    process.exit(1);
  }
};

// Run the health checks
runHealthChecks();
