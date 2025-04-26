#!/bin/bash

# Security Audit Script for Picnic App
# This script performs a security audit of the Docker setup

# Make script exit on error
set -e

echo "=== Picnic App Security Audit ==="
echo

# Function to display usage
display_usage() {
    echo "Usage: $0 [OPTION]"
    echo
    echo "Options:"
    echo "  --docker     Audit Docker configuration"
    echo "  --npm        Audit npm packages"
    echo "  --all        Run all audits"
    echo "  --help       Display this help message"
    echo
}

# Check if no arguments provided
if [ $# -eq 0 ]; then
    display_usage
    exit 1
fi

# Parse command
COMMAND=$1

# Function to audit Docker configuration
audit_docker() {
    echo "=== Docker Configuration Audit ==="
    echo
    
    # Check if Docker Bench Security is installed
    if ! command -v docker-bench-security &> /dev/null; then
        echo "Docker Bench Security not found. Installing..."
        git clone https://github.com/docker/docker-bench-security.git
        cd docker-bench-security
        sudo sh docker-bench-security.sh
        cd ..
        rm -rf docker-bench-security
    else
        echo "Running Docker Bench Security..."
        docker-bench-security
    fi
    
    echo
    echo "=== Docker Image Vulnerability Scan ==="
    echo
    
    # Check if Trivy is installed
    if command -v trivy &> /dev/null; then
        echo "Scanning Docker images with Trivy..."
        
        # Scan the app image
        echo "Scanning picnic-app image..."
        trivy image picnic-app:latest
        
        # Scan the MongoDB image
        echo "Scanning MongoDB image..."
        trivy image mongo:6-focal
        
        # Scan the Nginx image
        echo "Scanning Nginx image..."
        trivy image nginx:stable-alpine
    else
        echo "Trivy not installed. Please install Trivy to scan Docker images."
        echo "You can use the scan-vulnerabilities.sh script to install and run Trivy."
    fi
    
    echo
    echo "=== Docker Compose Configuration Audit ==="
    echo
    
    # Check for security issues in docker-compose.yml
    echo "Checking docker-compose.yml for security issues..."
    
    # Check for exposed ports
    if grep -q "ports:" docker-compose.yml; then
        echo "WARNING: Ports are exposed in docker-compose.yml. Consider restricting access in production."
    fi
    
    # Check for privileged mode
    if grep -q "privileged: true" docker-compose.yml; then
        echo "WARNING: Containers are running in privileged mode. This is a security risk."
    fi
    
    # Check for root user
    if ! grep -q "USER node" Dockerfile; then
        echo "WARNING: Containers may be running as root. Consider adding 'USER node' to your Dockerfile."
    fi
    
    # Check for zlib version
    if ! grep -q "zlib>=1.2.12-r2" Dockerfile; then
        echo "WARNING: zlib version not specified or below 1.2.12-r2. This may contain vulnerabilities."
    fi
    
    # Check for volume mounts
    if grep -q "volumes:" docker-compose.yml; then
        echo "INFO: Volume mounts found. Ensure they have appropriate permissions."
    fi
    
    # Check for environment variables
    if grep -q "environment:" docker-compose.yml; then
        echo "INFO: Environment variables found. Ensure sensitive data is not hardcoded."
    fi
    
    echo
    echo "=== Docker Compose Production Configuration Audit ==="
    echo
    
    # Check for security issues in docker-compose.prod.yml
    echo "Checking docker-compose.prod.yml for security issues..."
    
    # Check for authentication in MongoDB
    if ! grep -q "MONGO_INITDB_ROOT_USERNAME" docker-compose.prod.yml; then
        echo "WARNING: MongoDB authentication not configured in production."
    fi
    
    # Check for SSL configuration in Nginx
    if ! grep -q "ssl_certificate" nginx/nginx.conf; then
        echo "WARNING: SSL not configured in Nginx."
    fi
    
    # Check for security headers in Nginx
    if ! grep -q "Strict-Transport-Security" nginx/nginx.conf; then
        echo "WARNING: Security headers not configured in Nginx."
    fi
    
    echo
}

# Function to audit npm packages
audit_npm() {
    echo "=== NPM Package Audit ==="
    echo
    
    # Run npm audit
    echo "Running npm audit..."
    npm audit
    
    # Run npm audit fix if there are vulnerabilities
    echo
    echo "Attempting to fix vulnerabilities..."
    npm audit fix
    
    echo
}

# Run the appropriate audit
case $COMMAND in
    --docker)
        audit_docker
        ;;
    --npm)
        audit_npm
        ;;
    --all)
        audit_docker
        audit_npm
        ;;
    --help)
        display_usage
        ;;
    *)
        echo "Unknown option: $COMMAND"
        display_usage
        exit 1
        ;;
esac

echo "=== Security Audit Complete ==="
echo
echo "Recommendations:"
echo "1. Keep all Docker images and packages updated"
echo "2. Use non-root users in containers"
echo "3. Implement proper authentication and authorization"
echo "4. Use secure communication (HTTPS)"
echo "5. Regularly scan for vulnerabilities"
echo "6. Follow the principle of least privilege"
echo "7. Implement proper logging and monitoring"
echo
echo "For more information, see the Docker security documentation:"
echo "https://docs.docker.com/engine/security/"
