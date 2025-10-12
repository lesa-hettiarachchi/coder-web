#!/bin/bash

# EC2 Deployment Script for Coder Web
# This script deploys the application to an EC2 instance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="coder-web"
APP_DIR="/opt/coder-web"
SERVICE_USER="coder-web"
NGINX_ENABLED=${NGINX_ENABLED:-false}

echo -e "${BLUE}🚀 Starting EC2 deployment for Coder Web...${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Please run this script as root or with sudo${NC}"
    exit 1
fi

# Update system packages
echo -e "${YELLOW}📦 Updating system packages...${NC}"
yum update -y

# Install Docker
echo -e "${YELLOW}🐳 Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    yum install -y docker
    systemctl start docker
    systemctl enable docker
    usermod -a -G docker ec2-user
else
    echo -e "${GREEN}✅ Docker is already installed${NC}"
fi

# Install Docker Compose
echo -e "${YELLOW}🐳 Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
else
    echo -e "${GREEN}✅ Docker Compose is already installed${NC}"
fi

# Create application directory
echo -e "${YELLOW}📁 Setting up application directory...${NC}"
mkdir -p $APP_DIR
mkdir -p $APP_DIR/data/prisma
mkdir -p $APP_DIR/data/uploads
mkdir -p $APP_DIR/logs
mkdir -p $APP_DIR/ssl

# Create service user
if ! id "$SERVICE_USER" &>/dev/null; then
    useradd -r -s /bin/false -d $APP_DIR $SERVICE_USER
    echo -e "${GREEN}✅ Created service user: $SERVICE_USER${NC}"
fi

# Set permissions
chown -R $SERVICE_USER:$SERVICE_USER $APP_DIR
chmod -R 755 $APP_DIR

# Copy application files
echo -e "${YELLOW}📋 Copying application files...${NC}"
if [ -d "./app" ] && [ -d "./components" ] && [ -f "./package.json" ]; then
    cp -r . $APP_DIR/
    chown -R $SERVICE_USER:$SERVICE_USER $APP_DIR
    echo -e "${GREEN}✅ Application files copied${NC}"
else
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

# Create environment file
echo -e "${YELLOW}⚙️  Creating environment configuration...${NC}"
cat > $APP_DIR/.env << EOF
NODE_ENV=production
DATABASE_URL=file:./prisma/dev.db
PORT=3000
HOSTNAME=0.0.0.0
NEXT_TELEMETRY_DISABLED=1
EOF

# Create systemd service
echo -e "${YELLOW}🔧 Creating systemd service...${NC}"
cat > /etc/systemd/system/coder-web.service << EOF
[Unit]
Description=Coder Web Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0
User=$SERVICE_USER
Group=$SERVICE_USER

[Install]
WantedBy=multi-user.target
EOF

# Install Nginx if enabled
if [ "$NGINX_ENABLED" = "true" ]; then
    echo -e "${YELLOW}🌐 Installing Nginx...${NC}"
    yum install -y nginx
    
    # Configure Nginx
    cp $APP_DIR/nginx.conf /etc/nginx/nginx.conf
    
    # Enable and start Nginx
    systemctl enable nginx
    systemctl start nginx
    
    echo -e "${GREEN}✅ Nginx installed and configured${NC}"
fi

# Configure firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
if command -v firewall-cmd &> /dev/null; then
    firewall-cmd --permanent --add-port=80/tcp
    firewall-cmd --permanent --add-port=443/tcp
    firewall-cmd --reload
    echo -e "${GREEN}✅ Firewall configured${NC}"
fi

# Build and start the application
echo -e "${YELLOW}🔨 Building and starting application...${NC}"
cd $APP_DIR

# Generate Prisma client and run migrations
sudo -u $SERVICE_USER npx prisma generate
sudo -u $SERVICE_USER npx prisma migrate deploy

# Seed the database
sudo -u $SERVICE_USER npm run seed-questions

# Build Docker image
sudo -u $SERVICE_USER docker-compose build

# Enable and start the service
systemctl daemon-reload
systemctl enable coder-web
systemctl start coder-web

# Wait for application to start
echo -e "${YELLOW}⏳ Waiting for application to start...${NC}"
sleep 30

# Check if application is running
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is running successfully!${NC}"
    echo -e "${GREEN}🌐 Application URL: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)${NC}"
    echo -e "${GREEN}📊 Health check: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/api/health${NC}"
else
    echo -e "${RED}❌ Application failed to start. Checking logs...${NC}"
    journalctl -u coder-web -n 50
    exit 1
fi

# Create monitoring script
echo -e "${YELLOW}📊 Creating monitoring script...${NC}"
cat > $APP_DIR/monitor.sh << 'EOF'
#!/bin/bash
# Monitor script for Coder Web

APP_NAME="coder-web"
APP_DIR="/opt/coder-web"

echo "=== Coder Web Status ==="
echo "Service Status:"
systemctl status coder-web --no-pager

echo -e "\nDocker Containers:"
docker ps

echo -e "\nApplication Health:"
curl -s http://localhost/api/health | jq . 2>/dev/null || curl -s http://localhost/api/health

echo -e "\nDisk Usage:"
df -h $APP_DIR

echo -e "\nMemory Usage:"
free -h

echo -e "\nRecent Logs:"
journalctl -u coder-web -n 10 --no-pager
EOF

chmod +x $APP_DIR/monitor.sh

# Create update script
echo -e "${YELLOW}🔄 Creating update script...${NC}"
cat > $APP_DIR/update.sh << 'EOF'
#!/bin/bash
# Update script for Coder Web

APP_DIR="/opt/coder-web"
SERVICE_USER="coder-web"

echo "🔄 Updating Coder Web..."

cd $APP_DIR

# Pull latest changes (if using git)
# git pull origin main

# Rebuild and restart
sudo -u $SERVICE_USER docker-compose down
sudo -u $SERVICE_USER docker-compose build
sudo -u $SERVICE_USER docker-compose up -d

echo "✅ Update complete!"
EOF

chmod +x $APP_DIR/update.sh

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}📋 Useful commands:${NC}"
echo -e "  - Check status: systemctl status coder-web"
echo -e "  - View logs: journalctl -u coder-web -f"
echo -e "  - Monitor: $APP_DIR/monitor.sh"
echo -e "  - Update: $APP_DIR/update.sh"
echo -e "  - Restart: systemctl restart coder-web"
echo -e "  - Stop: systemctl stop coder-web"
