const express = require('express');
const router = express.Router();

// Home page route
router.get('/', (req, res) => {
  res.render('index', { 
    title: 'Picnic App',
    message: 'Welcome to the Picnic App 😎'
  });
});

module.exports = router;
