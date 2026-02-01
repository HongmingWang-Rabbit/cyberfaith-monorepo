# CyberFaith — MVP Launch Checklist

> PM owner: Clawd | Last updated: 2026-02-01

## 🔴 P0 — Must have before any user touches it

### Environment & Secrets
- [ ] `.env` files created for all apps (from `.env.example`)
- [ ] `OPENAI_API_KEY` configured and tested (primary AI provider)
- [ ] `JWT_SECRET` set to a strong random value (not the placeholder)
- [ ] `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` configured
- [ ] `GOOGLE_CALLBACK_URL` set to production URL
- [ ] `DATABASE_URL` pointing to production Postgres
- [ ] `ALLOWED_ORIGINS` updated with real domains
- [ ] All app URLs updated (`CORE_API_URL`, `DESTINY_LOOM_URL`, etc.)

### Database
- [ ] Production Postgres provisioned (Railway or similar)
- [ ] Migrations run successfully on production DB
- [ ] Seed script runs without errors
- [ ] Connection pooling configured (if Railway, uses their proxy)

### Auth Flow (end-to-end)
- [ ] Google OAuth consent screen configured (app name, logo, scopes)
- [ ] OAuth redirect URI matches production callback URL
- [ ] Login → callback → token → redirect to app works
- [ ] Token stored correctly, user profile loads
- [ ] Logout clears state properly
- [ ] Unauthenticated users can still use features (graceful degradation)

### AI Integration (end-to-end)
- [ ] API key works — make a real call, get a real response
- [ ] All 5 features return AI analysis (MBTI, Tarot, I Ching, Four Pillars, Zodiac)
- [ ] Error handling when AI provider is down/rate-limited
- [ ] Response times acceptable (<10s for analysis)
- [ ] Token usage / cost per request estimated

### Core Functionality
- [ ] All 5 Destiny Loom features work end-to-end (input → process → result → share)
- [ ] i18n works for both EN and ZH-CN (no missing keys, no broken layouts)
- [ ] Share buttons generate correct URLs (Twitter, copy link)
- [ ] OG meta tags render correctly (test with Twitter Card Validator / FB debugger)
- [ ] Mobile responsive — all pages usable on phone
- [ ] Navigation: all links work, no 404s (including the fixed `/i-ching` route)

### Deployment
- [ ] Website builds and deploys to Vercel
- [ ] Destiny Loom builds and deploys to Vercel
- [ ] Core API builds and deploys to Railway
- [ ] Health endpoint returns `{ status: "healthy" }` on production
- [ ] CORS allows frontend domains to call API
- [ ] HTTPS enforced on all endpoints

---

## 🟡 P1 — Should have for credible MVP

### Security
- [ ] JWT tokens have reasonable expiry (not infinite)
- [ ] Rate limiting works (test: hit an endpoint 61+ times in 1 min)
- [ ] No secrets in client-side bundle (check Next.js build output)
- [ ] CSP headers set (at least basic)
- [ ] API validates all inputs (already done, verify on production)

### Error Handling
- [ ] Error boundaries catch and display user-friendly messages
- [ ] API errors return consistent format (already done, verify)
- [ ] Network failures show retry option (not white screen)
- [ ] 404 page exists and looks decent

### Performance
- [ ] Lighthouse score >80 on key pages (home, MBTI, Tarot)
- [ ] No layout shift on load (skeletons working)
- [ ] Images optimized (if any)
- [ ] Bundle size reasonable (<500KB initial JS)

### Monitoring
- [ ] Health check endpoint monitored (UptimeRobot or similar)
- [ ] Basic error logging in place (Railway logs at minimum)
- [ ] Know how to check API logs when something breaks

---

## 🟢 P2 — Nice to have for launch

- [ ] Custom domain configured (cyberfaith.app or similar)
- [ ] Favicon and app icons set
- [ ] Analytics (Plausible/Umami — privacy-friendly)
- [ ] Error tracking (Sentry)
- [ ] SEO: sitemap.xml, robots.txt
- [ ] Social preview images (OG images that aren't just text)
- [ ] Loading performance: prefetch key routes

---

## 🧪 E2E Test Plan

### Setup
- Playwright for browser automation
- Test against local dev environment (docker-compose up + all apps)
- CI-ready (can run headless in GitHub Actions)

### Critical Paths to Cover

#### Auth Flow
1. Visit home → click Sign In → redirect to Google → callback → logged in state
2. Refresh page → still logged in (token persists)
3. Click logout → logged out state → features still accessible as guest

#### MBTI Flow
1. Navigate to MBTI → answer all questions → submit
2. Result page shows personality type + AI analysis
3. Share button copies correct URL
4. Back navigation works

#### Tarot Flow
1. Navigate to Tarot → select spread type → draw cards
2. Cards flip with animation → AI interpretation loads
3. Result displays correctly for all 3 spread types

#### I Ching Flow
1. Navigate to I Ching → cast coins (3 rounds of 6 tosses)
2. Hexagram displays → AI analysis loads
3. Changing lines shown if applicable

#### Four Pillars Flow
1. Navigate to Four Pillars → enter birth date/time
2. Pillars calculated → elements displayed → AI analysis
3. Edge case: date without time still works

#### Zodiac Flow
1. Navigate to Zodiac → select sign → detail page loads
2. Daily/weekly/monthly tab switching works
3. Each tab fetches and caches reading
4. Switch signs → new data loads

#### Cross-cutting
1. Language switch EN ↔ ZH-CN — all text updates, no broken keys
2. Mobile viewport — navigation works, no overflow
3. Error state — disconnect API, verify error boundaries trigger
4. Direct URL access — deep links to result pages work

---

## 📋 Pre-Launch Smoke Test (manual, 15 min)

Quick sanity check before going live:

1. **Open home page** — loads, looks right, no console errors
2. **Click each feature** — all 5 load without errors
3. **Complete one MBTI test** — full flow, get AI result
4. **Draw tarot cards** — animations work, AI interpretation loads
5. **Sign in with Google** — works, shows profile
6. **Switch to Chinese** — everything translates
7. **Open on phone** — responsive, usable
8. **Check /api/health** — returns healthy
9. **Share a result** — link works, OG preview correct
10. **Sign out** — clean logout, can still use features
