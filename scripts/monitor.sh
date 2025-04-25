#!/bin/bash

# Docker Container Monitoring Script for Picnic App
# This script monitors the Docker containers and provides status information

# Configuration
REFRESH_INTERVAL=5 # seconds

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to clear screen
clear_screen() {
    clear
}

# Function to display header
display_header() {
    echo -e "${BLUE}=== Picnic App Container Monitor ===${NC}"
    echo -e "${BLUE}Press Ctrl+C to exit${NC}"
    echo
    echo -e "Time: $(date '+%Y-%m-%d %H:%M:%S')"
    echo -e "Refresh interval: ${REFRESH_INTERVAL} seconds"
    echo
}

# Function to display container status
display_container_status() {
    echo -e "${BLUE}Container Status:${NC}"
    docker-compose ps
    echo
}

# Function to display container resource usage
display_resource_usage() {
    echo -e "${BLUE}Container Resource Usage:${NC}"
    docker stats --no-stream
    echo
}

# Function to display container logs
display_logs() {
    echo -e "${BLUE}Recent Logs:${NC}"
    echo -e "${YELLOW}App Logs:${NC}"
    docker-compose logs --tail=5 app
    echo
    echo -e "${YELLOW}MongoDB Logs:${NC}"
    docker-compose logs --tail=5 mongo
    echo
}

# Function to display health status
display_health_status() {
    echo -e "${BLUE}Health Status:${NC}"
    
    # Check app container
    if docker-compose ps | grep -q "app.*Up"; then
        APP_STATUS="${GREEN}Running${NC}"
    else
        APP_STATUS="${RED}Stopped${NC}"
    fi
    
    # Check mongo container
    if docker-compose ps | grep -q "mongo.*Up"; then
        MONGO_STATUS="${GREEN}Running${NC}"
    else
        MONGO_STATUS="${RED}Stopped${NC}"
    fi
    
    # Check nginx container if using production setup
    if docker-compose -f docker-compose.prod.yml ps 2>/dev/null | grep -q "nginx.*Up"; then
        NGINX_STATUS="${GREEN}Running${NC}"
    else
        NGINX_STATUS="${YELLOW}Not Running${NC} (normal for development)"
    fi
    
    echo -e "App Service: $APP_STATUS"
    echo -e "MongoDB Service: $MONGO_STATUS"
    echo -e "Nginx Service: $NGINX_STATUS"
    echo
}

# Main monitoring loop
monitor() {
    while true; do
        clear_screen
        display_header
        display_health_status
        display_container_status
        display_resource_usage
        display_logs
        
        echo -e "${BLUE}Refreshing in ${REFRESH_INTERVAL} seconds...${NC}"
        sleep $REFRESH_INTERVAL
    done
}

# Handle Ctrl+C gracefully
trap 'echo -e "\n${BLUE}Exiting monitor...${NC}"; exit 0' INT

# Start monitoring
monitor
