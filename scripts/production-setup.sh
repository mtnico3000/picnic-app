#!/bin/bash

# Production Setup Script for Picnic App
# This script helps set up the production environment for the Picnic App

# Make script exit on error
set -e

echo "=== Picnic App Production Setup ==="
echo

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    echo "Visit https://docs.docker.com/get-docker/ for installation instructions."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit https://docs.docker.com/compose/install/ for installation instructions."
    exit 1
fi

echo "Docker and Docker Compose are installed."
echo

# Create production environment file
if [ ! -f .env.production ]; then
    echo "Error: .env.production file not found."
    echo "Please make sure the .env.production file exists in the project root."
    exit 1
fi

# Copy production environment file to .env
echo "Creating .env file from production template..."
cp .env.production .env
echo "Created .env file. Please review and update the settings as needed."
echo

# Create SSL directory if it doesn't exist
echo "Setting up SSL directory..."
mkdir -p nginx/ssl
echo "SSL directory created at nginx/ssl"
echo "Please place your SSL certificate and key files in this directory:"
echo "  - nginx/ssl/picnic-app.crt (certificate)"
echo "  - nginx/ssl/picnic-app.key (private key)"
echo

# Create HTML directory for Nginx
echo "Setting up Nginx HTML directory..."
mkdir -p nginx/html
echo "<html><body><h1>Picnic App</h1><p>If you see this page, Nginx is running but the application is not yet available.</p></body></html>" > nginx/html/index.html
echo "<html><body><h1>404 - Not Found</h1><p>The page you requested could not be found.</p></body></html>" > nginx/html/404.html
echo "<html><body><h1>500 - Server Error</h1><p>The server encountered an error processing your request.</p></body></html>" > nginx/html/50x.html
echo "Nginx HTML files created."
echo

# Build the Docker images
echo "Building Docker images..."
docker-compose -f docker-compose.prod.yml build
echo "Docker images built successfully."
echo

# Prompt for starting containers
read -p "Do you want to start the containers now? (y/n): " start_containers
if [[ $start_containers == "y" || $start_containers == "Y" ]]; then
    echo "Starting containers..."
    docker-compose -f docker-compose.prod.yml up -d
    echo "Containers started successfully."
    
    # Initialize MongoDB
    echo "Initializing MongoDB..."
    sleep 10 # Wait for MongoDB to start
    docker-compose -f docker-compose.prod.yml exec mongo bash -c "chmod +x /usr/src/app/scripts/init-mongo.sh && /usr/src/app/scripts/init-mongo.sh"
    
    # Show container status
    echo "Container status:"
    docker-compose -f docker-compose.prod.yml ps
    echo
    
    echo "=== Setup Complete ==="
    echo "The Picnic App should now be running at: https://picnic-app.example.com"
    echo "(Make sure to update your DNS settings to point to this server)"
    echo
    echo "You can view the logs with: docker-compose -f docker-compose.prod.yml logs -f"
    echo "You can stop the application with: docker-compose -f docker-compose.prod.yml down"
else
    echo
    echo "=== Setup Complete ==="
    echo "You can start the containers later with: docker-compose -f docker-compose.prod.yml up -d"
fi

echo
echo "For more information, see the DOCKER.md file."
