# PowerShell script to build Docker image, commit changes to Git, and push to remote repository
# Usage: .\scripts\build-and-deploy.ps1 "Your commit message"

param(
    [Parameter(Mandatory=$true)]
    [string]$CommitMessage
)

Write-Host "=== Starting build and deploy process ===" -ForegroundColor Green

# Step 1: Build Docker image
Write-Host "Building Docker image..." -ForegroundColor Cyan
docker-compose build

# Step 2: Commit changes to Git
Write-Host "Committing changes to Git..." -ForegroundColor Cyan
git add .
git commit -m "$CommitMessage"

# Step 3: Push changes to remote repository
Write-Host "Pushing changes to remote repository..." -ForegroundColor Cyan
git push

Write-Host "=== Build and deploy process completed successfully ===" -ForegroundColor Green
Write-Host "Docker image built, changes committed with message: '$CommitMessage', and pushed to remote repository." -ForegroundColor Green
