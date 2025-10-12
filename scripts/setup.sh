#!/bin/bash

# Quick EC2 Setup Script
# Run this script on a fresh EC2 instance to set up the environment

set -e

echo "🚀 Setting up EC2 environment for Coder Web..."

# Update system
echo "📦 Updating system packages..."
sudo yum update -y

# Install essential packages
echo "📦 Installing essential packages..."
sudo yum install -y git curl wget htop

# Install Docker
echo "🐳 Installing Docker..."
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Install Node.js (for local development)
echo "📦 Installing Node.js..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Install Nginx
echo "🌐 Installing Nginx..."
sudo yum install -y nginx

# Configure firewall
echo "🔥 Configuring firewall..."
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --reload

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/coder-web
sudo chown ec2-user:ec2-user /opt/coder-web

echo "✅ EC2 environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Upload your project files to /opt/coder-web"
echo "2. Run: sudo ./scripts/deploy.sh"
echo ""
echo "Or for manual setup:"
echo "1. cd /opt/coder-web"
echo "2. Copy your project files here"
echo "3. docker-compose up -d"
