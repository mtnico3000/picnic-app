# Testing Docker Setup on Windows

This guide provides step-by-step instructions for testing the Picnic App Docker setup on a Windows machine.

## Prerequisites

1. **Install Docker Desktop for Windows**
   - Download Docker Desktop from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
   - Follow the installation instructions
   - Ensure Docker is running (check for the Docker icon in the system tray)
   - Docker Desktop includes both Docker Engine and Docker Compose

2. **Enable WSL 2 (Windows Subsystem for Linux)**
   - Docker Desktop for Windows uses WSL 2 for better performance
   - Open PowerShell as Administrator and run:
     ```powershell
     dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
     dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
     ```
   - Restart your computer
   - Download and install the WSL 2 Linux kernel update package from [Microsoft](https://docs.microsoft.com/en-us/windows/wsl/install-manual#step-4---download-the-linux-kernel-update-package)
   - Set WSL 2 as the default version:
     ```powershell
     wsl --set-default-version 2
     ```

## Testing Steps

### 1. PowerShell Script for Easy Testing

We've created a PowerShell script to simplify testing the Docker setup on Windows:

```powershell
# Display help
.\scripts\windows-docker-test.ps1 help

# Build and run the development environment
.\scripts\windows-docker-test.ps1 dev

# Build and run the production environment
.\scripts\windows-docker-test.ps1 prod

# Scan the Docker image for vulnerabilities
.\scripts\windows-docker-test.ps1 scan

# Verify the zlib fix
.\scripts\windows-docker-test.ps1 verify-zlib

# Stop all containers
.\scripts\windows-docker-test.ps1 stop

# Clean up Docker resources
.\scripts\windows-docker-test.ps1 clean
```

This script provides a simple interface for testing the Docker setup on Windows. It handles checking if Docker is running, building and running the containers, scanning for vulnerabilities, and verifying the zlib fix.

### 2. Clone the Repository

1. Open Command Prompt or PowerShell
2. Navigate to the directory where you want to clone the repository
3. Clone the repository:
   ```cmd
   git clone <repository-url>
   cd picnic-app
   ```

### 2. Build and Run the Development Environment

1. Open Command Prompt or PowerShell in the project directory
2. Build the Docker images:
   ```cmd
   docker-compose build
   ```
3. Start the containers:
   ```cmd
   docker-compose up -d
   ```
4. Check if the containers are running:
   ```cmd
   docker-compose ps
   ```
5. Access the application at [http://localhost:3001](http://localhost:3001)
6. View the logs:
   ```cmd
   docker-compose logs -f
   ```

### 3. Test the Production Environment

1. Build the production Docker images:
   ```cmd
   docker-compose -f docker-compose.prod.yml build
   ```
2. Start the production containers:
   ```cmd
   docker-compose -f docker-compose.prod.yml up -d
   ```
3. Check if the production containers are running:
   ```cmd
   docker-compose -f docker-compose.prod.yml ps
   ```
4. Access the application at [http://localhost](http://localhost) (or [https://localhost](https://localhost) if SSL is configured)

### 4. Scan for Vulnerabilities

1. Install Trivy (Windows):
   - Download the latest release from [GitHub](https://github.com/aquasecurity/trivy/releases)
   - Extract the ZIP file
   - Add the extracted directory to your PATH environment variable
   - Verify installation:
     ```cmd
     trivy --version
     ```

2. Run the vulnerability scan:
   ```cmd
   docker-compose build
   docker images
   ```
   Note the image ID or name of the picnic-app image, then:
   ```cmd
   trivy image picnic-app:latest
   ```

3. Alternatively, use the provided script (requires Git Bash or WSL):
   ```bash
   bash scripts/scan-vulnerabilities.sh
   ```

### 5. Run Security Audit

1. Run the security audit script (requires Git Bash or WSL):
   ```bash
   bash scripts/security-audit.sh --docker
   ```

### 6. Using the Helper Scripts on Windows

Most of the helper scripts are written in Bash and require a Bash shell to run. On Windows, you have several options:

1. **Git Bash**:
   - Install Git for Windows which includes Git Bash
   - Run the scripts using Git Bash:
     ```bash
     ./scripts/dev.sh start
     ```

2. **WSL (Windows Subsystem for Linux)**:
   - Open a WSL terminal
   - Navigate to the project directory
   - Run the scripts:
     ```bash
     ./scripts/dev.sh start
     ```

3. **Docker Exec**:
   - Execute commands directly in the running containers:
     ```cmd
     docker-compose exec app sh -c "node scripts/healthcheck.js"
     ```

### 7. Stopping the Containers

1. Stop the development containers:
   ```cmd
   docker-compose down
   ```

2. Stop the production containers:
   ```cmd
   docker-compose -f docker-compose.prod.yml down
   ```

## Troubleshooting

### Docker Desktop Issues

1. **Docker Desktop not starting**:
   - Check if Hyper-V is enabled
   - Verify WSL 2 is properly installed
   - Restart your computer

2. **Port conflicts**:
   - If ports 80, 443, or 3001 are already in use, modify the port mappings in the docker-compose files

### Container Issues

1. **Containers not starting**:
   - Check the logs:
     ```cmd
     docker-compose logs
     ```

2. **Application not accessible**:
   - Verify the containers are running:
     ```cmd
     docker-compose ps
     ```
   - Check if the ports are correctly mapped:
     ```cmd
     docker-compose port app 3001
     ```

3. **MongoDB connection issues**:
   - Check the MongoDB container logs:
     ```cmd
     docker-compose logs mongo
     ```

### Windows-Specific Issues

1. **Path issues**:
   - Windows uses backslashes (`\`) for paths, but Docker expects forward slashes (`/`)
   - Always use forward slashes in Docker-related configurations

2. **Line ending issues**:
   - Windows uses CRLF line endings, but Linux uses LF
   - Configure Git to handle line endings properly:
     ```cmd
     git config --global core.autocrlf input
     ```

3. **Permission issues**:
   - Windows and Linux have different permission models
   - If you encounter permission issues, try running Docker commands as Administrator

## Verifying the zlib Fix

To verify that the zlib vulnerability has been fixed:

1. Build the Docker image:
   ```cmd
   docker-compose build
   ```

2. Run a vulnerability scan:
   ```cmd
   trivy image picnic-app:latest
   ```

3. Check if the zlib vulnerability (CVE-2022-37434) is listed in the scan results
   - If the vulnerability is not listed, the fix was successful
   - If the vulnerability is still listed, check the Dockerfile to ensure the zlib upgrade was properly applied

4. Alternatively, you can check the installed zlib version inside the container:
   ```cmd
   docker-compose up -d
   docker-compose exec app sh -c "apk info -v zlib"
   ```
   - Verify that the installed version is 1.2.12-r2 or higher
