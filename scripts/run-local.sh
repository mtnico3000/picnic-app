#!/bin/bash

# Local Development Script for Picnic App
# This script helps run the application in development mode without Docker

# Make script exit on error
set -e

echo "=== Picnic App Local Development ==="
echo

# Function to display usage
display_usage() {
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  start       Start the application in development mode"
    echo "  install     Install dependencies"
    echo "  clean       Clean node_modules and reinstall dependencies"
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
        echo "Starting application in development mode..."
        echo "Press Ctrl+C to stop."
        echo
        npm run dev
        ;;
    install)
        echo "Installing dependencies..."
        npm install
        echo "Dependencies installed."
        ;;
    clean)
        echo "Cleaning node_modules and reinstalling dependencies..."
        rm -rf node_modules
        rm -f package-lock.json
        npm install
        echo "Dependencies reinstalled."
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
