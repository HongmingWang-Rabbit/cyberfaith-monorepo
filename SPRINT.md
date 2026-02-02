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
- [x] Friend system — add friends, view their public readings
- [x] Community feed — infinite scroll public reading stream
- [x] Emoji reactions on shared readings (👍❤️🔮✨🌟)

### Monetization
- [x] Stripe subscription integration (free/pro tiers)
- [x] Premium reading types (detailed reports)
- [x] Premium AI models for paying users (tiered model selection)
- [x] Usage limits for free tier (TierLimitGuard)

### Spirit Arcade (v1)
- [x] Game framework scaffolding (lobby + arcade API)
- [x] Karma Slots — spiritual slot machine with neon animations
- [x] Points integration with arcade (spend/win XP)
- [x] 木鱼 (Wooden Fish) — tap meditation tool with merit counter

### Platform
- [x] PWA support (installable, offline shell)
- [x] Email notifications (weekly digest, welcome, streak reminders)
- [x] Admin dashboard (user stats, moderation, role management)
- [x] API versioning (v1 prefix)
- [x] SEO & performance optimization (meta, JSON-LD, sitemap, dynamic imports)
- [x] Input validation & sanitization (class-validator DTOs)
- [x] E2E test infrastructure (supertest, auth helpers, 6 test suites)
- [x] CI/CD pipeline (GitHub Actions: typecheck → test → build → deploy)
- [x] Daily horoscope feature + web push notifications
- [x] Production deployment: Railway (core-api) + Vercel (destiny-loom) + Neon (Postgres)
- [x] Stripe webhook integration

---

## Sprint 4: Retention & Content (NEXT)

### Engagement
- [ ] Compatibility matching — compare two users' readings (zodiac, MBTI)
- [ ] Daily challenges — "Draw a tarot card for a stranger" with karma reward
- [ ] Reading journal — personal notes on past readings, mood tracking
- [ ] Seasonal events — Chinese New Year, Mercury retrograde, eclipses

### Content Depth
- [ ] Zodiac compatibility matrix (all 144 pairings with AI analysis)
- [ ] Birth chart visualization (SVG wheel with planets/houses)
- [ ] Palmistry module — camera-based palm reading with AI
- [ ] Dream interpretation — text input → AI symbolic analysis

### Spirit Arcade (v2)
- [ ] Fortune Cookie — crack open for daily wisdom
- [ ] Destiny Wheel — spin-to-win daily reward
- [ ] Meditation Timer — ambient sounds, breathing guide, streak tracking

### Platform
- [ ] User settings page (notification prefs, language, theme, privacy)
- [ ] Report/flag system for community content
- [ ] Rate limiting dashboard (admin view of abuse patterns)
- [ ] Database backup cron job (Neon snapshots)

---

## Sprint 5: Polish, Analytics & Monetization

### User Experience
- [ ] User settings page — notification prefs, language, theme toggle, privacy controls, delete account
- [ ] Onboarding wizard v2 — pick zodiac sign, MBTI type, interests on first login
- [ ] Animated page transitions (framer-motion route transitions)
- [ ] Loading states & skeleton screens for all data-fetching pages

### Analytics & Insights
- [ ] Personal insights dashboard — reading patterns, most-used features, mood trends from journal
- [ ] Birth chart SVG visualization (planets, houses, aspects)
- [ ] Weekly recap email — your readings, streaks, compatibility highlights

### Monetization
- [ ] Stripe pricing page with tier comparison (free/pro/premium)
- [ ] Premium reading unlock flow (paywall → checkout → reveal)
- [ ] Referral system — invite friends, earn karma + free premium days
- [ ] Gift readings — buy and send a reading to a friend

### Content & Engagement
- [x] Seasonal events system — event banner, limited-time readings, special arcade rewards
- [x] Daily challenges — "Draw a tarot card for a stranger" with karma reward
- [x] Achievement showcase on profile — badge wall, share achievements
- [x] Palmistry module — upload palm photo, AI analysis

---

## Sprint 6: Scale & Delight

### Social & Viral
- [ ] Social sharing cards — dynamic OG images with reading results (Vercel OG)
- [ ] Leaderboard page — weekly/monthly/all-time karma rankings with avatars
- [ ] User profiles — public profile pages with reading stats, achievements, zodiac
- [ ] Activity feed — follow friends, see their readings/achievements in real-time

### Content
- [ ] Numerology module — life path number, expression number, soul urge from name+birthdate
- [ ] Feng Shui tips — room layout advice based on birth element + compass direction
- [ ] Daily affirmations — personalized based on zodiac + mood journal trends

### Platform Hardening
- [ ] Error boundary improvements — graceful fallbacks on every page
- [ ] Offline mode — cache recent readings, queue actions for sync
- [ ] Performance audit — lighthouse scores, bundle analysis, image optimization
- [ ] API response caching (Redis or in-memory) for expensive AI calls
