const express = require('express');
const router = express.Router();
const Config = require('../models/Config');

// Get config page
router.get('/', async (req, res) => {
  // Check if database is connected
  const dbConnected = req.app.locals.dbConnected;
  
  // Get error message from session if any
  const errorMessage = req.session.errorMessage;
  req.session.errorMessage = null; // Clear the error message
  
  if (dbConnected) {
    try {
      // Find the first config document or create one if it doesn't exist
      let config = await Config.findOne();
      
      if (!config) {
        config = new Config({ name: 'Picnic Guru' });
        await config.save();
      }
      
      res.render('config/index', { 
        title: 'Configuration',
        config: config,
        dbConnected: true,
        errorMessage: errorMessage
      });
    } catch (err) {
      console.error('Error fetching config:', err);
      useFallbackData(err.message);
    }
  } else {
    useFallbackData();
  }
  
  function useFallbackData(error) {
    // Fallback to hardcoded data if database is not available
    const fallbackConfig = { 
      name: 'Picnic Guru (Demo)',
      password: 'passw0rd (Demo)'
    };
    
    let message = errorMessage;
    if (error && !message) {
      message = 'Database error: ' + error;
    }
    
    res.render('config/index', { 
      title: 'Configuration (Demo Mode)',
      config: fallbackConfig,
      dbConnected: false,
      errorMessage: message
    });
  }
});

// Update config
router.post('/', async (req, res) => {
  // Check if database is connected
  const dbConnected = req.app.locals.dbConnected;
  
  if (dbConnected) {
    try {
      // Find the first config document or create one if it doesn't exist
      let config = await Config.findOne();
      
      if (!config) {
        config = new Config();
      }
      
      // Update the name and password
      config.name = req.body.name;
      config.password = req.body.password;
      
      // Save the updated config
      await config.save();
      console.log('Config updated successfully');
      
      // Redirect back to the config page
      res.redirect('/config');
    } catch (err) {
      console.error('Error updating config:', err);
      // Show error message and redirect
      req.session.errorMessage = 'Failed to update config: ' + err.message;
      res.redirect('/config');
    }
  } else {
    // In demo mode, just redirect to the config page
    console.log('Demo mode: Update operation simulated');
    res.redirect('/config');
  }
});

module.exports = router;
