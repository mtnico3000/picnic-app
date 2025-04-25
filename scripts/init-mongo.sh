#!/bin/bash

# MongoDB Initialization Script for Production
# This script creates the necessary users and databases for the Picnic App in MongoDB

# Load environment variables
source .env.production

# Wait for MongoDB to start
echo "Waiting for MongoDB to start..."
sleep 5

# Connect to MongoDB and create users
echo "Initializing MongoDB users and databases..."

# Create the application database and user
mongo admin --host mongo -u $MONGO_ROOT_USER -p $MONGO_ROOT_PASSWORD --eval "
  db = db.getSiblingDB('picnic-app');
  
  // Create application user
  db.createUser({
    user: '$MONGO_APP_USER',
    pwd: '$MONGO_APP_PASSWORD',
    roles: [
      { role: 'readWrite', db: 'picnic-app' }
    ]
  });
  
  // Create initial collections
  db.createCollection('picnics');
  db.createCollection('configs');
  
  print('MongoDB users and collections initialized');
"

# Check if the initialization was successful
if [ $? -eq 0 ]; then
  echo "MongoDB initialization completed successfully"
else
  echo "MongoDB initialization failed"
  exit 1
fi

echo "MongoDB is now ready for use with authentication"
