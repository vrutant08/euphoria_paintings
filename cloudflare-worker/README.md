# Cloudflare Worker Setup Guide

This worker handles secure image uploads to your R2 bucket `euphoria-paintings`.

## Prerequisites
- Node.js installed
- Cloudflare account (you already have this)
- Wrangler CLI

---

## Step 1: Install Wrangler CLI

Open a terminal and run:

```bash
npm install -g wrangler
```

---

## Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open a browser window to authenticate with your Cloudflare account.

---

## Step 3: Navigate to Worker Directory

```bash
cd cloudflare-worker
npm install
```

---

## Step 4: Enable R2 Public Access

1. Go to **Cloudflare Dashboard** → **R2** → **euphoria-paintings** bucket
2. Click **Settings** tab
3. Under **Public access**, click **Allow Access**
4. Copy the **Public Bucket URL** (looks like `https://pub-XXXXXXXX.r2.dev`)

---

## Step 5: Set the R2 Public URL Secret

```bash
wrangler secret put R2_PUBLIC_URL
```

When prompted, paste your full public bucket URL:
```
https://pub-XXXXXXXX.r2.dev
```

---

## Step 6: Deploy the Worker

```bash
npm run deploy
```

This will output your worker URL like:
```
Published euphoria-paintings-api
https://euphoria-paintings-api.YOUR_SUBDOMAIN.workers.dev
```

**Copy this URL!**

---

## Step 7: Update Your Frontend .env

Open `.env` in the main project folder and update:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_key_here
VITE_WORKER_URL=https://euphoria-paintings-api.YOUR_SUBDOMAIN.workers.dev
VITE_R2_PUBLIC_URL=https://pub-XXXXXXXX.r2.dev
```

---

## Step 8: Test the Worker

Visit in your browser:
```
https://euphoria-paintings-api.YOUR_SUBDOMAIN.workers.dev/health
```

Should return:
```json
{"status":"ok","bucket":"euphoria-paintings"}
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/upload` | POST | Upload image (FormData with `file` and optional `folder`) |
| `/delete` | DELETE | Delete image (JSON with `filename`) |
| `/list` | GET | List all images in bucket |
| `/image/:filename` | GET | Get info about a specific image |

---

## Testing Upload Locally

You can test the worker locally before deploying:

```bash
cd cloudflare-worker
npm run dev
```

This starts a local server at `http://localhost:8787`

---

## Troubleshooting

### "R2 bucket not found"
- Make sure bucket name in `wrangler.toml` matches exactly: `euphoria-paintings`

### "CORS error"
- The worker already includes CORS headers for all origins
- If you need to restrict, update `ALLOWED_ORIGINS` in `wrangler.toml`

### "Upload failed"
- Check file is under 10MB
- Check file type is jpg, png, webp, or gif

---

## Your Keys Summary

| Key | Status |
|-----|--------|
| `SUPABASE_URL` | → Put in `.env` as `VITE_SUPABASE_URL` |
| `SUPABASE_PUBLISHABLE_KEY` | → Put in `.env` as `VITE_SUPABASE_ANON_KEY` |
| `SUPABASE_SECRET_KEY` | ❌ Not needed (keep it secret!) |
| `R2_ACCESS_KEY_ID` | ✅ Auto-handled by Wrangler |
| `R2_SECRET_ACCESS_KEY` | ✅ Auto-handled by Wrangler |
| `R2_ACCOUNT_ID` | ✅ Auto-handled by Wrangler |
| `R2_S3_ENDPOINT` | ✅ Not needed with R2 binding |
| `R2_BUCKET_NAME` | ✅ Set in `wrangler.toml` |
| `ROLL_ACCOUNT_API_TOKEN` | ❌ Not needed |
