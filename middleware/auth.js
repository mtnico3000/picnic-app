const Config = require('../models/Config');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  // If user is authenticated, proceed to next middleware
  if (req.session.isAuthenticated) {
    return next();
  }
  
  // Otherwise, redirect to login page
  // Store the original URL they were trying to access
  // Ignore favicon.ico requests
  if (req.originalUrl !== '/favicon.ico') {
    req.session.returnTo = req.originalUrl;
  }
  res.redirect('/login');
};

// Middleware to check password against database
const checkPassword = async (password) => {
  try {
    // Get the password from the config collection
    const config = await Config.findOne();
    
    if (!config) {
      console.log('No config found in database');
      return false;
    }
    
    console.log('Checking password:', password, 'against stored password:', config.password);
    
    // Compare the provided password with the stored password
    return password === config.password;
  } catch (err) {
    console.error('Error checking password:', err);
    return false;
  }
};

// List of paths that should not be protected
const publicPaths = [
  '/',
  '/about',
  '/login',
  '/logout',
  /^\/picnics\/[^\/]+$/, // Matches /picnics/:id but not /picnics/:id/edit or /picnics/new
  /^\/picnics\/[^\/]+\/add-item$/ // Allow adding items without authentication
];

// Note: The following paths are protected (not in publicPaths):
// - /picnics (list page)
// - /picnics/new (create page)
// - /picnics/:id/edit (edit page)
// - /config (configuration page)

// Middleware to determine if a path should be protected
const shouldProtectPath = (path) => {
  // Explicitly protect these paths
  if (path === '/picnics/new') {
    return true;
  }
  
  // Check if the path matches any of the public paths
  for (const publicPath of publicPaths) {
    if (typeof publicPath === 'string') {
      if (path === publicPath) {
        return false;
      }
    } else if (publicPath instanceof RegExp) {
      if (publicPath.test(path)) {
        return false;
      }
    }
  }
  
  // If the path doesn't match any public path, it should be protected
  return true;
};

module.exports = {
  isAuthenticated,
  checkPassword,
  shouldProtectPath
};
