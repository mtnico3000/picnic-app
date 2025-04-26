# Build and Deploy Scripts

This directory contains scripts to automate the process of building Docker images, committing changes to Git, and pushing to a remote repository.

## Windows Users (PowerShell)

Use the PowerShell script:

```powershell
.\scripts\build-and-deploy.ps1 "Your commit message"
```

## Linux/Mac Users (Bash)

Use the Bash script:

```bash
# Make the script executable (first time only)
chmod +x scripts/build-and-deploy.sh

# Run the script
./scripts/build-and-deploy.sh "Your commit message"
```

## What These Scripts Do

1. Build the Docker image using docker-compose
2. Commit all changes to Git with the provided commit message
3. Push the changes to the remote Git repository

## Requirements

- Docker and docker-compose must be installed and configured
- Git must be installed and configured
- You must have appropriate permissions to push to the remote repository

## Notes

- Always provide a meaningful commit message that describes the changes you've made
- Ensure all your changes are ready to be committed before running the script
- If you encounter any errors, the script will stop execution (due to the `set -e` flag in the bash script)
