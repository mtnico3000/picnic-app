const express = require('express');
const router = express.Router();
const { checkPassword } = require('../middleware/auth');

// Login page route
router.get('/login', (req, res) => {
  // If user is already authenticated, redirect to home
  if (req.session.isAuthenticated) {
    return res.redirect('/');
  }
  
  res.render('login', { 
    title: 'Login',
    errorMessage: req.session.errorMessage
  });
  
  // Clear any error message
  req.session.errorMessage = null;
});

// Login form submission
router.post('/login', async (req, res) => {
  console.log('Login attempt with body:', req.body);
  const { password } = req.body;
  
  console.log('Password from form:', password);
  
  // Check if password is correct
  const isValid = await checkPassword(password);
  console.log('Password valid:', isValid);
  
  if (isValid) {
    // Set session as authenticated
    req.session.isAuthenticated = true;
    console.log('Authentication successful, session:', req.session);
    
    // Redirect to the original URL they were trying to access, or picnics if none
    let returnTo = req.session.returnTo || '/picnics';
    
    // Avoid redirecting to favicon.ico
    if (returnTo === '/favicon.ico') {
      returnTo = '/picnics';
    }
    
    console.log('Redirecting to:', returnTo);
    delete req.session.returnTo;
    
    res.redirect(returnTo);
  } else {
    // Set error message and redirect back to login
    console.log('Authentication failed');
    req.session.errorMessage = 'Invalid password. Please try again.';
    res.redirect('/login');
  }
});

// Logout route
router.get('/logout', (req, res) => {
  // Clear the session
  req.session.isAuthenticated = false;
  
  // Redirect to home
  res.redirect('/');
});

module.exports = router;
