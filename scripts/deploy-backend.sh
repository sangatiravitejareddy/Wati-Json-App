#!/bin/bash
# Deploy backend to AWS EC2 (Free Tier)
# This script sets up the backend on a fresh Ubuntu EC2 instance.
# Run this ON the EC2 instance after SSH-ing in.

set -e

echo "🚀 Setting up backend on EC2..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.11 and pip
sudo apt install -y python3.11 python3.11-venv python3-pip nginx certbot python3-certbot-nginx

# Create app directory
sudo mkdir -p /opt/wati-backend
sudo chown $USER:$USER /opt/wati-backend

# Copy files (run from local: scp -r backend/* ec2-user@<ip>:/opt/wati-backend/)
cd /opt/wati-backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example and fill in values)
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  Edit /opt/wati-backend/.env with your actual credentials"
fi

# Create systemd service
sudo tee /etc/systemd/system/wati-backend.service > /dev/null <<EOF
[Unit]
Description=AI WATI Flow Builder Backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/wati-backend
Environment=PATH=/opt/wati-backend/venv/bin:/usr/bin
ExecStart=/opt/wati-backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable wati-backend
sudo systemctl start wati-backend

# Configure Nginx reverse proxy
sudo tee /etc/nginx/sites-available/wati-backend > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/wati-backend /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

echo "✅ Backend deployed! Service running on port 8000"
echo "📝 Next steps:"
echo "   1. Edit /opt/wati-backend/.env with your credentials"
echo "   2. Upload firebase-service-account.json to /opt/wati-backend/"
echo "   3. Update Nginx server_name with your domain"
echo "   4. Run: sudo certbot --nginx -d your-domain.com"
echo "   5. Restart: sudo systemctl restart wati-backend"
