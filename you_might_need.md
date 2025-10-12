# EC2 Setup Guide for Escape Room App

## **EC2 Instance Configuration**

### **1. Launch EC2 Instance**
- **Instance Type:** `t3.small` (2 vCPUs, 2 GB RAM)
- **AMI:** `Amazon Linux 2023` (free tier eligible)
- **Storage:** 30 GB gp3 (root volume)
- **Key Pair:** Create new or use existing

### **2. Security Group Rules**
```
Inbound Rules:
- SSH (22): Your IP only
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0
- Custom (3000): 0.0.0.0/0 (for Next.js dev server)

Outbound Rules:
- All traffic: 0.0.0.0/0
```

## **EC2 Setup Commands (Run After SSH)**

### **1. Update System & Install Dependencies**
```bash
# Update system
sudo yum update -y

# Install Node.js 18 (LTS)
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Git
sudo yum install -y git

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo yum install -y nginx

# Start and enable services
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### **2. Clone Your Repository**
```bash
# Clone your repo
git clone https://github.com/yourusername/coder-web.git
cd coder-web

# Install dependencies
npm install

# Install Prisma CLI
npm install -g prisma
```

### **3. Environment Setup**
```bash
# Create environment file
cp env.example .env.local

# Edit environment variables
nano .env.local
```

**Add these to `.env.local`:**
```env
# Database
DATABASE_URL="file:./dev.db"

# Next.js
NEXTAUTH_URL="http://your-ec2-public-ip"
NEXTAUTH_SECRET="your-secret-key-here"

# App
NODE_ENV="production"
```

### **4. Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed the database
npm run seed-questions
```

### **5. Build and Test**
```bash
# Build the application
npm run build

# Test the build
npm start
```

### **6. PM2 Process Management**
```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

**Add this to `ecosystem.config.js`:**
```javascript
module.exports = {
  apps: [{
    name: 'coder-web',
    script: 'npm',
    args: 'start',
    cwd: '/home/ec2-user/coder-web',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### **7. Start with PM2**
```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user
```

### **8. Nginx Configuration**
```bash
# Create Nginx config
sudo nano /etc/nginx/conf.d/coder-web.conf
```

**Add this to Nginx config:**
```nginx
server {
    listen 80;
    server_name your-ec2-public-ip;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### **9. Restart Services**
```bash
# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check PM2 status
pm2 status
pm2 logs
```

## **Quick Verification Commands**

### **Check Everything is Working:**
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Git version
git --version

# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Check if app is running
curl http://localhost:3000
```

## **Access Your App**

### **Public URL:**
```
http://your-ec2-public-ip
```

### **Check Logs:**
```bash
# PM2 logs
pm2 logs coder-web

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## **Troubleshooting Commands**

### **If Something Goes Wrong:**
```bash
# Restart PM2
pm2 restart coder-web

# Restart Nginx
sudo systemctl restart nginx

# Check port usage
sudo netstat -tlnp | grep :3000

# Check firewall
sudo iptables -L
```

## **Expected Result**

After running these commands, you should have:
- ✅ **EC2 instance running** with t3.small
- ✅ **Node.js 18** installed
- ✅ **Git** installed
- ✅ **Your app cloned** and running
- ✅ **PM2** managing the process
- ✅ **Nginx** proxying requests
- ✅ **App accessible** at `http://your-ec2-public-ip`

**Total setup time: 30-45 minutes**

---

## **4-Day Sprint Plan (3-4 hours per day)**

### **Day 1: EC2 Setup & Deployment (3-4 hours)**
- **Hour 1:** Launch t3.small instance, configure security groups
- **Hour 2:** Deploy app using your existing scripts
- **Hour 3:** Test all functionality, fix any issues
- **Hour 4:** Take screenshots, document deployment process

### **Day 2: Testing Setup (3-4 hours)**
- **Hour 1:** Playwright setup, create 2 basic tests
- **Hour 2:** Run Lighthouse audit, generate report
- **Hour 3:** Basic JMeter load test (20-30 users)
- **Hour 4:** Record videos of tests running

### **Day 3: Analysis & Reports (3-4 hours)**
- **Hour 1:** Generate all reports, analyze results
- **Hour 2:** Basic performance optimization
- **Hour 3:** Compile findings and recommendations
- **Hour 4:** Prepare video content and structure

### **Day 4: Video & Documentation (3-4 hours)**
- **Hour 1:** Record demonstration video (10-15 minutes)
- **Hour 2:** Quick feedback gathering (family/friends)
- **Hour 3:** Video editing and final touches
- **Hour 4:** Final documentation and submission

---

## **Testing Tools Setup**

### **Playwright Setup**
```bash
# Install Playwright
npm install --save-dev @playwright/test

# Install browsers
npx playwright install

# Create playwright.config.ts
npx playwright init
```

### **Lighthouse Setup**
```bash
# Install Lighthouse globally
npm install -g lighthouse

# Run audit
lighthouse http://your-ec2-public-ip --output html --output-path ./lighthouse-report.html
```

### **JMeter Setup**
1. Download Apache JMeter from https://jmeter.apache.org/
2. Create test plan with 20-30 concurrent users
3. Test your escape room endpoints
4. Generate performance report

---

## **Success Criteria**

### **Day 1 Success:**
- ✅ App running on EC2
- ✅ All features working
- ✅ Screenshots of deployment

### **Day 2 Success:**
- ✅ 2 Playwright tests passing
- ✅ Lighthouse report generated
- ✅ JMeter test completed

### **Day 3 Success:**
- ✅ All reports analyzed
- ✅ Basic optimizations implemented
- ✅ Video content prepared

### **Day 4 Success:**
- ✅ Professional video recorded
- ✅ Assignment submitted on time

---

## **Cost Estimate**

### **t3.small Instance:**
- **Hourly:** ~$0.02/hour
- **Daily:** ~$0.50/day
- **4 days:** ~$2.00
- **Monthly:** ~$15/month

### **Total Cost for Assignment:**
- **Instance:** $2.00
- **Storage:** $0.50
- **Bandwidth:** $0.25
- **Total:** ~$2.75

---

## **Emergency Commands**

### **Quick Restart Everything:**
```bash
# Restart PM2
pm2 restart all

# Restart Nginx
sudo systemctl restart nginx

# Check status
pm2 status
sudo systemctl status nginx
```

### **Quick Debug:**
```bash
# Check logs
pm2 logs coder-web --lines 50

# Check if port is open
sudo netstat -tlnp | grep :3000

# Test app locally
curl -I http://localhost:3000
```

### **Quick Deploy:**
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Rebuild
npm run build

# Restart PM2
pm2 restart coder-web
```
