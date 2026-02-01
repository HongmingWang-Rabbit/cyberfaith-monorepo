# CyberFaith — Sprint Tracker

## Vision
All-in-one spiritual app for Gen Z. Casual, fun, "let's just try it" vibe. Cyberpunk aesthetic.

## App Structure
- **Website** — Cyberpunk marketing landing page
- **Core API** — Shared NestJS backend: auth, AI, users, points
- **Destiny Loom** — Personality Tests & Spiritual Guidance (PRIORITY)
- **Spirit Arcade** (was Sanctuary) — Spiritual-themed gaming (later)
- **Sanctum** — Community platform (later)

---

## Sprint 1: Foundation ✅ COMPLETE

### Foundation
- [x] Rename Sanctuary → Spirit Arcade
- [x] Cyberpunk design system (dark theme, neon purples, glow effects)
- [x] i18n framework (EN + ZH-CN via next-intl)
- [x] Google OAuth social login (core-api + auth-client)
- [x] AI provider abstraction (OpenAI + Anthropic + Google, swappable)
- [x] Destiny Loom layout: sidebar nav, responsive shell, animated background

### All 5 Destiny Loom Features
- [x] MBTI — question flow, scoring, AI analysis, result page, sharing
- [x] Tarot — 78-card deck, 3 spread types, flip animations, AI interpretation
- [x] Zodiac — 12 signs grid, detail pages, daily/weekly/monthly readings
- [x] Four Pillars (八字) — birth input, stem/branch calculation, element analysis
- [x] I Ching (易经) — 3-coin hexagram casting, 64 hexagrams, changing lines

### Infrastructure
- [x] Docker Compose for local Postgres
- [x] Drizzle ORM schemas + migrations
- [x] Health check endpoints (enhanced: uptime, DB status, memory)
- [x] Deployment configs (Vercel + Railway)

### Quality
- [x] 136+ tests across monorepo
- [x] API input validation + sanitization
- [x] API documentation (API.md)
- [x] Error boundaries, loading skeletons, SEO meta
- [x] Result sharing (OG tags, Twitter/X, WeChat, copy link)
- [x] Profile + history page (localStorage)
- [x] Auth UI connected end-to-end
- [x] All AI features wired to API routes
- [x] NestJS middleware (logging, CORS, rate limiting)
- [x] DB seed script
- [x] 8 code review passes — all issues fixed

### Commits: 25+

---

## Sprint 2: Polish & Backend ✅ COMPLETE

### Deployment
- [x] Deploy website to Vercel
- [x] Deploy Destiny Loom to Vercel
- [x] Deploy Core API to Railway + Postgres
- [x] Connect real OpenAI API key
- [x] Configure Google OAuth for production
- [x] Set up custom domains

### Production Hardening
- [x] Real rate limiting (Redis-backed)
- [x] JWT refresh token flow
- [x] Token in httpOnly cookie (not URL param)
- [x] Error tracking (Sentry or similar)
- [x] Analytics (Plausible or similar)

### Features
- [x] Save readings to database (not just localStorage)
- [x] Reading history API (CRUD with auth)
- [x] Points/XP system — earn points per reading
- [x] Achievements — unlock badges (First Reading, MBTI Explorer, etc.)
- [x] Streak tracking — daily reading streak
- [x] Premium features stub (Stripe integration)
- [x] Push notifications for daily readings

### Design
- [x] Animated tarot card art (CSS illustrations)
- [x] Custom zodiac sign illustrations
- [x] Hexagram visual art
- [x] Dark/light mode toggle
- [x] Onboarding flow for new users

### Code Quality
- [x] Remove dead `/api/history` mock route
- [x] Fix `any` types in core-api controllers/services
- [x] Leaderboard privacy — display names instead of UUIDs

---

## Sprint 3: Growth & Community (NEXT)

### Social Features
- [x] Share readings to social media (deep links + OG meta)
- [ ] Friend system — add friends, view their public readings
- [ ] Community feed — opt-in public reading stream
- [ ] Comments/reactions on shared readings

### Monetization
- [x] Stripe subscription integration (free/pro tiers)
- [ ] Premium reading types (detailed reports)
- [ ] Premium AI models for paying users
- [x] Usage limits for free tier (TierLimitGuard)

### Spirit Arcade (v1)
- [ ] Game framework scaffolding
- [ ] First mini-game prototype
- [ ] Points integration with arcade

### Platform
- [x] PWA support (installable, offline shell)
- [ ] Email notifications (weekly digest)
- [ ] Admin dashboard (user stats, moderation)
- [ ] API versioning (v1 prefix)
