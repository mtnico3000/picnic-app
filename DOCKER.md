# Docker Deployment Guide for Picnic App

This guide explains how to deploy the Picnic App using Docker and Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your system
- [Docker Compose](https://docs.docker.com/compose/install/) installed on your system

## Quick Start

1. Clone the repository or copy the application files to your server
2. Navigate to the application directory:
   ```
   cd picnic-app
   ```
3. Start the application using Docker Compose:
   ```
   docker-compose up -d
   ```
4. Access the application at `http://localhost:3001` (or the host's IP address if deploying remotely)

## Configuration

### Environment Variables

The application uses environment variables for configuration. In the Docker setup, these are defined in:

1. The `docker-compose.yml` file (for container-specific settings)
2. The `.env.docker` file (template for production settings)

For production deployment, you should:

1. Copy `.env.docker` to `.env` in your deployment environment
2. Modify the values in `.env` as needed, especially:
   - `SESSION_SECRET` (use a secure random string)
   - Database connection details if using an external database

### Using the .env File

To use a custom `.env` file with Docker Compose:

```bash
# Copy the template
cp .env.docker .env

# Edit the .env file with your production values
nano .env

# Start the containers with the updated environment
docker-compose up -d
```

## Database Options

### Using the Bundled MongoDB Container

By default, the `docker-compose.yml` includes a MongoDB container. The data is persisted in a Docker volume named `mongo-data`.

### Using an External MongoDB Database

To use an external MongoDB database (like MongoDB Atlas):

1. Edit your `.env` file to update the `DB_URI` with your external MongoDB connection string
2. Optionally, remove or comment out the `mongo` service in `docker-compose.yml` if you don't need the local MongoDB container

## Production Deployment

The application includes a production-ready Docker Compose setup with Nginx as a reverse proxy and MongoDB with authentication.

### Production Setup Files

- `docker-compose.prod.yml`: Production Docker Compose configuration with Nginx and secure settings
- `.env.production`: Production environment variables template
- `nginx/nginx.conf`: Nginx configuration with HTTPS support
- `scripts/init-mongo.sh`: Script to initialize MongoDB with authentication
- `scripts/production-setup.sh`: Script to set up the production environment

### Setting Up Production Environment

1. Make the production setup script executable:
   ```bash
   chmod +x scripts/production-setup.sh
   ```

2. Run the production setup script:
   ```bash
   ./scripts/production-setup.sh
   ```

3. The script will:
   - Check for Docker and Docker Compose
   - Create a `.env` file from the `.env.production` template
   - Set up the SSL directory for your certificates
   - Create Nginx HTML files
   - Build the Docker images
   - Optionally start the containers

4. Before starting the application, you need to:
   - Update the `.env` file with secure passwords and settings
   - Place your SSL certificate and key in the `nginx/ssl` directory
   - Update the `server_name` in `nginx/nginx.conf` to match your domain

## Security Features

The Docker setup includes several security features to protect your application:

### 1. Secure Dockerfiles

- Uses multi-stage builds to reduce image size and attack surface
- Runs containers as non-root user (node)
- Updates all packages to fix vulnerabilities
- Specifically upgrades zlib to version 1.2.12-r2 or higher to fix CVE-2022-37434
- Uses dumb-init to handle signals properly
- Runs npm audit fix to fix package vulnerabilities

### 2. Security Headers in Nginx

- Strict-Transport-Security (HSTS)
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Content-Security-Policy
- Referrer-Policy
- Permissions-Policy

### 3. MongoDB Security

- Authentication enabled by default in production
- Secure password handling with environment variables
- No direct exposure of MongoDB ports in production

### 4. Security Scripts

The application includes scripts to help with security:

#### Vulnerability Scanner

The `scripts/scan-vulnerabilities.sh` script scans Docker images for vulnerabilities:

```bash
# Make the script executable (on Linux/Mac)
chmod +x scripts/scan-vulnerabilities.sh

# Scan the default image
./scripts/scan-vulnerabilities.sh

# Scan a specific image
./scripts/scan-vulnerabilities.sh picnic-app:latest
```

#### Security Audit

The `scripts/security-audit.sh` script performs a security audit of the Docker setup:

```bash
# Make the script executable (on Linux/Mac)
chmod +x scripts/security-audit.sh

# Audit Docker configuration
./scripts/security-audit.sh --docker

# Audit npm packages
./scripts/security-audit.sh --npm

# Run all audits
./scripts/security-audit.sh --all
```

### 5. Production Security Considerations

For production deployment, ensure you:

1. **Security**:
   - Change all default passwords in `.env.production`
   - Generate a secure random string for `SESSION_SECRET`
   - Use proper SSL certificates (not self-signed)
   - Configure firewall rules to only expose necessary ports (80 and 443)

2. **Performance**:
   - Adjust the Node.js and MongoDB container resources as needed
   - Consider using a MongoDB replica set for better reliability
   - Implement proper backup strategies for the database

3. **Monitoring**:
   - Set up container monitoring and logging
   - Use the built-in health checks
   - Consider setting up alerts for container failures

## Docker Compose Commands

```bash
# Start the application in detached mode
docker-compose up -d

# View container logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# Stop the application
docker-compose down

# Stop the application and remove volumes
docker-compose down -v

# Rebuild the application container
docker-compose build app

# Restart a specific service
docker-compose restart app
```

## Utility Scripts

The application includes several utility scripts to help with Docker deployment:

### 1. Development and Production Scripts

#### Development Script

The `scripts/dev.sh` script provides a convenient interface for managing the development environment:

```bash
# Make the script executable (on Linux/Mac)
chmod +x scripts/dev.sh

# Start the development environment
./scripts/dev.sh start

# Stop the development environment
./scripts/dev.sh stop

# Show container logs
./scripts/dev.sh logs

# Open a shell in the app container
./scripts/dev.sh shell

# Open a MongoDB shell
./scripts/dev.sh mongo

# Show help
./scripts/dev.sh help
```

This script:
- Provides a simple command-line interface for common development tasks
- Manages Docker Compose operations with easy-to-remember commands
- Includes shortcuts for accessing container shells and logs
- Simplifies the development workflow

#### Production Script

The `scripts/prod.sh` script provides a convenient interface for managing the production environment:

```bash
# Make the script executable (on Linux/Mac)
chmod +x scripts/prod.sh

# Start the production environment
./scripts/prod.sh start

# Stop the production environment
./scripts/prod.sh stop

# Show container logs
./scripts/prod.sh logs

# Open a shell in the app container
./scripts/prod.sh shell

# Open a MongoDB shell
./scripts/prod.sh mongo

# Open a shell in the Nginx container
./scripts/prod.sh nginx

# Backup the database
./scripts/prod.sh backup

# Restore the database from a backup
./scripts/prod.sh restore

# Show help
./scripts/prod.sh help
```

This script:
- Provides a simple command-line interface for managing the production environment
- Uses the production Docker Compose configuration (docker-compose.prod.yml)
- Includes additional commands for Nginx and database operations
- Simplifies production deployment and maintenance

### 2. Docker Setup Script

The `docker-setup.sh` script helps initialize the Docker environment:

```bash
# Make the script executable (on Linux/Mac)
chmod +x docker-setup.sh

# Run the setup script
./docker-setup.sh
```

This script:
- Checks if Docker and Docker Compose are installed
- Creates a `.env` file from the template if it doesn't exist
- Builds the Docker images
- Starts the containers

### 3. Database Initialization Script

The `scripts/docker-init-db.js` script initializes the MongoDB database with sample data:

```bash
# Run manually if needed
docker-compose exec app node scripts/docker-init-db.js
```

This script is automatically run when the container starts.

### 4. Health Check Script

The `scripts/healthcheck.js` script checks if the application and database are running correctly:

```bash
# Run manually if needed
docker-compose exec app node scripts/healthcheck.js
```

This script is used by Docker's health check mechanism to monitor the application.

### 5. Deployment Script

The `scripts/deploy.sh` script helps deploy the application to a remote server:

```bash
# Make the script executable (on Linux/Mac)
chmod +x scripts/deploy.sh

# Deploy to a server (with default values)
./scripts/deploy.sh

# Deploy with custom parameters
./scripts/deploy.sh username server.example.com /path/to/deploy https://github.com/your/repo.git
```

### 6. Update Script

The `scripts/update-app.sh` script helps update the application in development or production:

```bash
# Make the script executable (on Linux/Mac)
chmod +x scripts/update-app.sh

# Update the development environment
./scripts/update-app.sh dev

# Update the production environment
./scripts/update-app.sh prod

# Or run without arguments to be prompted for the environment
./scripts/update-app.sh
```

This script:
- Creates a database backup before updating
- Pulls the latest code from the git repository (if available)
- Rebuilds and restarts the application container
- Shows container status and recent logs
- Works with both development and production environments

### 7. Monitoring Script

The `scripts/monitor.sh` script provides real-time monitoring of the Docker containers:

```bash
# Make the script executable (on Linux/Mac)
chmod +x scripts/monitor.sh

# Run the monitoring script
./scripts/monitor.sh
```

This script:
- Displays container status and health information
- Shows resource usage (CPU, memory)
- Displays recent logs from all containers
- Refreshes automatically every 5 seconds
- Can be exited with Ctrl+C

### 8. Cleanup Script

The `scripts/cleanup.sh` script helps clean up Docker resources:

```bash
# Make the script executable (on Linux/Mac)
chmod +x scripts/cleanup.sh

# Display help
./scripts/cleanup.sh --help

# Clean up containers
./scripts/cleanup.sh --containers

# Clean up unused images
./scripts/cleanup.sh --images

# Clean up unused volumes (WARNING: This will delete data)
./scripts/cleanup.sh --volumes

# Clean up everything
./scripts/cleanup.sh --all
```

This script:
- Stops and removes containers
- Cleans up unused Docker images
- Removes unused Docker volumes (with confirmation)
- Shows current Docker status after cleanup
- Provides a command-line interface with various options

### 9. SSL Certificate Generation Script

The `scripts/generate-ssl-cert.sh` script generates self-signed SSL certificates for development:

```bash
# Make the script executable (on Linux/Mac)
chmod +x scripts/generate-ssl-cert.sh

# Generate a certificate for the default domain (picnic-app.local)
./scripts/generate-ssl-cert.sh

# Generate a certificate for a custom domain
./scripts/generate-ssl-cert.sh example.com

# Generate a certificate with a custom validity period (in days)
./scripts/generate-ssl-cert.sh example.com 730
```

This script:
- Generates a self-signed SSL certificate for development
- Creates a private key, certificate, and combined PEM file
- Sets appropriate file permissions
- Provides instructions for using the certificate with Nginx
- Places all files in the `nginx/ssl` directory

### 10. Backup and Restore Scripts

The application includes scripts for backing up and restoring the MongoDB database:

#### Backup Script

The `scripts/backup-db.sh` script creates a backup of the MongoDB database:

```bash
# Make the script executable (on Linux/Mac)
chmod +x scripts/backup-db.sh

# Run the backup script
./scripts/backup-db.sh
```

This script:
- Creates a backup of the MongoDB database
- Compresses the backup using gzip
- Stores the backup in the `backups` directory
- Works with both authenticated and non-authenticated MongoDB setups

#### Restore Script

The `scripts/restore-db.sh` script restores a backup of the MongoDB database:

```bash
# Make the script executable (on Linux/Mac)
chmod +x scripts/restore-db.sh

# Run the restore script
./scripts/restore-db.sh

# Or specify a backup file directly
./scripts/restore-db.sh backups/picnic-app_backup_20250425_123456.gz
```

This script:
- Lists available backups
- Prompts for confirmation before restoring
- Restores the database from the selected backup
- Works with both authenticated and non-authenticated MongoDB setups

## Troubleshooting

### Database Connection Issues

If the application cannot connect to the MongoDB database:

1. Check if the MongoDB container is running:
   ```
   docker-compose ps
   ```

2. Check the MongoDB logs:
   ```
   docker-compose logs mongo
   ```

3. Verify the `DB_URI` environment variable is correctly set

### Application Errors

For application-specific errors:

1. Check the application logs:
   ```
   docker-compose logs app
   ```

2. Access the container shell for debugging:
   ```
   docker-compose exec app sh
   ```

### Health Check Failures

If the container health check is failing:

1. Run the health check script manually:
   ```
   docker-compose exec app node scripts/healthcheck.js
   ```

2. Check the application and database logs for errors
