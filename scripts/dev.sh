#!/bin/bash

# Development Script for Picnic App
# This script helps run the application in development mode with Docker Compose

# Make script exit on error
set -e

echo "=== Picnic App Development Environment ==="
echo

# Function to display usage
display_usage() {
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  start       Start the development environment"
    echo "  stop        Stop the development environment"
    echo "  restart     Restart the development environment"
    echo "  logs        Show logs from the containers"
    echo "  status      Show status of the containers"
    echo "  shell       Open a shell in the app container"
    echo "  mongo       Open a MongoDB shell"
    echo "  rebuild     Rebuild the containers"
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
        echo "Starting development environment..."
        docker-compose up -d
        echo
        echo "Development environment started."
        echo "The application is now running at: http://localhost:3001"
        echo
        echo "You can view the logs with: $0 logs"
        ;;
    stop)
        echo "Stopping development environment..."
        docker-compose down
        echo "Development environment stopped."
        ;;
    restart)
        echo "Restarting development environment..."
        docker-compose restart
        echo "Development environment restarted."
        echo "The application is now running at: http://localhost:3001"
        ;;
    logs)
        echo "Showing logs from the containers..."
        echo "Press Ctrl+C to exit."
        echo
        docker-compose logs -f
        ;;
    status)
        echo "Container status:"
        docker-compose ps
        ;;
    shell)
        echo "Opening a shell in the app container..."
        docker-compose exec app sh
        ;;
    mongo)
        echo "Opening a MongoDB shell..."
        docker-compose exec mongo mongo
        ;;
    rebuild)
        echo "Rebuilding the containers..."
        docker-compose build
        echo "Containers rebuilt."
        echo
        read -p "Do you want to start the containers now? (y/n): " start_containers
        if [[ $start_containers == "y" || $start_containers == "Y" ]]; then
            echo "Starting containers..."
            docker-compose up -d
            echo "Containers started."
            echo "The application is now running at: http://localhost:3001"
        fi
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
