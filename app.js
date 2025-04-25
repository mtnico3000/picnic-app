const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

// Initialize express app
const app = express();

// Connect to MongoDB
const connectDB = require('./config/database');
let dbConnected = false;

// Initialize database connection
(async () => {
  dbConnected = await connectDB();
  if (dbConnected) {
    console.log('Database connection established - full functionality available');
  } else {
    console.log('Running in demo mode - database functionality limited');
  }
  
  // Make database connection status available to routes
  app.locals.dbConnected = dbConnected;
})();
const PORT = process.env.PORT || 3000;

// Configure middleware
app.use(morgan('dev')); // Logging
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set up view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout');

// Session configuration
app.use(session({
  secret: 'picnic-app-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Import routes
const indexRoutes = require('./routes/index');
const picnicRoutes = require('./routes/picnics');
const configRoutes = require('./routes/config');
const authRoutes = require('./routes/auth');

// Import middleware
const { isAuthenticated, shouldProtectPath } = require('./middleware/auth');

// Make authentication status available to all views
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isAuthenticated || false;
  next();
});

// Use auth routes first (login/logout)
app.use('/', authRoutes);

// Authentication middleware for protected routes
app.use((req, res, next) => {
  // Skip authentication for public paths
  if (!shouldProtectPath(req.path)) {
    return next();
  }
  
  // Check if user is authenticated
  isAuthenticated(req, res, next);
});

// Use other routes
app.use('/', indexRoutes);
app.use('/picnics', picnicRoutes);
app.use('/config', configRoutes);

// Error handling middleware
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.render('error', {
    message: error.message,
    error: app.get('env') === 'development' ? error : {}
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Picnic app server running on http://localhost:${PORT}`);
});

module.exports = app;
