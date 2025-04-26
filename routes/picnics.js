const express = require('express');
const router = express.Router();
const Picnic = require('../models/Picnic');
const Config = require('../models/Config');

// Get all picnics
router.get('/', async (req, res) => {
  // Check if database is connected
  const dbConnected = req.app.locals.dbConnected;
  
  // Get error message from session if any
  const errorMessage = req.session.errorMessage;
  req.session.errorMessage = null; // Clear the error message
  
  if (dbConnected) {
    try {
      const picnics = await Picnic.find().sort({ createdAt: -1 });
      
      res.render('picnics/index', { 
        title: 'All Picnics',
        picnics: picnics,
        dbConnected: true,
        errorMessage: errorMessage
      });
    } catch (err) {
      console.error('Error fetching picnics:', err);
      useFallbackData(err.message);
    }
  } else {
    useFallbackData();
  }
  
  function useFallbackData(error) {
    // Fallback to hardcoded data if database is not available
    const fallbackPicnics = [
      { _id: '1', name: 'Summer Picnic', date: '2025-07-15', location: 'Central Park' },
      { _id: '2', name: 'Family Reunion', date: '2025-08-20', location: 'Riverside Park' },
      { _id: '3', name: 'Company Outing', date: '2025-06-10', location: 'Beach Front' }
    ];
    
    let message = errorMessage;
    if (error && !message) {
      message = 'Database error: ' + error;
    }
    
    res.render('picnics/index', { 
      title: 'All Picnics (Demo Mode)',
      picnics: fallbackPicnics,
      dbConnected: false,
      errorMessage: message
    });
  }
});

// Display form to create a new picnic
router.get('/new', async (req, res) => {
  // Check if database is connected
  const dbConnected = req.app.locals.dbConnected;
  
  let configName = 'Picnic Guru'; // Default name
  
  if (dbConnected) {
    try {
      // Find the first config document or use default if it doesn't exist
      const config = await Config.findOne();
      if (config) {
        configName = config.name;
      }
    } catch (err) {
      console.error('Error fetching config:', err);
      // Use default name if there's an error
    }
  }
  
  res.render('picnics/new', { 
    title: 'Create New Picnic',
    dbConnected: dbConnected,
    configName: configName
  });
});

// Create a new picnic
router.post('/', async (req, res) => {
  // Check if database is connected
  const dbConnected = req.app.locals.dbConnected;
  
  // Create picnic object from form data
  const picnicData = {
    name: req.body.name,
    date: req.body.datetime || req.body.date, // Use datetime if available, fallback to date
    location: req.body.location,
    coordinates: {
      lat: parseFloat(req.body.lat) || 0,
      lng: parseFloat(req.body.lng) || 0
    },
    zoomLevel: parseInt(req.body.zoomLevel) || 13,
    description: req.body.description,
    amenities: req.body.amenities || '',
    items: req.body.items ? Object.keys(req.body.items).map(key => ({
      name: req.body.items[key].name,
      list: req.body.items[key].list
    })) : []
  };
  
  console.log('Amenities field value from form:', req.body.amenities);
  
  if (dbConnected) {
    try {
      // Create and save the new picnic
      const newPicnic = new Picnic(picnicData);
      await newPicnic.save();
      console.log('New picnic saved successfully with ID:', newPicnic._id);
      
      // Redirect to the picnics list
      res.redirect('/picnics');
    } catch (err) {
      console.error('Error saving picnic:', err);
      // Show error message and redirect
      req.session.errorMessage = 'Failed to save picnic: ' + err.message;
      res.redirect('/picnics');
    }
  } else {
    // In demo mode, just redirect to the picnics list
    console.log('Demo mode: Create operation simulated');
    res.redirect('/picnics');
  }
});

// Get a specific picnic
router.get('/:id', async (req, res) => {
  try {
    const picnic = await Picnic.findById(req.params.id);
    
    if (!picnic) {
      return res.status(404).render('error', {
        message: 'Picnic not found',
        error: { status: 404 }
      });
    }
    
    console.log('Picnic amenities from database:', picnic.amenities);
    console.log('Picnic amenities type:', typeof picnic.amenities);
    console.log('Picnic amenities length:', picnic.amenities ? picnic.amenities.length : 0);
    
    res.render('picnics/show', { 
      title: picnic.name,
      picnic: picnic,
      req: req,
      baseUrl: `${req.protocol}://${req.get('host')}`
    });
  } catch (err) {
    console.error(err);
    // Fallback to demo data if database is not available
    const fallbackPicnic = {
      _id: req.params.id,
      name: 'Sample Picnic',
      date: new Date('2025-07-15'),
      location: 'Central Park',
      description: 'A lovely summer picnic with friends and family.',
      items: [
        { name: 'John', list: 'Sandwiches, Drinks' },
        { name: 'Sarah', list: 'Fruit, Blankets' },
        { name: 'Mike', list: 'Games, Snacks' }
      ]
    };
    
    res.render('picnics/show', { 
      title: fallbackPicnic.name + ' (Demo)',
      picnic: fallbackPicnic,
      req: req,
      baseUrl: `${req.protocol}://${req.get('host')}`
    });
  }
});

// Display form to edit a picnic
router.get('/:id/edit', async (req, res) => {
  try {
    const picnic = await Picnic.findById(req.params.id);
    
    if (!picnic) {
      return res.status(404).render('error', {
        message: 'Picnic not found',
        error: { status: 404 }
      });
    }
    
    res.render('picnics/edit', { 
      title: 'Edit ' + picnic.name,
      picnic: picnic
    });
  } catch (err) {
    console.error(err);
    // Fallback to demo data if database is not available
    const fallbackPicnic = {
      _id: req.params.id,
      name: 'Sample Picnic',
      date: new Date('2025-07-15'),
      location: 'Central Park',
      description: 'A lovely summer picnic with friends and family.',
      items: [
        { name: 'John', list: 'Sandwiches, Drinks' },
        { name: 'Sarah', list: 'Fruit, Blankets' },
        { name: 'Mike', list: 'Games, Snacks' }
      ]
    };
    
    res.render('picnics/edit', { 
      title: 'Edit ' + fallbackPicnic.name + ' (Demo)',
      picnic: fallbackPicnic
    });
  }
});

// Update a picnic
router.post('/:id', async (req, res) => {
  try {
    const updatedPicnic = {
      name: req.body.name,
      date: req.body.datetime || req.body.date, // Use datetime if available, fallback to date
      location: req.body.location,
      coordinates: {
        lat: parseFloat(req.body.lat) || 0,
        lng: parseFloat(req.body.lng) || 0
      },
      zoomLevel: parseInt(req.body.zoomLevel) || 13,
      description: req.body.description,
      amenities: req.body.amenities || '',
      items: req.body.items ? Object.keys(req.body.items).map(key => ({
        name: req.body.items[key].name,
        list: req.body.items[key].list
      })) : []
    };
    
    await Picnic.findByIdAndUpdate(req.params.id, updatedPicnic);
    res.redirect('/picnics/' + req.params.id);
  } catch (err) {
    console.error(err);
    // In demo mode, just redirect back to the picnic
    console.log('Demo mode: Update operation simulated');
    res.redirect('/picnics/' + req.params.id);
  }
});

// Delete a picnic
router.post('/:id/delete', async (req, res) => {
  try {
    await Picnic.findByIdAndDelete(req.params.id);
    res.redirect('/picnics');
  } catch (err) {
    console.error(err);
    // In demo mode, just redirect to the picnics list
    console.log('Demo mode: Delete operation simulated');
    res.redirect('/picnics');
  }
});

// Add an item to a picnic
router.post('/:id/add-item', async (req, res) => {
  try {
    // Find the picnic by ID
    const picnic = await Picnic.findById(req.params.id);
    
    if (!picnic) {
      return res.status(404).render('error', {
        message: 'Picnic not found',
        error: { status: 404 }
      });
    }
    
    // Create a new item object
    const newItem = {
      name: req.body.name,
      list: req.body.list
    };
    
    // Add the new item to the picnic's items array
    picnic.items.push(newItem);
    
    // Save the updated picnic
    await picnic.save();
    
    // Redirect back to the picnic details page
    res.redirect('/picnics/' + req.params.id);
  } catch (err) {
    console.error('Error adding item to picnic:', err);
    
    // In demo mode or if there's an error, handle it gracefully
    try {
      // Try to find the picnic again to display it
      const picnic = await Picnic.findById(req.params.id);
      if (picnic) {
        // If we can find the picnic, redirect back to it
        return res.redirect('/picnics/' + req.params.id);
      }
    } catch (secondaryErr) {
      console.error('Secondary error:', secondaryErr);
    }
    
    // If all else fails, redirect to the picnics list
    res.redirect('/picnics');
  }
});

module.exports = router;
