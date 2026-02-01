# CyberFaith Monorepo

Turborepo monorepo for the CyberFaith platform.

## Apps

- **website** — Marketing site (Next.js 15, static export)
- **core-api** — Core API (NestJS)
- **sanctum** — Sanctum app (Next.js 15)
- **destiny-loom** — Destiny Loom app (Next.js 15)
- **spirit-arcade** — Spirit Arcade app (Next.js 15)

## Packages

- **@cyberfaith/types** — Shared TypeScript types
- **@cyberfaith/utils** — Shared utilities
- **@cyberfaith/db-utils** — Drizzle client factory and helpers
- **@cyberfaith/ui** — Shared React components
- **@cyberfaith/auth-client** — Auth context and hooks
- **@cyberfaith/config-typescript** — Shared tsconfig
- **@cyberfaith/config-eslint** — Shared ESLint config
- **@cyberfaith/config-tailwind** — Shared Tailwind preset

## Getting Started

```bash
pnpm install
pnpm build
pnpm dev
```
