#!/bin/bash

# Picnic App Deployment Script
# This script helps deploy the Picnic App to a production server

# Make script exit on error
set -e

# Configuration
REMOTE_USER=${1:-"user"}
REMOTE_HOST=${2:-"example.com"}
REMOTE_DIR=${3:-"/var/www/picnic-app"}
REPO_URL=${4:-"https://github.com/yourusername/picnic-app.git"}

echo "=== Picnic App Deployment ==="
echo "Deploying to: $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR"
echo

# Check if SSH key exists
if [ ! -f ~/.ssh/id_rsa ]; then
    echo "SSH key not found. Please create an SSH key pair first:"
    echo "ssh-keygen -t rsa -b 4096"
    exit 1
fi

echo "Connecting to remote server..."
# Create the deployment directory if it doesn't exist
ssh $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_DIR"

# Clone or update the repository
echo "Updating code from repository..."
ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_DIR && \
    if [ -d .git ]; then \
        git pull; \
    else \
        git clone $REPO_URL .; \
    fi"

# Copy the .env file if it doesn't exist
echo "Setting up environment..."
ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_DIR && \
    if [ ! -f .env ]; then \
        cp .env.docker .env; \
        echo 'Created .env file from template'; \
    else \
        echo '.env file already exists'; \
    fi"

# Deploy with Docker Compose
echo "Deploying with Docker Compose..."
ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_DIR && \
    docker-compose down && \
    docker-compose build --no-cache && \
    docker-compose up -d"

# Check deployment status
echo "Checking deployment status..."
ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_DIR && \
    docker-compose ps && \
    echo && \
    echo 'Recent logs:' && \
    docker-compose logs --tail=20"

echo
echo "=== Deployment Complete ==="
echo "The Picnic App should now be running at: http://$REMOTE_HOST:3001"
echo
echo "You can check the logs with:"
echo "ssh $REMOTE_USER@$REMOTE_HOST 'cd $REMOTE_DIR && docker-compose logs -f'"
