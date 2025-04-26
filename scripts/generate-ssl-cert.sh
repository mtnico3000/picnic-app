#!/bin/bash

# SSL Certificate Generation Script for Picnic App
# This script generates self-signed SSL certificates for development

# Make script exit on error
set -e

echo "=== Picnic App SSL Certificate Generator ==="
echo

# Configuration
SSL_DIR="./nginx/ssl"
DOMAIN=${1:-"picnic-app.local"}
DAYS=${2:-"365"}

# Create SSL directory if it doesn't exist
mkdir -p $SSL_DIR
echo "SSL directory: $SSL_DIR"
echo

# Check if OpenSSL is installed
if ! command -v openssl &> /dev/null; then
    echo "Error: OpenSSL is not installed. Please install OpenSSL first."
    echo "Visit https://www.openssl.org/ for installation instructions."
    exit 1
fi

echo "Generating self-signed SSL certificate for domain: $DOMAIN"
echo "Certificate will be valid for $DAYS days"
echo

# Generate private key
echo "Generating private key..."
openssl genrsa -out "$SSL_DIR/picnic-app.key" 2048
echo "Private key generated: $SSL_DIR/picnic-app.key"
echo

# Generate certificate signing request
echo "Generating certificate signing request..."
openssl req -new -key "$SSL_DIR/picnic-app.key" -out "$SSL_DIR/picnic-app.csr" -subj "/CN=$DOMAIN/O=Picnic App/C=US"
echo "Certificate signing request generated: $SSL_DIR/picnic-app.csr"
echo

# Generate self-signed certificate
echo "Generating self-signed certificate..."
openssl x509 -req -days $DAYS -in "$SSL_DIR/picnic-app.csr" -signkey "$SSL_DIR/picnic-app.key" -out "$SSL_DIR/picnic-app.crt"
echo "Self-signed certificate generated: $SSL_DIR/picnic-app.crt"
echo

# Create a combined PEM file (some applications need this)
echo "Creating combined PEM file..."
cat "$SSL_DIR/picnic-app.key" "$SSL_DIR/picnic-app.crt" > "$SSL_DIR/picnic-app.pem"
echo "Combined PEM file generated: $SSL_DIR/picnic-app.pem"
echo

# Set appropriate permissions
echo "Setting appropriate permissions..."
chmod 600 "$SSL_DIR/picnic-app.key"
chmod 600 "$SSL_DIR/picnic-app.pem"
chmod 644 "$SSL_DIR/picnic-app.crt"
chmod 644 "$SSL_DIR/picnic-app.csr"
echo "Permissions set."
echo

echo "=== Certificate Generation Complete ==="
echo
echo "Self-signed SSL certificate has been generated for $DOMAIN"
echo "Certificate files:"
echo "- Private key: $SSL_DIR/picnic-app.key"
echo "- Certificate: $SSL_DIR/picnic-app.crt"
echo "- Combined PEM: $SSL_DIR/picnic-app.pem"
echo "- CSR: $SSL_DIR/picnic-app.csr"
echo
echo "IMPORTANT: This is a self-signed certificate for development purposes only."
echo "For production, use a certificate from a trusted certificate authority."
echo
echo "To use this certificate with Nginx:"
echo "1. Make sure the following lines are in your nginx.conf:"
echo "   ssl_certificate $SSL_DIR/picnic-app.crt;"
echo "   ssl_certificate_key $SSL_DIR/picnic-app.key;"
echo
echo "2. For local development, add the following entry to your hosts file:"
echo "   127.0.0.1 $DOMAIN"
echo
echo "3. Restart Nginx to apply the changes."
