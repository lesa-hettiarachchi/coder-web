# 🐳 Coder Web - EC2 Docker Setup

This project is configured for **EC2 deployment only** using Docker. All unnecessary local development files have been removed.

## 📁 **File Structure**

```
├── Dockerfile                 # Multi-stage optimized build for EC2
├── docker-compose.yml        # EC2-specific configuration (port 80)
├── nginx.conf                # Production Nginx configuration
├── scripts/
│   ├── deploy.sh            # Automated EC2 deployment script
│   └── setup.sh             # EC2 environment setup script
├── DEPLOYMENT_GUIDE.md      # Comprehensive deployment guide
└── DEPLOYMENT_SUMMARY.md    # Quick deployment reference
```

## 🚀 **Quick Deploy to EC2**

### **Step 1: Launch EC2 Instance**
- **Instance Type**: t3.medium or larger
- **OS**: Amazon Linux 2
- **Security Group**: Allow HTTP (80), HTTPS (443), SSH (22)

### **Step 2: Deploy Application**
```bash
# Connect to EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Upload project (from local machine)
scp -i your-key.pem -r . ec2-user@your-ec2-ip:/home/ec2-user/coder-web

# Deploy (on EC2)
cd /home/ec2-user/coder-web
sudo chmod +x scripts/deploy.sh
sudo ./scripts/deploy.sh
```

### **Step 3: Access Application**
- **Main App**: `http://your-ec2-public-ip`
- **Health Check**: `http://your-ec2-public-ip/api/health`

## 🔧 **Key Features**

- ✅ **EC2 Optimized**: Port 80 mapping, resource limits
- ✅ **Production Ready**: Nginx reverse proxy, security headers
- ✅ **Health Monitoring**: Built-in health checks and monitoring
- ✅ **Database Persistence**: SQLite with volume persistence
- ✅ **Automated Deployment**: One-command deployment script

## 📊 **Management Commands**

```bash
# Check status
/opt/coder-web/monitor.sh

# Update application
/opt/coder-web/update.sh

# View logs
docker-compose logs -f

# Restart
systemctl restart coder-web
```

## 📚 **Documentation**

- **`DEPLOYMENT_GUIDE.md`** - Comprehensive deployment instructions
- **`DEPLOYMENT_SUMMARY.md`** - Quick reference guide

## ⚠️ **Important Notes**

- This setup is **EC2-specific** and optimized for production
- Local development files have been removed
- All scripts assume EC2 environment
- Database is persisted in `/opt/coder-web/data/`

---

**Ready to deploy?** Run `sudo ./scripts/deploy.sh` on your EC2 instance! 🚀
