#!/bin/bash

# Application Update Script for Picnic App
# This script helps update the application in production

# Make script exit on error
set -e

echo "=== Picnic App Update Script ==="
echo

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ] || [ ! -f "docker-compose.prod.yml" ]; then
    echo "Error: This script must be run from the root directory of the Picnic App."
    echo "Please navigate to the directory containing docker-compose.yml and try again."
    exit 1
fi

# Determine which docker-compose file to use
if [ -z "$1" ]; then
    # No argument provided, ask user
    echo "Which environment do you want to update?"
    echo "1) Development (docker-compose.yml)"
    echo "2) Production (docker-compose.prod.yml)"
    read -p "Enter your choice (1/2): " env_choice
    
    if [ "$env_choice" == "1" ]; then
        COMPOSE_FILE="docker-compose.yml"
        ENV_NAME="development"
    elif [ "$env_choice" == "2" ]; then
        COMPOSE_FILE="docker-compose.prod.yml"
        ENV_NAME="production"
    else
        echo "Invalid choice. Exiting."
        exit 1
    fi
else
    # Argument provided
    if [ "$1" == "dev" ] || [ "$1" == "development" ]; then
        COMPOSE_FILE="docker-compose.yml"
        ENV_NAME="development"
    elif [ "$1" == "prod" ] || [ "$1" == "production" ]; then
        COMPOSE_FILE="docker-compose.prod.yml"
        ENV_NAME="production"
    else
        echo "Invalid argument: $1"
        echo "Valid options are: dev, development, prod, production"
        exit 1
    fi
fi

echo "Updating $ENV_NAME environment using $COMPOSE_FILE"
echo

# Check if containers are running
if ! docker-compose -f $COMPOSE_FILE ps | grep -q "Up"; then
    echo "Error: No containers are running."
    echo "Please start the containers first with: docker-compose -f $COMPOSE_FILE up -d"
    exit 1
fi

# Create backup before updating
echo "Creating database backup before update..."
if [ -f "scripts/backup-db.sh" ]; then
    ./scripts/backup-db.sh
else
    echo "Warning: backup script not found. Skipping backup."
fi
echo

# Pull latest code if using git
if [ -d ".git" ]; then
    echo "Pulling latest code from repository..."
    git pull
    echo "Code updated."
    echo
fi

# Rebuild and restart containers
echo "Rebuilding and restarting containers..."
docker-compose -f $COMPOSE_FILE build app
docker-compose -f $COMPOSE_FILE up -d --no-deps app
echo "Containers rebuilt and restarted."
echo

# Check container status
echo "Container status:"
docker-compose -f $COMPOSE_FILE ps
echo

# Check application logs
echo "Application logs:"
docker-compose -f $COMPOSE_FILE logs --tail=10 app
echo

echo "=== Update Complete ==="
echo "The Picnic App has been updated successfully."
echo
echo "You can monitor the application with:"
echo "docker-compose -f $COMPOSE_FILE logs -f app"
echo
echo "Or use the monitoring script:"
echo "./scripts/monitor.sh"
