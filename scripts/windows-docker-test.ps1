# Windows Docker Test Script for Picnic App
# This PowerShell script helps test the Docker setup on Windows

# Function to display usage
function Display-Usage {
    Write-Host "Picnic App Docker Test Script for Windows" -ForegroundColor Cyan
    Write-Host
    Write-Host "Usage: .\scripts\windows-docker-test.ps1 [COMMAND]" -ForegroundColor Yellow
    Write-Host
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  dev         Build and run the development environment"
    Write-Host "  prod        Build and run the production environment"
    Write-Host "  scan        Scan the Docker image for vulnerabilities"
    Write-Host "  verify-zlib Verify the zlib fix"
    Write-Host "  stop        Stop all containers"
    Write-Host "  clean       Clean up Docker resources"
    Write-Host "  help        Display this help message"
    Write-Host
}

# Function to check if Docker is running
function Check-Docker {
    try {
        $dockerInfo = docker info 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Error: Docker is not running." -ForegroundColor Red
            Write-Host "Please start Docker Desktop and try again." -ForegroundColor Red
            exit 1
        }
    }
    catch {
        Write-Host "Error: Docker is not installed or not in PATH." -ForegroundColor Red
        Write-Host "Please install Docker Desktop for Windows: https://www.docker.com/products/docker-desktop" -ForegroundColor Red
        exit 1
    }
}

# Function to build and run the development environment
function Dev-Environment {
    Write-Host "Building and running the development environment..." -ForegroundColor Cyan
    
    # Build the Docker images
    Write-Host "Building Docker images..." -ForegroundColor Yellow
    docker-compose build
    
    # Start the containers
    Write-Host "Starting containers..." -ForegroundColor Yellow
    docker-compose up -d
    
    # Check if the containers are running
    Write-Host "Checking container status..." -ForegroundColor Yellow
    docker-compose ps
    
    Write-Host
    Write-Host "Development environment is running." -ForegroundColor Green
    Write-Host "Access the application at: http://localhost:3001" -ForegroundColor Green
    Write-Host
    Write-Host "To view logs: docker-compose logs -f" -ForegroundColor Yellow
    Write-Host "To stop the environment: .\scripts\windows-docker-test.ps1 stop" -ForegroundColor Yellow
}

# Function to build and run the production environment
function Prod-Environment {
    Write-Host "Building and running the production environment..." -ForegroundColor Cyan
    
    # Build the Docker images
    Write-Host "Building Docker images..." -ForegroundColor Yellow
    docker-compose -f docker-compose.prod.yml build
    
    # Start the containers
    Write-Host "Starting containers..." -ForegroundColor Yellow
    docker-compose -f docker-compose.prod.yml up -d
    
    # Check if the containers are running
    Write-Host "Checking container status..." -ForegroundColor Yellow
    docker-compose -f docker-compose.prod.yml ps
    
    Write-Host
    Write-Host "Production environment is running." -ForegroundColor Green
    Write-Host "Access the application at: http://localhost" -ForegroundColor Green
    Write-Host
    Write-Host "To view logs: docker-compose -f docker-compose.prod.yml logs -f" -ForegroundColor Yellow
    Write-Host "To stop the environment: .\scripts\windows-docker-test.ps1 stop" -ForegroundColor Yellow
}

# Function to scan the Docker image for vulnerabilities
function Scan-Image {
    Write-Host "Scanning Docker image for vulnerabilities..." -ForegroundColor Cyan
    
    # Check if Trivy is installed
    try {
        $trivyVersion = trivy --version 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Trivy is not installed or not in PATH." -ForegroundColor Yellow
            Write-Host "Please install Trivy: https://github.com/aquasecurity/trivy/releases" -ForegroundColor Yellow
            Write-Host
            Write-Host "Continuing with Docker scan..." -ForegroundColor Yellow
        }
        else {
            # Build the Docker image if it doesn't exist
            Write-Host "Building Docker image..." -ForegroundColor Yellow
            docker-compose build
            
            # Scan the image with Trivy
            Write-Host "Scanning image with Trivy..." -ForegroundColor Yellow
            trivy image picnic-app:latest
            
            Write-Host
            Write-Host "Scan complete." -ForegroundColor Green
            return
        }
    }
    catch {
        Write-Host "Trivy is not installed or not in PATH." -ForegroundColor Yellow
        Write-Host "Please install Trivy: https://github.com/aquasecurity/trivy/releases" -ForegroundColor Yellow
        Write-Host
        Write-Host "Continuing with Docker scan..." -ForegroundColor Yellow
    }
    
    # Use Docker scan as fallback
    Write-Host "Building Docker image..." -ForegroundColor Yellow
    docker-compose build
    
    Write-Host "Scanning image with Docker scan..." -ForegroundColor Yellow
    docker scan picnic-app:latest
    
    Write-Host
    Write-Host "Scan complete." -ForegroundColor Green
}

# Function to verify the zlib fix
function Verify-Zlib {
    Write-Host "Verifying zlib fix..." -ForegroundColor Cyan
    
    # Build the Docker image if it doesn't exist
    Write-Host "Building Docker image..." -ForegroundColor Yellow
    docker-compose build
    
    # Start the container if it's not running
    $containerRunning = docker-compose ps --services --filter "status=running" | Select-String -Pattern "app"
    if (-not $containerRunning) {
        Write-Host "Starting container..." -ForegroundColor Yellow
        docker-compose up -d app
    }
    
    # Check the zlib version in the container
    Write-Host "Checking zlib version in the container..." -ForegroundColor Yellow
    docker-compose exec app sh -c "apk info -v zlib"
    
    # Check if Trivy is installed
    try {
        $trivyVersion = trivy --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            # Scan for the specific vulnerability
            Write-Host "Scanning for zlib vulnerability (CVE-2022-37434)..." -ForegroundColor Yellow
            $scanResult = trivy image --severity HIGH --vuln-type os picnic-app:latest | Select-String -Pattern "CVE-2022-37434"
            
            if ($scanResult) {
                Write-Host "WARNING: zlib vulnerability (CVE-2022-37434) found!" -ForegroundColor Red
                Write-Host "The fix may not have been applied correctly." -ForegroundColor Red
            }
            else {
                Write-Host "SUCCESS: zlib vulnerability (CVE-2022-37434) not found." -ForegroundColor Green
                Write-Host "The fix has been applied successfully." -ForegroundColor Green
            }
        }
    }
    catch {
        Write-Host "Trivy is not installed. Cannot scan for specific vulnerability." -ForegroundColor Yellow
    }
    
    Write-Host
    Write-Host "Verification complete." -ForegroundColor Green
}

# Function to stop all containers
function Stop-Containers {
    Write-Host "Stopping all containers..." -ForegroundColor Cyan
    
    # Stop development containers
    Write-Host "Stopping development containers..." -ForegroundColor Yellow
    docker-compose down
    
    # Stop production containers
    Write-Host "Stopping production containers..." -ForegroundColor Yellow
    docker-compose -f docker-compose.prod.yml down
    
    Write-Host
    Write-Host "All containers stopped." -ForegroundColor Green
}

# Function to clean up Docker resources
function Clean-Docker {
    Write-Host "Cleaning up Docker resources..." -ForegroundColor Cyan
    
    # Stop all containers
    Stop-Containers
    
    # Remove unused images
    Write-Host "Removing unused images..." -ForegroundColor Yellow
    docker image prune -f
    
    # Remove unused volumes
    Write-Host "Do you want to remove unused volumes? This will delete data. (y/n)" -ForegroundColor Yellow
    $removeVolumes = Read-Host
    if ($removeVolumes -eq "y" -or $removeVolumes -eq "Y") {
        Write-Host "Removing unused volumes..." -ForegroundColor Yellow
        docker volume prune -f
    }
    
    Write-Host
    Write-Host "Cleanup complete." -ForegroundColor Green
}

# Main script

# Check if Docker is running
Check-Docker

# Parse command
if ($args.Count -eq 0) {
    Display-Usage
    exit 0
}

$command = $args[0]

switch ($command) {
    "dev" {
        Dev-Environment
    }
    "prod" {
        Prod-Environment
    }
    "scan" {
        Scan-Image
    }
    "verify-zlib" {
        Verify-Zlib
    }
    "stop" {
        Stop-Containers
    }
    "clean" {
        Clean-Docker
    }
    "help" {
        Display-Usage
    }
    default {
        Write-Host "Unknown command: $command" -ForegroundColor Red
        Display-Usage
        exit 1
    }
}
