# Picnic App 😎

A Node.js application for planning and managing picnic events.

[![Docker Ready](https://img.shields.io/badge/docker-ready-blue.svg)](https://docs.docker.com/)

## Features

- Create and manage picnic events
- Track picnic details including location, date, and attendees
- Manage items needed for each picnic
- Responsive design for mobile and desktop

## Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: EJS templates, Bootstrap 5, JavaScript
- **Database**: MongoDB
- **Deployment**: Docker, Docker Compose, Nginx
- **Other**: Express-session for session management, dotenv for environment variables

## Installation

### Standard Installation

1. Clone the repository
2. Install dependencies:
   ```
   cd picnic-app
   npm install
   ```
3. Create a `.env` file based on the provided `.env.example` (already done)
4. Start the application:
   ```
   npm start
   ```
   or for development with auto-reload:
   ```
   npm run dev
   ```
5. Access the application and log in with the default credentials:
   - Default app password: passw0rd

You can also use the provided scripts for local development and production:

#### Local Development Script

```bash
# Make the script executable (on Linux/Mac)
chmod +x scripts/run-local.sh

# Install dependencies
./scripts/run-local.sh install

# Start the application in development mode
./scripts/run-local.sh start

# Clean and reinstall dependencies
./scripts/run-local.sh clean
```

#### Local Production Script

```bash
# Make the script executable (on Linux/Mac)
chmod +x scripts/run-prod-local.sh

# Set up the production environment
./scripts/run-prod-local.sh setup

# Start the application in production mode
./scripts/run-prod-local.sh start

# Install production dependencies only
./scripts/run-prod-local.sh install
```

#### MongoDB Setup Script

If you need to set up MongoDB locally (without Docker):

```bash
# Make the script executable (on Linux/Mac)
chmod +x scripts/setup-mongodb.sh

# Install MongoDB (Ubuntu/Debian)
./scripts/setup-mongodb.sh install

# Start MongoDB service
./scripts/setup-mongodb.sh start

# Initialize the database with sample data
./scripts/setup-mongodb.sh init

# Check MongoDB service status
./scripts/setup-mongodb.sh status
```

### Docker Installation

The application can also be run using Docker and Docker Compose:

1. Clone the repository
2. Navigate to the application directory:
   ```
   cd picnic-app
   ```
3. Start the application using Docker Compose:
   ```
   docker-compose up -d
   ```
4. Access the application at `http://localhost:3001`
5. Log in with the default credentials:
   - Default app password: passw0rd

For more detailed Docker deployment instructions, see the [Docker Deployment Guide](DOCKER.md).

For Windows users, we've created a specific guide for testing the Docker setup on Windows: [Windows Docker Guide](WINDOWS-DOCKER-GUIDE.md).

## Docker Deployment

The application is fully containerized and can be deployed using Docker and Docker Compose. The Docker setup includes:

- Node.js application container
- MongoDB database container
- Nginx reverse proxy for production
- Volume mapping for data persistence
- Environment variable configuration
- Health checks and monitoring

### Docker Features

- **Development Environment**: Simple setup with `docker-compose.yml`
- **Production Environment**: Secure setup with `docker-compose.prod.yml`
- **Database Persistence**: MongoDB data is stored in a Docker volume
- **Automatic Initialization**: Database is automatically initialized with sample data
- **Backup and Restore**: Scripts for database backup and restore
- **Monitoring**: Real-time monitoring of containers
- **Deployment Scripts**: Scripts for easy deployment and updates
- **Security Features**: Vulnerability scanning, security audits, and secure Dockerfiles
- **Multi-stage Builds**: Optimized production images with minimal attack surface
- **Non-root Users**: Containers run as non-root user for better security

### Docker Commands

```bash
# Start the application in development mode
docker-compose up -d

# Start the application in production mode
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

For more detailed Docker deployment instructions, see the [Docker Deployment Guide](DOCKER.md).

## Project Structure

```
picnic-app/
├── app.js                 # Application entry point
├── package.json           # Project dependencies
├── .env                   # Environment variables
├── public/                # Static assets
│   ├── css/               # CSS stylesheets
│   │   └── style.css      # Main stylesheet
│   └── js/                # Client-side JavaScript
│       └── main.js        # Main JavaScript file
├── routes/                # Express routes
│   ├── index.js           # Main routes
│   └── picnics.js         # Picnic-related routes
├── models/                # Data models (for future implementation)
├── controllers/           # Route controllers (for future implementation)
├── views/                 # EJS templates
│   ├── layout.ejs         # Main layout template
│   ├── index.ejs          # Home page
│   ├── about.ejs          # About page
│   ├── error.ejs          # Error page
│   └── picnics/           # Picnic-related views
│       ├── index.ejs      # List all picnics
│       ├── show.ejs       # Show a specific picnic
│       ├── new.ejs        # Create a new picnic
│       └── edit.ejs       # Edit an existing picnic
└── config/                # Configuration files (for future implementation)
```

## Future Enhancements

- Database integration with MongoDB
- User authentication and authorization
- Weather API integration for picnic planning
- Email notifications for picnic invitations
- Mobile app version
- Containerized deployment with Kubernetes

## License

ISC
