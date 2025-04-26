#!/bin/bash

# Docker Cleanup Script for Picnic App
# This script helps clean up Docker resources

# Make script exit on error
set -e

echo "=== Picnic App Docker Cleanup ==="
echo

# Function to display usage
display_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  --all         Clean up all Docker resources (containers, images, volumes)"
    echo "  --containers  Stop and remove containers"
    echo "  --images      Remove unused images"
    echo "  --volumes     Remove unused volumes (WARNING: This will delete data)"
    echo "  --help        Display this help message"
    echo
    echo "Examples:"
    echo "  $0 --containers  # Stop and remove containers"
    echo "  $0 --all         # Clean up everything"
    echo
}

# Check if no arguments provided
if [ $# -eq 0 ]; then
    display_usage
    exit 1
fi

# Parse arguments
CLEAN_CONTAINERS=false
CLEAN_IMAGES=false
CLEAN_VOLUMES=false

for arg in "$@"; do
    case $arg in
        --all)
            CLEAN_CONTAINERS=true
            CLEAN_IMAGES=true
            CLEAN_VOLUMES=true
            ;;
        --containers)
            CLEAN_CONTAINERS=true
            ;;
        --images)
            CLEAN_IMAGES=true
            ;;
        --volumes)
            CLEAN_VOLUMES=true
            ;;
        --help)
            display_usage
            exit 0
            ;;
        *)
            echo "Unknown option: $arg"
            display_usage
            exit 1
            ;;
    esac
done

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running or not accessible."
    exit 1
fi

# Stop and remove containers
if [ "$CLEAN_CONTAINERS" = true ]; then
    echo "Stopping and removing containers..."
    
    # Check if docker-compose.yml exists
    if [ -f "docker-compose.yml" ]; then
        echo "Stopping containers defined in docker-compose.yml..."
        docker-compose down
    fi
    
    # Check if docker-compose.prod.yml exists
    if [ -f "docker-compose.prod.yml" ]; then
        echo "Stopping containers defined in docker-compose.prod.yml..."
        docker-compose -f docker-compose.prod.yml down
    fi
    
    echo "Containers stopped and removed."
    echo
fi

# Remove unused images
if [ "$CLEAN_IMAGES" = true ]; then
    echo "Removing unused Docker images..."
    
    # Remove dangling images (untagged images)
    echo "Removing dangling images..."
    docker image prune -f
    
    # Optionally remove all unused images
    read -p "Do you want to remove all unused images? (y/n): " remove_all_images
    if [[ $remove_all_images == "y" || $remove_all_images == "Y" ]]; then
        docker image prune -a -f
    fi
    
    echo "Unused images removed."
    echo
fi

# Remove unused volumes
if [ "$CLEAN_VOLUMES" = true ]; then
    echo "WARNING: This will remove all unused volumes, including the MongoDB data volume."
    echo "All data stored in these volumes will be permanently lost."
    read -p "Are you sure you want to continue? (y/n): " confirm
    
    if [[ $confirm == "y" || $confirm == "Y" ]]; then
        echo "Removing unused volumes..."
        docker volume prune -f
        echo "Unused volumes removed."
    else
        echo "Volume cleanup cancelled."
    fi
    echo
fi

echo "=== Cleanup Complete ==="
echo

# Display current Docker status
echo "Current Docker status:"
echo
echo "Containers:"
docker ps -a
echo
echo "Images:"
docker images
echo
echo "Volumes:"
docker volume ls
echo
