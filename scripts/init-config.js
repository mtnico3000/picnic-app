const mongoose = require('mongoose');
const Config = require('../models/Config');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Connect to MongoDB
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Check if config already exists
    const existingConfig = await Config.findOne();
    
    if (existingConfig) {
      console.log('Config already exists:', existingConfig);
      
      // Update the password and name if needed
      existingConfig.password = 'passw00rd';
      existingConfig.name = 'Picnic Guru';
      await existingConfig.save();
      console.log('Config updated');
    } else {
      // Create a new config
      const newConfig = new Config({
        name: 'Picnic Guru',
        password: 'passw00rd'
      });
      
      await newConfig.save();
      console.log('New config created:', newConfig);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Close the connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});
