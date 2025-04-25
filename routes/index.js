const express = require('express');
const router = express.Router();

// Home page route
router.get('/', (req, res) => {
  res.render('index', { 
    title: 'Picnic App',
    message: 'Welcome to the Picnic App!'
  });
});

// About page route
router.get('/about', (req, res) => {
  res.render('about', { 
    title: 'About Picnic App',
    message: 'Learn more about our picnic planning application'
  });
});

module.exports = router;
