#!/bin/bash

# MongoDB Setup Script for Picnic App
# This script helps set up a MongoDB database for the application without Docker

# Make script exit on error
set -e

echo "=== Picnic App MongoDB Setup ==="
echo

# Function to display usage
display_usage() {
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  install     Install MongoDB (Ubuntu/Debian)"
    echo "  start       Start MongoDB service"
    echo "  stop        Stop MongoDB service"
    echo "  status      Check MongoDB service status"
    echo "  init        Initialize the database with sample data"
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
    install)
        echo "Installing MongoDB on Ubuntu/Debian..."
        echo "This will install MongoDB 6.0 on your system."
        echo
        
        # Import MongoDB public GPG key
        echo "Importing MongoDB public GPG key..."
        wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
        
        # Create list file for MongoDB
        echo "Creating list file for MongoDB..."
        echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
        
        # Update package database
        echo "Updating package database..."
        sudo apt-get update
        
        # Install MongoDB packages
        echo "Installing MongoDB packages..."
        sudo apt-get install -y mongodb-org
        
        # Start MongoDB service
        echo "Starting MongoDB service..."
        sudo systemctl start mongod
        
        # Enable MongoDB service to start on boot
        echo "Enabling MongoDB service to start on boot..."
        sudo systemctl enable mongod
        
        echo "MongoDB installed successfully."
        echo "You can check the status with: $0 status"
        ;;
    start)
        echo "Starting MongoDB service..."
        sudo systemctl start mongod
        echo "MongoDB service started."
        ;;
    stop)
        echo "Stopping MongoDB service..."
        sudo systemctl stop mongod
        echo "MongoDB service stopped."
        ;;
    status)
        echo "Checking MongoDB service status..."
        sudo systemctl status mongod
        ;;
    init)
        echo "Initializing MongoDB database with sample data..."
        
        # Check if MongoDB is running
        if ! pgrep mongod > /dev/null; then
            echo "Error: MongoDB is not running."
            echo "Please start MongoDB with: $0 start"
            exit 1
        fi
        
        # Create database and collections
        echo "Creating database and collections..."
        mongo --eval "
          db = db.getSiblingDB('picnic-app');
          
          // Create collections
          db.createCollection('picnics');
          db.createCollection('configs');
          
          // Insert sample picnics
          db.picnics.insertMany([
            {
              title: 'Welcome Picnic',
              location: 'Central Park',
              date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              description: 'This is a sample picnic created by the initialization script.',
              items: ['Sandwiches', 'Drinks', 'Blanket', 'Games'],
              emoji: '🧺'
            },
            {
              title: 'Beach Day',
              location: 'Sunny Beach',
              date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              description: 'A day at the beach with friends and family.',
              items: ['Sunscreen', 'Beach Towels', 'Umbrellas', 'Cooler', 'Snacks'],
              emoji: '🏖️'
            }
          ]);
          
          // Insert default config
          db.configs.insertOne({
            appName: 'Picnic App',
            theme: 'light',
            allowPublicAccess: true,
            maxPicnicsPerUser: 10,
            defaultEmoji: '🧺',
            initialized: true
          });
          
          print('Database initialized with sample data');
        "
        
        echo "Database initialized successfully."
        echo "You can now update the DB_URI in your .env file to: mongodb://localhost:27017/picnic-app"
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
