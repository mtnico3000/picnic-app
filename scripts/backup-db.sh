#!/bin/bash

# MongoDB Backup Script for Picnic App
# This script creates a backup of the MongoDB database

# Make script exit on error
set -e

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILENAME="picnic-app_backup_$TIMESTAMP.gz"

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo "Error: .env file not found."
    exit 1
fi

echo "=== Picnic App Database Backup ==="
echo

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR
echo "Backup directory: $BACKUP_DIR"

# Check if MongoDB container is running
if ! docker-compose ps | grep -q "mongo.*Up"; then
    echo "Error: MongoDB container is not running."
    echo "Please start the containers with: docker-compose up -d"
    exit 1
fi

echo "Creating database backup..."

# Determine if we're using authentication
if [[ -n "$MONGO_ROOT_USER" && -n "$MONGO_ROOT_PASSWORD" ]]; then
    # With authentication
    echo "Using authentication for backup..."
    docker-compose exec -T mongo mongodump \
        --host localhost \
        --port 27017 \
        --username $MONGO_ROOT_USER \
        --password $MONGO_ROOT_PASSWORD \
        --authenticationDatabase admin \
        --db picnic-app \
        --archive \
        --gzip > "$BACKUP_DIR/$BACKUP_FILENAME"
else
    # Without authentication
    echo "Creating backup without authentication..."
    docker-compose exec -T mongo mongodump \
        --host localhost \
        --port 27017 \
        --db picnic-app \
        --archive \
        --gzip > "$BACKUP_DIR/$BACKUP_FILENAME"
fi

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup created successfully: $BACKUP_DIR/$BACKUP_FILENAME"
    echo "Backup size: $(du -h "$BACKUP_DIR/$BACKUP_FILENAME" | cut -f1)"
else
    echo "Error: Backup failed."
    exit 1
fi

# List recent backups
echo
echo "Recent backups:"
ls -lh $BACKUP_DIR | grep "picnic-app_backup_" | tail -5

echo
echo "=== Backup Complete ==="
echo
echo "To restore this backup, use:"
echo "mongorestore --host localhost --port 27017 --gzip --archive=$BACKUP_DIR/$BACKUP_FILENAME"
echo
echo "Or with Docker:"
echo "cat $BACKUP_DIR/$BACKUP_FILENAME | docker-compose exec -T mongo mongorestore --gzip --archive"
