#!/bin/bash

# Docker setup script for Picnic App
# This script helps initialize the Docker environment for the Picnic App

# Make script exit on error
set -e

echo "=== Picnic App Docker Setup ==="
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

# Create .env file from template if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.docker .env
    echo "Created .env file. You may want to edit it with your production settings."
else
    echo ".env file already exists. Using existing configuration."
fi

echo

# Build the Docker images
echo "Building Docker images..."
docker-compose build
echo "Docker images built successfully."
echo

# Start the containers
echo "Starting containers..."
docker-compose up -d
echo "Containers started successfully."
echo

# Show container status
echo "Container status:"
docker-compose ps
echo

# Show application URL
echo "=== Setup Complete ==="
echo "The Picnic App should now be running at: http://localhost:3001"
echo "MongoDB is available at: mongodb://localhost:27017"
echo
echo "You can view the logs with: docker-compose logs -f"
echo "You can stop the application with: docker-compose down"
echo
echo "For more information, see the DOCKER.md file."
