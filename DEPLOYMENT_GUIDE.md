# VelvetRoom - Self-Hosting Guide

## 📥 Getting Your Code

### Option 1: Save to GitHub (Recommended)
1. Click the "Save to GitHub" button in the chat
2. Your complete codebase will be pushed to a new GitHub repository
3. Clone it to your server:
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### Option 2: VS Code View
1. Click the VS Code icon to browse all files
2. Download the entire project structure

---

## 🖥️ System Requirements

### Minimum Server Specs:
- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **RAM**: 2GB minimum (4GB recommended)
- **CPU**: 2 cores
- **Storage**: 20GB
- **Node.js**: v18+ or v20+
- **Python**: 3.11+
- **MongoDB**: 5.0+

---

## 🚀 Installation Steps

### 1. Install Dependencies

#### Ubuntu/Debian:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python 3.11
sudo apt install -y python3.11 python3.11-venv python3-pip

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install FFmpeg (for video watermarking)
sudo apt install -y ffmpeg

# Install Yarn
npm install -g yarn
```

### 2. Setup Application

```bash
# Navigate to project directory
cd velvetroom

# Backend Setup
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Frontend Setup
cd frontend
yarn install
cd ..
```

### 3. Configure Environment Variables

#### Backend (.env):
```bash
cd backend
nano .env
```

Add the following:
```env
# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017
DB_NAME=velvetroom_production

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGINS=https://yourdomain.com,http://localhost:3000

# Backend URL (your server's public URL)
BACKEND_URL=https://api.yourdomain.com
```

#### Frontend (.env):
```bash
cd ../frontend
nano .env
```

Add:
```env
# Backend API URL (your server's public URL with /api)
REACT_APP_BACKEND_URL=https://api.yourdomain.com
```

### 4. Build Frontend for Production

```bash
cd frontend
yarn build
```

This creates an optimized production build in `/frontend/build/`

---

## 🏃 Running the Application

### Development Mode (Testing)

#### Terminal 1 - Backend:
```bash
cd backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

#### Terminal 2 - Frontend:
```bash
cd frontend
yarn start
```

Access: `http://localhost:3000`

---

## 🌐 Production Deployment

### Option 1: Using PM2 (Process Manager)

#### Install PM2:
```bash
npm install -g pm2
```

#### Create ecosystem.config.js:
```javascript
module.exports = {
  apps: [
    {
      name: 'velvetroom-backend',
      script: 'venv/bin/uvicorn',
      args: 'server:app --host 0.0.0.0 --port 8001',
      cwd: './backend',
      env: {
        PYTHONUNBUFFERED: '1'
      }
    }
  ]
};
```

#### Start Backend:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Serve Frontend with Nginx:
```bash
sudo apt install nginx
```

Create Nginx config:
```bash
sudo nano /etc/nginx/sites-available/velvetroom
```

Add:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /path/to/velvetroom/frontend/build;
        try_files $uri /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files (uploads)
    location /uploads {
        proxy_pass http://localhost:8001/uploads;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/velvetroom /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 2: Using Docker

#### Create Dockerfile (Backend):
```dockerfile
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y ffmpeg

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

#### Create Dockerfile (Frontend):
```dockerfile
FROM node:20-alpine as build

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install

COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

#### docker-compose.yml:
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  backend:
    build: ./backend
    ports:
      - "8001:8001"
    environment:
      - MONGO_URL=mongodb://mongodb:27017
      - DB_NAME=velvetroom_production
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb
    volumes:
      - ./backend/uploads:/app/uploads

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

#### Run with Docker:
```bash
docker-compose up -d
```

---

## 🔒 SSL Certificate (HTTPS)

### Using Let's Encrypt (Free):
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Auto-renewal:
```bash
sudo certbot renew --dry-run
```

---

## 📊 Monitoring & Logs

### Backend Logs:
```bash
pm2 logs velvetroom-backend
```

### Nginx Logs:
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### MongoDB Logs:
```bash
sudo tail -f /var/log/mongodb/mongod.log
```

---

## 🔧 Maintenance

### Update Application:
```bash
# Pull latest changes
git pull origin main

# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
pm2 restart velvetroom-backend

# Frontend
cd ../frontend
yarn install
yarn build
sudo systemctl reload nginx
```

### Backup Database:
```bash
mongodump --db velvetroom_production --out /backup/mongodb/$(date +%Y%m%d)
```

### Restore Database:
```bash
mongorestore --db velvetroom_production /backup/mongodb/20240101/velvetroom_production
```

---

## 🌍 Cloud Deployment Options

### AWS:
- **EC2** for server
- **RDS** or **MongoDB Atlas** for database
- **S3** for media storage
- **CloudFront** for CDN

### DigitalOcean:
- **Droplet** (2GB RAM minimum)
- **Managed MongoDB**
- **Spaces** for media storage

### Vercel + Railway:
- **Vercel** for frontend
- **Railway** for backend + MongoDB

### Heroku:
- Easy deployment with Git push
- MongoDB add-on available

---

## 🐛 Troubleshooting

### Backend won't start:
```bash
# Check Python version
python3 --version

# Check if port is in use
sudo netstat -tulpn | grep 8001

# Check MongoDB is running
sudo systemctl status mongod
```

### Frontend build errors:
```bash
# Clear cache
rm -rf node_modules yarn.lock
yarn install
```

### Database connection issues:
```bash
# Check MongoDB status
mongo --eval "db.adminCommand('ping')"
```

---

## 📞 Support

For deployment issues:
- Check logs first
- Verify all environment variables
- Ensure MongoDB is running
- Check firewall rules (ports 80, 443, 8001, 27017)

---

## 🎯 Quick Start Commands

```bash
# Full deployment script
git clone https://github.com/your-username/velvetroom.git
cd velvetroom

# Setup backend
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup frontend
cd ../frontend
yarn install
yarn build

# Start with PM2
cd ..
pm2 start ecosystem.config.js
sudo systemctl restart nginx
```

Your VelvetRoom platform is now live! 🚀
