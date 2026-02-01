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

## Sprint 2: Polish & Deploy (NEXT)

### Deployment
- [ ] Deploy website to Vercel
- [ ] Deploy Destiny Loom to Vercel
- [ ] Deploy Core API to Railway + Postgres
- [ ] Connect real OpenAI API key
- [ ] Configure Google OAuth for production
- [ ] Set up custom domains

### Production Hardening
- [ ] Real rate limiting (Redis-backed)
- [ ] JWT refresh token flow
- [ ] Token in httpOnly cookie (not URL param)
- [ ] Error tracking (Sentry or similar)
- [ ] Analytics (Plausible or similar)

### Features
- [ ] Save readings to database (not just localStorage)
- [ ] Reading history API (CRUD with auth)
- [ ] Points/XP system — earn points per reading
- [ ] Achievements — unlock badges (First Reading, MBTI Explorer, etc.)
- [ ] Streak tracking — daily reading streak
- [ ] Premium features stub (Stripe integration)
- [ ] Push notifications for daily readings

### Design
- [ ] Animated tarot card art (CSS illustrations)
- [ ] Custom zodiac sign illustrations
- [ ] Hexagram visual art
- [ ] Dark/light mode toggle
- [ ] Onboarding flow for new users
