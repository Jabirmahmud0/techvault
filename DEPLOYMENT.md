# TechVault Deployment Guide — Vercel + Railway + Neon

> Complete step-by-step deployment for the TechVault monorepo.

---

## Architecture Overview

```
┌────────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Vercel        │     │   Railway         │     │   Neon        │
│   (Next.js)     │────▶│   (Express API)   │────▶│   (Postgres)  │
│   apps/web      │     │   apps/api        │     │   Free tier   │
│   Free tier     │     │   $5/mo credit    │     │               │
└────────────────┘     └──────────────────┘     └──────────────┘
```

---

## Prerequisites

- GitHub repo pushed with latest code
- Accounts on: [Neon](https://neon.tech), [Railway](https://railway.app), [Vercel](https://vercel.com)

---

## Step 1: Neon Database (Already Done ✅)

You already have Neon set up. Just copy your `DATABASE_URL`:

```
postgresql://neondb_owner:****@ep-calm-darkness-a1ddlwe4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

> **Tip**: Go to Neon Dashboard → your project → Connection Details → copy the connection string.

---

## Step 2: Deploy API on Railway

### 2a. Create project

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select your `techvault` repository
3. Railway will detect it as a monorepo

### 2b. Configure service settings

1. Click on the deployed service → **Settings**
2. Set **Root Directory** to: `apps/api`
3. Railway will auto-detect the `railway.json` config, which sets:
   - Build: `cd ../.. && npx turbo run build --filter=api`
   - Start: `node dist/index.js`
   - Health check: `/api/health`

### 2c. Set environment variables

Go to **Variables** tab and add ALL of these:

| Variable | Value |
|----------|-------|
| `PORT` | `4000` |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | *(your Neon connection string)* |
| `JWT_SECRET` | *(your 64-char hex secret)* |
| `JWT_REFRESH_SECRET` | *(your 64-char hex secret)* |
| `JWT_ACCESS_EXPIRY` | `15m` |
| `JWT_REFRESH_EXPIRY` | `7d` |
| `FRONTEND_URL` | *(leave blank for now, fill after Vercel deploy)* |
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

> **Optional**: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RESEND_API_KEY`

### 2d. Deploy

1. Click **Deploy** — Railway will build using Nixpacks
2. Wait for the build to complete and the health check to pass
3. Go to **Settings** → **Networking** → **Generate Domain**
4. Copy your Railway public URL, e.g.: `https://techvault-api-production.up.railway.app`

### 2e. Update FRONTEND_URL

After Vercel deploy (Step 3), come back and set:
```
FRONTEND_URL=https://your-app.vercel.app
```

---

## Step 3: Deploy Frontend on Vercel

### 3a. Import project

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import your `techvault` GitHub repo
3. Vercel will detect the monorepo

### 3b. Configure project settings

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `apps/web` |
| **Build Command** | `cd ../.. && npx turbo run build --filter=web` |
| **Output Directory** | `.next` |
| **Install Command** | `cd ../.. && npm install` |

### 3c. Set environment variables

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://techvault-api-production.up.railway.app/api` |

> ⚠️ **IMPORTANT**: Replace with your actual Railway URL from Step 2d. This is the URL your frontend will use to call the API.

### 3d. Deploy

1. Click **Deploy**
2. Wait for the build to complete
3. Your site will be live at `https://your-app.vercel.app`

---

## Step 4: Connect Everything

### 4a. Update Railway FRONTEND_URL

Go back to Railway → your API service → **Variables**:
```
FRONTEND_URL=https://your-app.vercel.app
```

This is needed for CORS (the API allows requests from this origin).

### 4b. Update Google OAuth

Go to [Google Cloud Console](https://console.cloud.google.com/) → your project → **Credentials** → your OAuth 2.0 Client:

1. Add to **Authorized JavaScript origins**:
   - `https://your-app.vercel.app`
2. Add to **Authorized redirect URIs**:
   - `https://your-app.vercel.app/login`

### 4c. Update Stripe Webhook

Go to [Stripe Dashboard](https://dashboard.stripe.com/) → **Developers** → **Webhooks**:

1. Add endpoint: `https://techvault-api-production.up.railway.app/api/stripe/webhook`
2. Select events: `checkout.session.completed`, `payment_intent.succeeded`
3. Copy the new webhook signing secret → update `STRIPE_WEBHOOK_SECRET` in Railway

---

## Step 5: Verify Deployment

### Quick checks

1. **API Health**: Visit `https://your-railway-url.up.railway.app/api/health`
   - Should return `{ "status": "ok" }`

2. **Frontend**: Visit `https://your-app.vercel.app`
   - Homepage should load with products

3. **Auth flow**: Try registering → verify OTP → login

4. **Products**: Browse products, check images load from Cloudinary

---

## Custom Domain (Optional)

### Vercel
1. Go to **Settings** → **Domains** → Add your domain
2. Update DNS: Add CNAME record pointing to `cname.vercel-dns.com`
3. Update `FRONTEND_URL` on Railway to your custom domain

### Railway
1. Go to **Settings** → **Networking** → **Custom Domain**
2. Add your API subdomain (e.g., `api.yourdomain.com`)
3. Update `NEXT_PUBLIC_API_URL` on Vercel to `https://api.yourdomain.com/api`

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS errors | Check `FRONTEND_URL` on Railway matches your Vercel URL exactly (no trailing slash) |
| API returns 500 | Check Railway logs: **Deployments** → click latest → **View Logs** |
| Build fails on Vercel | Make sure **Root Directory** is `apps/web` and **Install Command** is `cd ../.. && npm install` |
| Build fails on Railway | Check that `railway.json` is in `apps/api/` with the correct build command |
| Images not loading | Check `next.config.js` allows the image domains |
| Google OAuth fails | Make sure Vercel URL is in authorized origins AND redirect URIs |
| DB connection fails | Make sure `DATABASE_URL` has `?sslmode=require` |
