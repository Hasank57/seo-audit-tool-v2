# SEO Audit Tool - Deployment Guide

## Quick Deploy to Railway (Recommended - Easiest)

### Step 1: Get API Keys
Before deploying, you need these free API keys:

1. **Google PageSpeed Insights API** → https://developers.google.com/speed/docs/insights/v5/get-started
2. **Gemini API** → https://ai.google.dev/
3. **Bing Webmaster API** (optional) → https://www.bing.com/webmasters/help/webmaster-api-3af9a44c

### Step 2: Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Navigate to project
cd /mnt/okcomputer/output/app

# Initialize Railway project
railway init

# Deploy
railway up
```

### Step 3: Add Environment Variables

In Railway dashboard:
1. Go to your project → Variables
2. Add these variables:
   - `PAGESPEED_API_KEY` = your_pagespeed_key
   - `GEMINI_API_KEY` = your_gemini_key
   - `BING_API_KEY` = your_bing_key (optional)

3. Redeploy: `railway up`

### Step 4: Test Your API

Your API will be at: `https://your-app-name.up.railway.app`

Test: `https://your-app-name.up.railway.app/api/health`

---

## Deploy to Render

### Step 1: Create Render Account
Go to https://render.com and sign up

### Step 2: Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repo (or use "Deploy from Git URL")
3. Use these settings:
   - **Name**: seo-audit-tool
   - **Runtime**: Python 3
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

### Step 3: Add Environment Variables
In Render dashboard:
1. Go to Environment → Add Environment Variable
2. Add:
   - `PAGESPEED_API_KEY`
   - `GEMINI_API_KEY`
   - `BING_API_KEY` (optional)

### Step 4: Deploy
Click "Create Web Service"

---

## Deploy Frontend Separately (Optional)

If you want the frontend on a different domain:

### Update Frontend API URL

Edit `src/services/api.ts`:
```typescript
const API_BASE_URL = 'https://your-backend-url.up.railway.app'; // Your backend URL
```

Then deploy frontend to Vercel/Netlify:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

---

## API Endpoints

Once deployed, your API will have these endpoints:

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check |
| `POST /api/seo/analyze` | SEO Health analysis |
| `POST /api/search/analyze` | Search visibility |
| `POST /api/geo/analyze` | GEO analysis |
| `POST /api/traffic/estimate` | Traffic estimation |
| `POST /api/report/generate` | PDF report |

---

## Testing with cURL

```bash
# Test SEO Health
curl -X POST https://your-app.up.railway.app/api/seo/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "strategy": "mobile"}'

# Test GEO
curl -X POST https://your-app.up.railway.app/api/geo/analyze \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com", "keywords": ["seo tools"]}'
```

---

## Troubleshooting

### "Failed to fetch" error
- Check if backend is running: `/api/health`
- Verify CORS origins are set correctly

### API rate limits
- PageSpeed: 100 queries per 100 seconds (free tier)
- Gemini: 60 requests per minute (free tier)

### Slow responses
- PageSpeed API can take 10-30 seconds
- This is normal - it actually analyzes the website

---

## Free Tier Limits

| Service | Free Tier |
|---------|-----------|
| Railway | $5 credit/month (~500 hours) |
| Render | 750 hours/month |
| PageSpeed API | 100 queries/100 sec |
| Gemini API | 60 requests/min |

---

## Need Help?

1. Check Railway logs: `railway logs`
2. Test API directly with curl/Postman
3. Verify environment variables are set
