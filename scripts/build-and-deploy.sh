#!/bin/bash

# Script to build Docker image, commit changes to Git, and push to remote repository
# Usage: ./scripts/build-and-deploy.sh "Your commit message"

# Exit on error
set -e

# Check if commit message is provided
if [ -z "$1" ]; then
  echo "Error: Commit message is required"
  echo "Usage: ./scripts/build-and-deploy.sh \"Your commit message\""
  exit 1
fi

COMMIT_MESSAGE="$1"

echo "=== Starting build and deploy process ==="

# Step 1: Build Docker image
echo "Building Docker image..."
docker-compose build

# Step 2: Commit changes to Git
echo "Committing changes to Git..."
git add .
git commit -m "$COMMIT_MESSAGE"

# Step 3: Push changes to remote repository
echo "Pushing changes to remote repository..."
git push

echo "=== Build and deploy process completed successfully ==="
echo "Docker image built, changes committed with message: \"$COMMIT_MESSAGE\", and pushed to remote repository."
