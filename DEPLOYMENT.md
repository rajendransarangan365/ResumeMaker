# ATS Resume Intelligence Studio - Deployment & Operations Guide

## 1. Operating Modes Overview

The application supports three official deployment and operating topologies:
1. **Cloud Multi-Tier Production**: Next.js deployed on Vercel / Cloud Run / VPS, Express API on Node.js runtime / Docker, MongoDB Atlas managed database.
2. **Local Standalone PC Mode**: Complete offline-capable or local network execution on Windows / macOS / Linux with local MongoDB service.
3. **Android PWA & Local Pairing**: Progressive Web App installable directly from Chrome / Edge on Android with IndexedDB local caching, connecting either to cloud API or locally hosted PC server via trusted local pairing.

---

## 2. Environment Configuration

Copy `.env.example` to `.env` in both server and client environments.

### 2.1 Server Environment (`apps/api/.env`)
```ini
# Application Environment
NODE_ENV=production
API_PORT=5000
API_BASE_URL=https://api.yourdomain.com
WEB_ORIGIN=https://yourdomain.com
PUBLIC_APP_URL=https://yourdomain.com

# Database Connection
MONGODB_URI=mongodb://127.0.0.1:27017/ats_resume_studio

# Session Security & Cookie Encryption
SESSION_SECRET=generate-a-strong-64-character-cryptographic-secret
SESSION_MAX_AGE_SECONDS=604800

# Google Gemini AI Configuration
GEMINI_API_KEY=your-production-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash

# Nodemailer SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-verified-smtp-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM_NAME="ATS Resume Intelligence Studio"
SMTP_FROM_EMAIL=your-verified-smtp-email@gmail.com

# Security & OTP Policies
OTP_EXPIRY_SECONDS=300
OTP_MAX_ATTEMPTS=5
OTP_RESEND_COOLDOWN_SECONDS=60
PASSWORD_RESET_TOKEN_SECRET=another-strong-cryptographic-token-secret

# Upload & Resource Limits
UPLOAD_MAX_FILE_SIZE_MB=10
UPLOAD_TEMP_DIRECTORY=./storage/temp

# AI Governance Limits
AI_MONTHLY_BUDGET=100.00
AI_DAILY_REQUEST_LIMIT=50

LOG_LEVEL=info
```

### 2.2 Client Environment (`apps/web/.env.local`)
```ini
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_NAME="ATS Resume Intelligence Studio"
```

---

---

## 3. Deploying to Render (Zero-Cost / Free-Tier Production)

The repository includes a ready-to-use Render Blueprint specification: [`render.yaml`](file:///d:/Resume%20maker/render.yaml).

### 3.1 Option A: One-Click Deploy via Render Blueprint (Recommended)

1. Push your repository to **GitHub** or **GitLab**.
2. Log in to [Render.com](https://render.com).
3. Click **"New +"** in the top navigation -> Select **"Blueprint"**.
4. Connect your repository. Render will automatically detect [`render.yaml`](file:///d:/Resume%20maker/render.yaml).
5. Render reads the services:
   - **`ats-resume-api`** (Node.js Web Service)
   - **`ats-resume-web`** (Next.js Web Service)
   - **`ats-agent-service`** (Python ADK Agent Service - Optional)
6. Supply the required environment variable:
   - `MONGODB_URI`: Your MongoDB Atlas URI (e.g., `mongodb+srv://<user>:<password>@cluster.mongodb.net/ats_resume_studio?retryWrites=true&w=majority`).
   - `GEMINI_API_KEY`: (Optional) Your Google Gemini API key if using cloud LLM features.
7. Click **"Apply"**. Render will build and deploy your services.

---

### 3.2 Option B: Manual Service Creation in Render Dashboard

If you prefer setting up services manually without Blueprints:

#### Step 1: Deploy Backend API (`apps/api`)
1. Click **"New +"** -> **"Web Service"**.
2. Connect your Git repository.
3. Configure the service settings:
   - **Name**: `ats-resume-api`
   - **Region**: `Oregon (US West)` or your preferred region.
   - **Branch**: `main`
   - **Root Directory**: Leave blank (runs at repository root for npm workspaces).
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build:backend`
   - **Start Command**: `npm run start:api`
   - **Health Check Path**: `/api/v1/health`
4. In **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `mongodb+srv://<user>:<pass>@cluster.mongodb.net/ats_resume_studio?retryWrites=true&w=majority`
   - `SESSION_SECRET`: (Random 32+ character string)
   - `COOKIE_SECRET`: (Random 32+ character string)
   - `JWT_SECRET`: (Random 32+ character string)
   - `JWT_REFRESH_SECRET`: (Random 32+ character string)
   - `PASSWORD_RESET_TOKEN_SECRET`: (Random 32+ character string)
   - `WEB_ORIGIN`: Your frontend URL (e.g., `https://ats-resume-web.onrender.com`)
   - `CORS_ORIGIN`: Your frontend URL (e.g., `https://ats-resume-web.onrender.com`)
   - `GEMINI_API_KEY`: (Optional Gemini key)
5. Click **"Create Web Service"**. Copy your deployed API URL (e.g., `https://ats-resume-api.onrender.com`).

#### Step 2: Deploy Frontend Web App (`apps/web`)
1. Click **"New +"** -> **"Web Service"**.
2. Connect the same Git repository.
3. Configure settings:
   - **Name**: `ats-resume-web`
   - **Region**: Same region as backend.
   - **Branch**: `main`
   - **Root Directory**: Leave blank.
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build:frontend`
   - **Start Command**: `npm run start:web`
4. In **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `NEXT_PUBLIC_API_URL`: `https://ats-resume-api.onrender.com/api/v1` (replace with your Step 1 API URL)
5. Click **"Create Web Service"**.

---

### 3.3 Render Free-Tier Sleeping / Cold-Start Optimization

- Free-tier Render web services spin down after 15 minutes of inactivity.
- The health check endpoint `/api/v1/health` responds with HTTP 200 and database connectivity status.
- You can keep your free instance warm using a free pinging service (like [UptimeRobot](https://uptimerobot.com) or [Cron-Job.org](https://cron-job.org)) pointed to `https://<your-api>.onrender.com/api/v1/health` every 10 minutes.

---

## 4. Local Standalone PC Deployment

### 4.1 Prerequisites
1. **Node.js**: v18.0.0 or higher (v20+ recommended).
2. **MongoDB Community Server**: Version 4.4+ installed and running as a local service on port 27017.
3. **Git**: Installed and available in system PATH.

### 4.2 Build & Execution Steps
```bash
# 1. Clone or navigate to the workspace
cd "D:\Resume maker"

# 2. Install workspace dependencies
npm install

# 3. Build shared packages and apps
npm run build

# 4. Start the Express API backend
npm run start:api

# 5. Start the Next.js frontend (in separate terminal or background manager)
npm run start:web
```

---

## 5. Android PWA Installation & Local Pairing

### 5.1 Installing as PWA
1. Open Google Chrome on your Android mobile device.
2. Navigate to your deployed URL or PC local network address (e.g., `http://192.168.1.100:3000`).
3. Tap the browser menu (three dots) -> Tap **"Add to Home screen"** or **"Install App"**.
4. The application icon will be placed on your home screen, launching in standalone fullscreen mode.

### 5.2 Offline Operation on Android
- When network connectivity is lost, the PWA service worker serves cached UI components and templates.
- Resumes created while offline are saved to **IndexedDB**.
- AI features requiring server interaction (Gemini parsing/optimization) will display an "Offline - Connect to internet for AI features" status badge.
- Reconnecting to the network automatically synchronizes local drafts to the backend database.

---

## 6. Database Backup and Disaster Recovery

### 6.1 Performing a Database Backup
```bash
# Create timestamped dump
mongodump --uri="mongodb://127.0.0.1:27017/ats_resume_studio" --out="./backups/$(date +%Y%m%d_%H%M%S)"
```

### 6.2 Restoring from Backup
```bash
# Restore specific backup folder
mongorestore --uri="mongodb://127.0.0.1:27017/ats_resume_studio" --drop ./backups/20261025_194500/ats_resume_studio
```

---

## 7. Production Hardening Checklist
- [ ] Ensure all environment variables pass runtime Zod validation on boot.
- [ ] Enforce HTTPS termination via Nginx / Cloudflare / Render with TLS 1.3.
- [ ] Verify MongoDB authentication is enabled and not exposed to public interface 0.0.0.0.
- [ ] Confirm CORS configuration (`WEB_ORIGIN`, `CORS_ORIGIN`) allows only whitelisted frontend domains.
- [ ] Verify `NODE_ENV=production` sets cookie attributes: `Secure: true`, `SameSite: Strict` / `SameSite: Lax`.
- [ ] Validate Nodemailer SMTP transporter connection on system startup.

