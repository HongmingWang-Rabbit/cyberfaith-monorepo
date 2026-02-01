# CyberFaith — Sprint 1: Destiny Loom Foundation

## Vision
All-in-one spiritual app for Gen Z. Casual, fun, "let's just try it" vibe. Cyberpunk aesthetic.

## App Structure (Updated)
- **Website** — Marketing landing page
- **Core API** — Shared backend (NestJS): auth, AI, users, points
- **Destiny Loom** — Personality Tests & Spiritual Guidance (PRIORITY)
- **Spirit Arcade** (was Sanctuary) — Spiritual-themed gaming platform (later)
- **Sanctum** — Community platform: forums, chat, social (later)

## Sprint 1 Goals

### Foundation (must-have)
- [ ] Rename Sanctuary → Spirit Arcade in codebase
- [ ] Cyberpunk design system (dark theme, neon purples, glow effects)
- [ ] i18n framework (EN + ZH-CN)
- [ ] Google OAuth social login (core-api + auth-client)
- [ ] AI provider abstraction (OpenAI default, swappable)
- [ ] Destiny Loom layout: nav, responsive shell, cyberpunk styling

### First Feature: MBTI Personality Test
- [ ] Question flow UI (animated, one-at-a-time)
- [ ] MBTI scoring logic
- [ ] AI-powered personality analysis (OpenAI)
- [ ] Result page with type card + detailed breakdown
- [ ] Share result (OG image / link)
- [ ] Save to profile history

### Infrastructure
- [ ] PostgreSQL via Railway (or local Docker for dev)
- [ ] Drizzle migrations for core-api + destiny-loom
- [ ] Health check endpoints working

## Tech Decisions
- **AI**: OpenAI default, abstracted via provider interface for easy swap
- **Auth**: Google OAuth only (social login)
- **i18n**: next-intl or similar, EN + ZH-CN
- **Payments**: Stripe stubbed for later
- **Deploy**: Vercel (frontends) + Railway (core-api + Postgres)
- **Design**: Cyberpunk dark — deep purple/indigo base, neon accents, glow effects, playful animations

## Agent Structure
- **PM** (me): Planning, coordination, code review loops
- **Backend Agent**: Core API — auth, AI provider, DB, migrations
- **Frontend Agent**: Destiny Loom — UI, design system, i18n, MBTI flow
