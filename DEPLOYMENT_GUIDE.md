# 🚀 EC2 Deployment Guide for Coder Web

This comprehensive guide will help you deploy your Coder Web application to AWS EC2 using Docker. This setup is optimized specifically for EC2 deployment.

## 📋 Prerequisites

### AWS EC2 Instance Requirements

- **Instance Type**: t3.medium or larger (recommended: t3.large)
- **OS**: Amazon Linux 2 or Ubuntu 20.04+
- **Storage**: Minimum 20GB EBS volume
- **Security Group**: Allow HTTP (80), HTTPS (443), and SSH (22)

### Required AWS Resources

1. **EC2 Instance** with the following security group rules:
   - SSH (22) - Your IP
   - HTTP (80) - 0.0.0.0/0
   - HTTPS (443) - 0.0.0.0/0

2. **Elastic IP** (optional but recommended)

## 🚀 Quick Deployment

### Option 1: Automated Deployment (Recommended)

1. **Connect to your EC2 instance:**
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-ip
   ```

2. **Upload your project files:**
   ```bash
   # From your local machine
   scp -i your-key.pem -r . ec2-user@your-ec2-ip:/home/ec2-user/coder-web
   ```

3. **Run the deployment script:**
   ```bash
   # On EC2 instance
   cd /home/ec2-user/coder-web
   sudo chmod +x scripts/deploy.sh
   sudo ./scripts/deploy.sh
   ```

### Option 2: Manual Deployment

Follow the step-by-step manual deployment process below.

## 🔧 Manual Deployment Steps

### Step 1: Prepare EC2 Instance

```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Logout and login again to apply group changes
exit
```

### Step 2: Deploy Application

```bash
# Create application directory
sudo mkdir -p /opt/coder-web
sudo chown ec2-user:ec2-user /opt/coder-web

# Copy your project files
cp -r /path/to/your/project/* /opt/coder-web/

# Navigate to application directory
cd /opt/coder-web

# Create environment file
cat > .env << EOF
NODE_ENV=production
DATABASE_URL=file:./prisma/dev.db
PORT=3000
HOSTNAME=0.0.0.0
NEXT_TELEMETRY_DISABLED=1
EOF

# Set up database
npx prisma generate
npx prisma migrate deploy
npm run seed-questions

# Build and start with Docker Compose
docker-compose up -d
```

### Step 3: Configure Nginx (Optional but Recommended)

```bash
# Install Nginx
sudo yum install -y nginx

# Copy Nginx configuration
sudo cp nginx.conf /etc/nginx/nginx.conf

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Configure firewall
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

## 🔍 Verification

### Check Application Status

```bash
# Check if containers are running
docker ps

# Check application health
curl http://localhost/api/health

# Check logs
docker-compose logs -f
```

### Access Your Application

- **Application URL**: `http://your-ec2-public-ip`
- **Health Check**: `http://your-ec2-public-ip/api/health`

## 🛠️ Management Commands

### Service Management

```bash
# Start application
docker-compose up -d

# Stop application
docker-compose down

# Restart application
docker-compose restart

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up --build -d
```

### Database Management

```bash
# Access database shell
docker-compose exec coder-web npx prisma studio

# Run migrations
docker-compose exec coder-web npx prisma migrate deploy

# Seed database
docker-compose exec coder-web npm run seed-questions
```

### Monitoring

```bash
# Check system resources
htop

# Check disk usage
df -h

# Check application logs
journalctl -u coder-web -f

# Monitor script
/opt/coder-web/monitor.sh
```

## 🔒 Security Configuration

### Firewall Setup

```bash
# Configure iptables (if not using firewalld)
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -j DROP
```

### SSL Certificate (Optional)

```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Performance Optimization

### Resource Limits

The EC2 docker-compose configuration includes resource limits:

```yaml
deploy:
  resources:
    limits:
      memory: 1G
    reservations:
      memory: 512M
```

### Monitoring Setup

```bash
# Install monitoring tools
sudo yum install -y htop iotop nethogs

# Create monitoring cron job
echo "*/5 * * * * /opt/coder-web/monitor.sh >> /var/log/coder-web-monitor.log" | sudo crontab -
```

## 🚨 Troubleshooting

### Common Issues

1. **Port 80 already in use:**
   ```bash
   sudo netstat -tulpn | grep :80
   sudo systemctl stop httpd  # Stop Apache if running
   ```

2. **Docker permission denied:**
   ```bash
   sudo usermod -a -G docker ec2-user
   # Logout and login again
   ```

3. **Database connection issues:**
   ```bash
   # Check database file permissions
   ls -la /opt/coder-web/data/prisma/
   
# Recreate database
rm /opt/coder-web/data/prisma/dev.db
docker-compose up --build -d
   ```

4. **Application not starting:**
   ```bash
# Check logs
docker-compose logs coder-web
   
   # Check system resources
   free -h
   df -h
   ```

### Log Locations

- **Application logs**: `docker-compose -f docker-compose.ec2.yml logs`
- **System logs**: `journalctl -u docker`
- **Nginx logs**: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`

## 🔄 Updates and Maintenance

### Update Application

```bash
# Using the update script
/opt/coder-web/update.sh

# Or manually
cd /opt/coder-web
git pull origin main  # If using git
docker-compose down
docker-compose build
docker-compose up -d
```

### Backup Database

```bash
# Create backup
cp /opt/coder-web/data/prisma/dev.db /opt/coder-web/backups/dev-$(date +%Y%m%d).db

# Restore from backup
cp /opt/coder-web/backups/dev-20240101.db /opt/coder-web/data/prisma/dev.db
```

## 📈 Scaling

### Horizontal Scaling

For high traffic, consider:

1. **Application Load Balancer (ALB)**
2. **Multiple EC2 instances**
3. **RDS for database**
4. **ElastiCache for caching**

### Vertical Scaling

- Upgrade EC2 instance type
- Increase EBS volume size
- Add more memory/CPU

## 💰 Cost Optimization

### EC2 Instance Types

- **Development**: t3.micro (free tier)
- **Production**: t3.medium or t3.large
- **High Traffic**: c5.large or c5.xlarge

### Storage Optimization

- Use GP3 EBS volumes instead of GP2
- Enable EBS optimization
- Consider S3 for static assets

## 📞 Support

### Getting Help

1. Check application logs: `docker-compose -f docker-compose.ec2.yml logs`
2. Check system resources: `htop`, `df -h`
3. Verify network connectivity: `curl -I http://localhost/api/health`
4. Review this documentation

### Useful Commands Reference

```bash
# Quick status check
curl -s http://localhost/api/health | jq .

# View all containers
docker ps -a

# Clean up unused Docker resources
docker system prune -f

# Check disk space
df -h /opt/coder-web

# Monitor real-time logs
tail -f /var/log/nginx/access.log
```

---

**Your Coder Web application is now successfully deployed on EC2! 🎉**

**Application URL**: `http://your-ec2-public-ip`
**Health Check**: `http://your-ec2-public-ip/api/health`
