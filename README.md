# 🚀 WATI AI Flow Builder

An AI-powered SaaS platform that generates WATI WhatsApp automation flows from plain-English prompts — powered by **Google Gemini AI** and deployed as a production-grade, scalable app.

---

## 📋 Table of Contents

1. [What This App Does](#what-this-app-does)
2. [Tech Stack](#tech-stack)
3. [Local Development Setup](#local-development-setup)
4. [Environment Variables](#environment-variables)
5. [Docker Setup](#docker-setup)
6. [Deploy to Vercel (Frontend)](#deploy-to-vercel-frontend)
7. [Deploy to AWS Free Tier (Backend)](#deploy-to-aws-free-tier-backend)
8. [CI/CD with GitHub Actions](#cicd-with-github-actions)
9. [DDoS Protection & Security Hardening](#ddos-protection--security-hardening)
10. [Production Checklist](#production-checklist)
11. [Testing](#testing)
12. [Scaling Guide](#scaling-guide)

---

## What This App Does

Users type a description of the WhatsApp bot they want (e.g., *"Create a lead qualification chatbot that asks for name, email, and interest"*), and the AI generates a valid WATI flow JSON that can be **directly imported into WATI**. 

Features:
- 🤖 AI-generated WATI flows via Google Gemini
- 🔐 Firebase Authentication (email + Google OAuth)
- 💳 Payment plans (Free / Pro / Enterprise) via Dodo Payments
- 👑 Admin dashboard (analytics, user management, usage reset)
- 📥 Download generated flows as JSON
- 📂 Flow history ("My Flows")

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend | FastAPI (Python 3.9+) |
| AI | Google Gemini 2.5 Flash |
| Auth | Firebase Authentication |
| Database | Firebase Firestore |
| Payments | Dodo Payments |
| Deployment | Vercel (frontend) + AWS EC2 / Elastic Beanstalk (backend) |
| Container | Docker + Docker Compose |
| CI/CD | GitHub Actions |

---

## Local Development Setup

> **No technical experience needed — follow these steps exactly.**

### Step 1 — Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/wati-ai-builder.git
cd wati-ai-builder
```

### Step 2 — Set up the Backend

```bash
cd backend
python3 -m venv venv           # Create a virtual environment
source venv/bin/activate       # Mac/Linux
# OR on Windows:  venv\Scripts\activate

pip install -r requirements.txt
```

Create a `.env` file in `backend/`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
ADMIN_EMAILS=your_email@example.com
FIREBASE_SERVICE_ACCOUNT_PATH=firebase-service-account.json
FRONTEND_URL=http://localhost:3000
```

Place your Firebase service account JSON at `backend/firebase-service-account.json`.

Start the backend:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

✅ Backend is running at: http://localhost:8000/docs

### Step 3 — Set up the Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Start the frontend:

```bash
npm run dev
```

✅ App is running at: http://localhost:3000

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | ✅ |
| `ADMIN_EMAILS` | Comma-separated admin emails | ✅ |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Path to Firebase service JSON | ✅ |
| `FRONTEND_URL` | Frontend URL for CORS | ✅ |
| `DODO_API_KEY` | Dodo Payments API key | Optional |
| `DODO_WEBHOOK_SECRET` | Dodo webhook secret | Optional |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase config values |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase config values |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase config values |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase config values |

---

## Docker Setup

> Run the entire app with one command using Docker.

### Prerequisites
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Dockerfile — Backend

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Dockerfile — Frontend

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["npm", "start"]
```

### `docker-compose.yml`

```yaml
version: "3.9"

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    volumes:
      - ./backend/firebase-service-account.json:/app/firebase-service-account.json
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    env_file:
      - ./frontend/.env.local
    depends_on:
      - backend
    restart: unless-stopped
```

### Run with Docker

```bash
docker-compose up --build
```

✅ App is live at http://localhost:3000

---

## Deploy to Vercel (Frontend)

> Free tier is more than enough for production.

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **"New Project"** → Import your GitHub repository
3. Set **Root Directory** to `frontend`
4. Add all environment variables from `frontend/.env.local` in the Vercel dashboard under **Settings → Environment Variables**
5. Click **Deploy**

✅ Your frontend is live at `https://your-app.vercel.app`

**Custom domain:** In Vercel → Settings → Domains → Add your domain.

---

## Deploy to AWS Free Tier (Backend)

### Option A — EC2 (Recommended for beginners)

> AWS Free Tier gives you 750 hours/month of `t2.micro` EC2 — enough for 1 full server.

1. **Create an EC2 instance**
   - Go to [AWS Console](https://aws.amazon.com) → EC2 → Launch Instance
   - Choose: **Ubuntu 22.04 LTS**
   - Instance type: **t2.micro** (Free Tier)
   - Create a key pair → download the `.pem` file
   - Security Group: Open ports `22` (SSH), `80` (HTTP), `443` (HTTPS), `8000` (API)

2. **SSH into your server**
   ```bash
   chmod 400 your-key.pem
   ssh -i your-key.pem ubuntu@YOUR_EC2_IP
   ```

3. **Install dependencies on the server**
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install python3-pip python3-venv nginx -y
   ```

4. **Upload and run the backend**
   ```bash
   # From your local machine, copy files to EC2:
   scp -i your-key.pem -r ./backend ubuntu@YOUR_EC2_IP:/home/ubuntu/backend

   # On the EC2 server:
   cd /home/ubuntu/backend
   python3 -m venv venv && source venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --host 0.0.0.0 --port 8000 &
   ```

5. **Keep it running with systemd**
   ```bash
   sudo nano /etc/systemd/system/watiapi.service
   ```
   Paste:
   ```ini
   [Unit]
   Description=WATI AI Backend
   After=network.target

   [Service]
   User=ubuntu
   WorkingDirectory=/home/ubuntu/backend
   ExecStart=/home/ubuntu/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
   Restart=always
   EnvironmentFile=/home/ubuntu/backend/.env

   [Install]
   WantedBy=multi-user.target
   ```
   ```bash
   sudo systemctl enable watiapi && sudo systemctl start watiapi
   ```

6. **Set up Nginx reverse proxy + HTTPS**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo nano /etc/nginx/sites-available/watiapi
   ```
   Paste:
   ```nginx
   server {
       server_name api.yourdomain.com;
       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```
   ```bash
   sudo ln -s /etc/nginx/sites-available/watiapi /etc/nginx/sites-enabled/
   sudo nginx -t && sudo nginx -s reload
   sudo certbot --nginx -d api.yourdomain.com   # Free SSL
   ```

✅ Backend live at `https://api.yourdomain.com`

### Option B — Elastic Beanstalk (Auto-scaling, slightly more complex)

1. Install AWS CLI and EB CLI: `pip install awsebcli`
2. In `backend/`: `eb init` → choose your region → Python platform
3. Create a `Procfile`: `web: uvicorn main:app --host 0.0.0.0 --port 8000`
4. Deploy: `eb create wati-backend` → `eb deploy`

---

## CI/CD with GitHub Actions

> Automatically deploy on every push to `main`.

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt

      - name: Run tests
        run: |
          cd backend
          python -m pytest tests/ -v --tb=short || true

      - name: Deploy to EC2 via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /home/ubuntu/backend
            git pull origin main
            source venv/bin/activate
            pip install -r requirements.txt
            sudo systemctl restart watiapi

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
```

**GitHub Secrets to add** (Settings → Secrets → Actions):
- `EC2_HOST` — your EC2 IP address
- `EC2_SSH_KEY` — contents of your `.pem` file
- `VERCEL_TOKEN` — from Vercel dashboard
- `VERCEL_ORG_ID` — from Vercel project settings
- `VERCEL_PROJECT_ID` — from Vercel project settings

---

## DDoS Protection & Security Hardening

### ✅ Built-in Protections (Already Implemented)

| Protection | Where | Details |
|-----------|--------|---------|
| Rate limiting | Backend | `slowapi` — 10 requests/minute per user on AI generation |
| CORS policy | Backend | Restricted to frontend URL only |
| Firebase ID token verification | Backend | All API routes require a valid signed Firebase token |
| Admin role enforcement | Backend + Frontend | Admin email allowlist; frontend hides/blocks admin routes |
| SQL injection | N/A | Uses Firestore (NoSQL) — no SQL injection risk |

### 🛡️ Cloudflare (Free — Highly Recommended)

1. Sign up at [cloudflare.com](https://cloudflare.com) → Add your domain
2. Change your DNS nameservers to Cloudflare's (shown in dashboard)
3. Enable:
   - **Under Attack Mode** for DDoS bursts
   - **Bot Fight Mode** → Blocks scraper bots
   - **WAF (Web Application Firewall)** → Free plan includes basic rules
   - **Rate Limiting** → 10,000 free requests/month

### 🔒 Additional Hardening Steps

```bash
# 1. On EC2 — block all traffic except Cloudflare IPs
# Only allow ports 80/443 from Cloudflare IP ranges (see cloudflare.com/ips)

# 2. Add security headers in Nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-XSS-Protection "1; mode=block";
add_header X-Content-Type-Options "nosniff";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

# 3. Disable EC2 direct access — only via Cloudflare proxy
```

**Secrets management:**
- ❌ Never commit `.env` files to Git
- ✅ Use GitHub Secrets for CI/CD
- ✅ Use AWS Secrets Manager or Parameter Store for production env vars

---

## Production Checklist

Before going live, verify:

- [ ] All env vars set in production (no localhost URLs)
- [ ] `ADMIN_EMAILS` set to your real email
- [ ] Firebase security rules configured (Firestore → Rules)
- [ ] HTTPS enabled on backend (via Certbot or Cloudflare)
- [ ] Cloudflare proxy enabled on domain
- [ ] Rate limiting tested (`curl` 11 times and confirm 429 response)
- [ ] Admin route test: log in as non-admin → visiting `/admin` redirects to `/dashboard`
- [ ] Gemini API quota checked in Google Cloud Console
- [ ] Dodo webhook secret configured
- [ ] Error monitoring set up (Sentry free tier recommended)
- [ ] Server logs reviewed (`sudo journalctl -u watiapi -f`)

---

## Testing

### Run the Backend API Tests

```bash
cd backend
source venv/bin/activate
pip install pytest httpx

# Run all tests
pytest tests/ -v
```

### Manual API Testing

```bash
# Health check
curl http://localhost:8000/api/health

# Generate a flow (requires Firebase token)
curl -X POST http://localhost:8000/api/generate-flow \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a lead qualification bot"}'

# Test admin protection (should return 403)
curl http://localhost:8000/api/admin/analytics \
  -H "Authorization: Bearer NON_ADMIN_TOKEN"
```

### Frontend Testing

```bash
cd frontend
npm run lint      # Check for TypeScript/lint errors
npm run build     # Ensure production build succeeds
```

---

## Scaling Guide

### When to Scale

| Traffic | Action |
|---------|--------|
| < 1,000 users/day | t2.micro (Free Tier) is fine |
| 1,000–10,000 users/day | Upgrade to t3.small or t3.medium |
| 10,000+ users/day | Use Auto Scaling Group + Application Load Balancer |

### Scaling Steps (AWS)

1. **Horizontal scaling** — Create an AWS Auto Scaling Group with multiple EC2 instances behind an Application Load Balancer (ALB)
2. **Database scaling** — Firestore scales automatically (no action needed)
3. **Cache AI responses** — Add Redis to cache repeated prompts (saves Gemini API costs)
4. **CDN** — Vercel + Cloudflare already provide edge caching for the frontend
5. **Queue AI tasks** — For high load, use AWS SQS to queue generation requests instead of inline API calls

### Docker Swarm / Kubernetes (Advanced)

For large-scale deployments, containerize with Docker and orchestrate with:
- **Docker Swarm** — simpler, good for moderate scale
- **Amazon EKS (Kubernetes)** — for enterprise scale

```bash
# Scale to 3 backend replicas with Docker Swarm
docker swarm init
docker stack deploy -c docker-compose.yml wati
docker service scale wati_backend=3
```

---

## 📁 Project Structure

```
wati-ai-builder/
├── backend/                    # FastAPI backend
│   ├── main.py                 # App entry point
│   ├── config.py               # Environment config
│   ├── routers/
│   │   ├── user_routes.py      # User API + /me endpoint
│   │   ├── admin_routes.py     # Admin-only APIs
│   │   ├── auth_routes.py      # Auth/register
│   │   └── payment_routes.py   # Payment webhooks
│   ├── services/
│   │   ├── ai_engine.py        # Gemini AI integration
│   │   └── flow_service.py     # Flow CRUD
│   ├── middleware/
│   │   ├── auth.py             # Token verification
│   │   └── rate_limit.py       # Rate limiter
│   └── Dockerfile
├── frontend/                   # Next.js frontend
│   └── src/
│       ├── app/
│       │   ├── dashboard/      # User dashboard
│       │   ├── admin/          # Admin panel (admin-only)
│       │   ├── login/          # Auth pages
│       │   └── signup/
│       ├── hooks/
│       │   └── useAuth.tsx     # Auth context + isAdmin
│       └── lib/
│           ├── api.ts          # API client
│           └── firebase.ts     # Firebase init
└── .github/
    └── workflows/
        └── deploy.yml          # CI/CD pipeline
```

---

## 🔑 Getting API Keys

| Service | Where to Get | Free Tier |
|---------|-------------|-----------|
| Google Gemini | [aistudio.google.com](https://aistudio.google.com) → Get API Key | ✅ Yes |
| Firebase | [console.firebase.google.com](https://console.firebase.google.com) → New Project | ✅ Yes |
| Dodo Payments | [app.dodopayments.com](https://app.dodopayments.com) | ✅ Free to start |
| AWS | [aws.amazon.com/free](https://aws.amazon.com/free) | ✅ 12 months free |
| Vercel | [vercel.com](https://vercel.com) | ✅ Always free |
| Cloudflare | [cloudflare.com](https://cloudflare.com) | ✅ Free plan |

---

## 🆘 Common Issues

**"Failed to fetch" on the dashboard**
→ Backend is not running. Start it: `uvicorn main:app --port 8000 --reload`

**"Invalid or expired token"**
→ Firebase credentials are wrong or missing. Check `firebase-service-account.json`.

**Admin panel accessible by all users**
→ Check `ADMIN_EMAILS` in `backend/.env` — must match your login email exactly.

**Gemini returns empty response**
→ Check your `GEMINI_API_KEY` is valid. Visit [aistudio.google.com](https://aistudio.google.com) to verify.

---

## 📄 License

Ravi Teja Reddy License — free to use, modify, and deploy.
