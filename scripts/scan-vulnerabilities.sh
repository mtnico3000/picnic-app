#!/bin/bash

# Docker Image Vulnerability Scanner for Picnic App
# This script scans the Docker image for vulnerabilities

# Make script exit on error
set -e

echo "=== Picnic App Docker Image Vulnerability Scanner ==="
echo

# Function to display usage
display_usage() {
    echo "Usage: $0 [IMAGE_NAME]"
    echo
    echo "If IMAGE_NAME is not provided, it will scan the local picnic-app image."
    echo
}

# Check if Trivy is installed
if ! command -v trivy &> /dev/null; then
    echo "Trivy is not installed. Installing Trivy..."
    
    # Install Trivy based on OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-get install -y wget apt-transport-https gnupg lsb-release
        wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
        echo deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main | sudo tee -a /etc/apt/sources.list.d/trivy.list
        sudo apt-get update
        sudo apt-get install -y trivy
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install aquasecurity/trivy/trivy
    else
        echo "Unsupported OS. Please install Trivy manually: https://aquasecurity.github.io/trivy/latest/getting-started/installation/"
        exit 1
    fi
    
    echo "Trivy installed successfully."
    echo
fi

# Determine image name
if [ -z "$1" ]; then
    # No image name provided, use default
    IMAGE_NAME="picnic-app:latest"
else
    # Use provided image name
    IMAGE_NAME="$1"
fi

echo "Scanning Docker image: $IMAGE_NAME"
echo

# Check if the image exists
if ! docker image inspect "$IMAGE_NAME" &> /dev/null; then
    echo "Error: Image $IMAGE_NAME not found."
    echo "Please build the image first with: docker-compose build"
    exit 1
fi

# Scan the image with Trivy
echo "Running vulnerability scan with Trivy..."
echo
trivy image "$IMAGE_NAME"

echo
echo "=== Scan Complete ==="
echo
echo "To fix vulnerabilities:"
echo "1. Update the base image in the Dockerfile to a more recent version"
echo "2. Add security updates in the Dockerfile"
echo "3. Specifically upgrade zlib to version 1.2.12-r2 or higher to fix CVE-2022-37434"
echo "4. Use a minimal base image like Alpine"
echo "5. Regularly update dependencies with npm audit fix"
echo
echo "Example Dockerfile update to fix vulnerabilities:"
echo
echo "FROM node:18-alpine"
echo "RUN apk update && apk upgrade && \\"
echo "    apk add --no-cache zlib>=1.2.12-r2 && \\"
echo "    npm install -g npm@latest && \\"
echo "    npm config set unsafe-perm true && \\"
echo "    npm audit fix"
echo
echo "# Then continue with your Dockerfile..."
