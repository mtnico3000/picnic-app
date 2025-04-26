FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Update Alpine packages and npm to fix vulnerabilities
RUN apk update && \
    apk upgrade && \
    apk add --no-cache dumb-init zlib>=1.2.12-r2 && \
    npm install -g npm@10.x

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies and fix vulnerabilities
RUN npm install && \
    npm audit fix || true

# Copy app source
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node scripts/healthcheck.js || exit 1

# Use dumb-init as entrypoint to handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Command to run the application
CMD ["npm", "start"]

# Set non-root user for better security
USER node
