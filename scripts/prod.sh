#!/bin/bash

# Production Script for Picnic App
# This script helps run the application in production mode with Docker Compose

# Make script exit on error
set -e

echo "=== Picnic App Production Environment ==="
echo

# Function to display usage
display_usage() {
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  start       Start the production environment"
    echo "  stop        Stop the production environment"
    echo "  restart     Restart the production environment"
    echo "  logs        Show logs from the containers"
    echo "  status      Show status of the containers"
    echo "  shell       Open a shell in the app container"
    echo "  mongo       Open a MongoDB shell"
    echo "  nginx       Open a shell in the Nginx container"
    echo "  rebuild     Rebuild the containers"
    echo "  backup      Backup the database"
    echo "  restore     Restore the database from a backup"
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
        echo "Starting production environment..."
        docker-compose -f docker-compose.prod.yml up -d
        echo
        echo "Production environment started."
        echo "The application is now running at: https://picnic-app.example.com"
        echo "(Make sure to update your DNS settings to point to this server)"
        echo
        echo "You can view the logs with: $0 logs"
        ;;
    stop)
        echo "Stopping production environment..."
        docker-compose -f docker-compose.prod.yml down
        echo "Production environment stopped."
        ;;
    restart)
        echo "Restarting production environment..."
        docker-compose -f docker-compose.prod.yml restart
        echo "Production environment restarted."
        echo "The application is now running at: https://picnic-app.example.com"
        ;;
    logs)
        echo "Showing logs from the containers..."
        echo "Press Ctrl+C to exit."
        echo
        docker-compose -f docker-compose.prod.yml logs -f
        ;;
    status)
        echo "Container status:"
        docker-compose -f docker-compose.prod.yml ps
        ;;
    shell)
        echo "Opening a shell in the app container..."
        docker-compose -f docker-compose.prod.yml exec app sh
        ;;
    mongo)
        echo "Opening a MongoDB shell..."
        docker-compose -f docker-compose.prod.yml exec mongo mongo
        ;;
    nginx)
        echo "Opening a shell in the Nginx container..."
        docker-compose -f docker-compose.prod.yml exec nginx sh
        ;;
    rebuild)
        echo "Rebuilding the containers..."
        docker-compose -f docker-compose.prod.yml build
        echo "Containers rebuilt."
        echo
        read -p "Do you want to start the containers now? (y/n): " start_containers
        if [[ $start_containers == "y" || $start_containers == "Y" ]]; then
            echo "Starting containers..."
            docker-compose -f docker-compose.prod.yml up -d
            echo "Containers started."
            echo "The application is now running at: https://picnic-app.example.com"
        fi
        ;;
    backup)
        echo "Creating database backup..."
        if [ -f "scripts/backup-db.sh" ]; then
            ./scripts/backup-db.sh
        else
            echo "Error: backup script not found."
            exit 1
        fi
        ;;
    restore)
        echo "Restoring database from backup..."
        if [ -f "scripts/restore-db.sh" ]; then
            ./scripts/restore-db.sh
        else
            echo "Error: restore script not found."
            exit 1
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
