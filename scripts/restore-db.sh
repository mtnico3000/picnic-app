#!/bin/bash

# MongoDB Restore Script for Picnic App
# This script restores a backup of the MongoDB database

# Make script exit on error
set -e

# Configuration
BACKUP_DIR="./backups"

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo "Error: .env file not found."
    exit 1
fi

echo "=== Picnic App Database Restore ==="
echo

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "Error: Backup directory not found: $BACKUP_DIR"
    exit 1
fi

# Check if MongoDB container is running
if ! docker-compose ps | grep -q "mongo.*Up"; then
    echo "Error: MongoDB container is not running."
    echo "Please start the containers with: docker-compose up -d"
    exit 1
fi

# List available backups
echo "Available backups:"
ls -lh $BACKUP_DIR | grep "picnic-app_backup_"

# Get backup file from argument or prompt user
if [ -n "$1" ]; then
    BACKUP_FILE="$1"
    if [ ! -f "$BACKUP_FILE" ]; then
        echo "Error: Backup file not found: $BACKUP_FILE"
        exit 1
    fi
else
    echo
    echo "Enter the backup file to restore (from the list above):"
    read -p "Backup file: " BACKUP_FILE
    
    # Check if file exists
    if [ ! -f "$BACKUP_FILE" ]; then
        # Try with backup directory prefix
        if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
            echo "Error: Backup file not found: $BACKUP_FILE"
            exit 1
        else
            BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
        fi
    fi
fi

echo
echo "You are about to restore the database from: $BACKUP_FILE"
echo "WARNING: This will overwrite the current database!"
read -p "Are you sure you want to continue? (y/n): " confirm

if [[ $confirm != "y" && $confirm != "Y" ]]; then
    echo "Restore cancelled."
    exit 0
fi

echo
echo "Restoring database from backup..."

# Determine if we're using authentication
if [[ -n "$MONGO_ROOT_USER" && -n "$MONGO_ROOT_PASSWORD" ]]; then
    # With authentication
    echo "Using authentication for restore..."
    cat "$BACKUP_FILE" | docker-compose exec -T mongo mongorestore \
        --host localhost \
        --port 27017 \
        --username $MONGO_ROOT_USER \
        --password $MONGO_ROOT_PASSWORD \
        --authenticationDatabase admin \
        --gzip \
        --archive \
        --drop
else
    # Without authentication
    echo "Restoring without authentication..."
    cat "$BACKUP_FILE" | docker-compose exec -T mongo mongorestore \
        --host localhost \
        --port 27017 \
        --gzip \
        --archive \
        --drop
fi

# Check if restore was successful
if [ $? -eq 0 ]; then
    echo "Database restored successfully from: $BACKUP_FILE"
else
    echo "Error: Database restore failed."
    exit 1
fi

echo
echo "=== Restore Complete ==="
echo
echo "You may need to restart the application for changes to take effect:"
echo "docker-compose restart app"
