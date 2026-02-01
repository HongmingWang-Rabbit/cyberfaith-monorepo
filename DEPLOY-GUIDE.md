# CyberFaith Deployment Guide

## Part 1: Railway (Core API + Postgres)

### Step 1: Create Railway Account & Project
1. Go to [railway.app](https://railway.app) → Sign up / Log in with GitHub
2. Click **"New Project"** → **"Empty Project"**
3. Name it `cyberfaith`

### Step 2: Add Postgres Database
1. In the project, click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway auto-provisions it. Click the Postgres service → **"Variables"** tab
3. Copy the `DATABASE_URL` — you'll need it in Step 4

### Step 3: Add Core API Service
1. Click **"+ New"** → **"GitHub Repo"**
2. Select `HongmingWang-Rabbit/cyberfaith-monorepo`
3. Railway will detect the Dockerfile. Click the service → **"Settings"**:
   - **Root Directory**: `apps/core-api` ❌ — Actually keep it as `/` (Dockerfile needs full monorepo context)
   - **Dockerfile Path**: `apps/core-api/Dockerfile`
   - **Port**: `4000`

### Step 4: Set Environment Variables
Click the Core API service → **"Variables"** tab → **"RAW Editor"** → paste:

```
DATABASE_URL=<paste from Step 2>
JWT_SECRET=<generate one: run `openssl rand -hex 32` in terminal>
GOOGLE_CLIENT_ID=<later, when you set up Google OAuth>
GOOGLE_CLIENT_SECRET=<later>
GOOGLE_CALLBACK_URL=https://<your-railway-domain>/auth/google/callback
ALLOWED_ORIGINS=https://cyberfaith.app,https://destiny.cyberfaith.app,http://localhost:3002
DESTINY_LOOM_URL=https://destiny.cyberfaith.app
NODE_ENV=production
PORT=4000
```

### Step 5: Deploy
1. Click **"Deploy"** — Railway builds from Dockerfile
2. Once deployed, go to **"Settings"** → **"Networking"** → **"Generate Domain"**
3. You'll get something like `cyberfaith-core-api-production.up.railway.app`
4. Test: visit `https://<your-domain>/health` — should return `{"status":"healthy"}`

### Step 6: Run Migrations
In Railway, go to the service → **"Settings"** → find **"Deploy command"** or use the Railway CLI:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run migrations (one-time)
railway run pnpm --filter @cyberfaith/core-api db:migrate

# Run seed (optional)
railway run pnpm --filter @cyberfaith/core-api db:seed
```

---

## Part 2: Vercel (Frontend Apps)

### Destiny Loom
1. Go to [vercel.com](https://vercel.com) → Import Git Repository
2. Select `HongmingWang-Rabbit/cyberfaith-monorepo`
3. **Framework**: Next.js
4. **Root Directory**: `apps/destiny-loom`
5. **Environment Variables**:
   ```
   CORE_API_URL=https://<railway-domain-from-step-5>
   OPENAI_API_KEY=<your key>
   AI_PROVIDER=openai
   AI_MODEL=gpt-4o-mini
   ```
6. Deploy

### Website (Marketing)
1. Same flow, but **Root Directory**: `apps/website`
2. No env vars needed (static site)

---

## Part 3: Custom Domains (Optional)

### If you have a domain (e.g., cyberfaith.app):

**Vercel:**
1. Project Settings → Domains → Add `cyberfaith.app` (website) and `app.cyberfaith.app` (destiny-loom)
2. Add DNS records as Vercel instructs (CNAME or A record)

**Railway:**
1. Service Settings → Networking → Custom Domain → Add `api.cyberfaith.app`
2. Add CNAME record: `api.cyberfaith.app` → `<railway-generated-domain>`

Then update:
- Railway env: `ALLOWED_ORIGINS` and `GOOGLE_CALLBACK_URL` with real domains
- Vercel env: `CORE_API_URL=https://api.cyberfaith.app`

---

## Part 4: Google OAuth (When Ready)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project → Name it "CyberFaith"
3. **APIs & Services** → **OAuth consent screen**:
   - User type: External
   - App name: CyberFaith
   - Support email: your email
   - Authorized domains: `cyberfaith.app` (or your domain)
   - Scopes: `email`, `profile`
4. **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**:
   - Type: Web application
   - Authorized redirect URIs: `https://api.cyberfaith.app/auth/google/callback`
5. Copy **Client ID** and **Client Secret**
6. Add to Railway env vars: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

---

## Checklist

- [ ] Railway account created
- [ ] Postgres provisioned
- [ ] Core API deployed + health check passes
- [ ] Migrations run
- [ ] Vercel: Destiny Loom deployed
- [ ] Vercel: Website deployed
- [ ] Custom domains configured
- [ ] Google OAuth credentials created
- [ ] All env vars updated with production URLs
- [ ] End-to-end test on production
