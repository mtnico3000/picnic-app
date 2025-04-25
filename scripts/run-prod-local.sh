#!/bin/bash

# Local Production Script for Picnic App
# This script helps run the application in production mode without Docker

# Make script exit on error
set -e

echo "=== Picnic App Local Production ==="
echo

# Function to display usage
display_usage() {
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  start       Start the application in production mode"
    echo "  install     Install dependencies (production only)"
    echo "  setup       Set up the production environment"
    echo "  help        Display this help message"
    echo
}

# Check if no arguments provided
if [ $# -eq 0 ]; then
    display_usage
    exit 1
fi

# Parse command
COMMAND=$1

case $COMMAND in
    start)
        echo "Starting application in production mode..."
        echo "Press Ctrl+C to stop."
        echo
        NODE_ENV=production npm start
        ;;
    install)
        echo "Installing production dependencies..."
        npm install --production
        echo "Production dependencies installed."
        ;;
    setup)
        echo "Setting up production environment..."
        
        # Check if .env file exists
        if [ ! -f ".env" ]; then
            echo "Creating .env file from template..."
            if [ -f ".env.production" ]; then
                cp .env.production .env
                echo "Created .env file from .env.production template."
            else
                echo "Error: .env.production file not found."
                exit 1
            fi
        else
            echo ".env file already exists."
        fi
        
        # Install production dependencies
        echo "Installing production dependencies..."
        npm install --production
        
        # Initialize database if needed
        if [ -f "scripts/init-config.js" ]; then
            echo "Initializing configuration..."
            node scripts/init-config.js
            echo "Configuration initialized."
        fi
        
        echo "Production environment setup complete."
        echo "You can now start the application with: $0 start"
        ;;
    help)
        display_usage
        ;;
    *)
        echo "Unknown command: $COMMAND"
        display_usage
        exit 1
        ;;
esac

echo
echo "=== Command Complete ==="
