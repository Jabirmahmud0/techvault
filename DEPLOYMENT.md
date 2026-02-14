# TechVault Deployment Guide — Vercel + Render + Neon

> Complete step-by-step deployment for the TechVault monorepo.

---

## Architecture

```
┌────────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Vercel        │     │   Render          │     │   Neon        │
│   (Next.js)     │────▶│   (Express API)   │────▶│   (Postgres)  │
│   apps/web      │     │   apps/api        │     │   Free tier   │
│   Free tier     │     │   Free tier       │     │               │
└────────────────┘     └──────────────────┘     └──────────────┘
                              ▲
                       ┌──────┴───────┐
                       │ Cron Pinger   │
                       │ (keeps alive) │
                       └──────────────┘
```

> ⚠️ Render's free tier **sleeps after 15 min of inactivity**. A cron pinger keeps it awake.

---

## Prerequisites

- GitHub repo pushed with latest code
- Accounts on: [Neon](https://neon.tech), [Render](https://render.com), [Vercel](https://vercel.com)

---

## Step 1: Neon Database (Already Done ✅)

Copy your `DATABASE_URL` from Neon Dashboard → Connection Details.

---

## Step 2: Deploy API on Render

### 2a. Create Web Service

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo (`techvault`)
3. Fill in settings:

| Setting | Value |
|---------|-------|
| **Name** | `techvault-api` |
| **Region** | Oregon (US West) or closest to you |
| **Root Directory** | *(leave empty)* |
| **Runtime** | Node |
| **Build Command** | `npm ci --include=dev && npx turbo run build --filter=api` |
| **Start Command** | `node apps/api/dist/index.js` |
| **Plan** | Free |

### 2b. Set environment variables

Go to **Environment** tab → add these:

| Variable | Value |
|----------|-------|
| `PORT` | `4000` |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | *(your Neon connection string)* |
| `JWT_SECRET` | *(your 64-char hex secret)* |
| `JWT_REFRESH_SECRET` | *(your 64-char hex secret)* |
| `JWT_ACCESS_EXPIRY` | `15m` |
| `JWT_REFRESH_EXPIRY` | `7d` |
| `FRONTEND_URL` | *(fill after Vercel deploy, Step 3)* |
| `GOOGLE_CLIENT_ID` | *(your Google OAuth client ID)* |
| `GOOGLE_CLIENT_SECRET` | *(your Google OAuth secret)* |
| `STRIPE_SECRET_KEY` | *(your Stripe secret key)* |
| `STRIPE_WEBHOOK_SECRET` | *(your Stripe webhook secret)* |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | *(your Gmail address)* |
| `SMTP_PASS` | *(your Gmail app password)* |
| `SMTP_FROM` | `TechVault <your@gmail.com>` |
| `CLOUDINARY_CLOUD_NAME` | *(your Cloudinary cloud name)* |
| `CLOUDINARY_API_KEY` | *(your Cloudinary API key)* |
| `CLOUDINARY_API_SECRET` | *(your Cloudinary API secret)* |

### 2c. Deploy

1. Click **Create Web Service** → Render will build & deploy
2. Your API URL will be: `https://techvault-api.onrender.com`
3. Verify: visit `https://techvault-api.onrender.com/api/health`

---

## Step 3: Deploy Frontend on Vercel

### 3a. Import project

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import your `techvault` GitHub repo

### 3b. Configure settings

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `apps/web` |
| **Build Command** | `cd ../.. && npx turbo run build --filter=web` |
| **Output Directory** | `.next` |
| **Install Command** | `cd ../.. && npm install` |

### 3c. Set environment variable

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://techvault-api.onrender.com/api` |

### 3d. Deploy

Click **Deploy** → your site will be live at `https://your-app.vercel.app`

---

## Step 4: Connect Everything

### 4a. Set FRONTEND_URL on Render

Go to Render → `techvault-api` → **Environment** → set:
```
FRONTEND_URL=https://your-app.vercel.app
```

### 4b. Update Google OAuth

Go to [Google Cloud Console](https://console.cloud.google.com/) → Credentials → your OAuth Client:
- **Authorized JavaScript origins**: add `https://your-app.vercel.app`
- **Authorized redirect URIs**: add `https://your-app.vercel.app/login`

### 4c. Update Stripe Webhook

Stripe Dashboard → Webhooks → add endpoint:
`https://techvault-api.onrender.com/api/stripe/webhook`

---

## Step 5: Set Up Cron Pinger ⏰

Render's free tier sleeps after 15 min of inactivity. Use a free cron service to ping your API.

### Option A: cron-job.org (Recommended)

1. Go to [cron-job.org](https://cron-job.org) → Create free account
2. **Create Cron Job**:
   - **Title**: `TechVault API Pinger`
   - **URL**: `https://techvault-api.onrender.com/api/health`
   - **Schedule**: Every 14 minutes (`*/14 * * * *`)
   - **Request Method**: GET
3. **Save and Enable**

### Option B: UptimeRobot

1. Go to [uptimerobot.com](https://uptimerobot.com) → Create free account
2. **Add New Monitor**:
   - **Type**: HTTP(s)
   - **URL**: `https://techvault-api.onrender.com/api/health`
   - **Interval**: 5 minutes
3. **Save**

> Both services are completely free and will ping your API regularly to prevent sleep.

---

## Step 6: Verify Everything

| Check | How |
|-------|-----|
| API Health | Visit `https://techvault-api.onrender.com/api/health` |
| Frontend | Visit `https://your-app.vercel.app` |
| Auth flow | Register → verify OTP → login |
| Products | Browse products, check images |
| Cron pinger | Check cron-job.org dashboard for successful pings |

---

## Custom Domain (Optional)

### Vercel
1. Settings → Domains → Add domain
2. Add CNAME: `cname.vercel-dns.com`
3. Update `FRONTEND_URL` on Render

### Render
1. Settings → Custom Domain → Add `api.yourdomain.com`
2. Update `NEXT_PUBLIC_API_URL` on Vercel

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS errors | `FRONTEND_URL` on Render must match Vercel URL exactly (no trailing slash) |
| API returns 500 | Check Render logs: Dashboard → your service → **Logs** |
| Slow first request | Render free tier cold start (~30s). Cron pinger prevents this |
| Build fails on Vercel | Root Directory = `apps/web`, Install Command = `cd ../.. && npm install` |
| Build fails on Render | Root Directory = empty, Build Command = `npm ci --include=dev && npx turbo run build --filter=api` |
| Google OAuth fails | Add Vercel URL to authorized origins AND redirect URIs |
| DB connection fails | `DATABASE_URL` must have `?sslmode=require` |
