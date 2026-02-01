# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install              # Install all dependencies
pnpm build                # Build all apps and packages (turbo)
pnpm dev                  # Start all apps in dev mode
pnpm lint                 # Lint all projects
pnpm typecheck            # Type-check all projects
pnpm test                 # Run all tests (vitest via turbo)

# Run a single package/app's tests
pnpm --filter @cyberfaith/utils test
pnpm --filter @cyberfaith/core-api test

# Run a single test file
pnpm --filter @cyberfaith/utils vitest run src/__tests__/index.test.ts
```

## Architecture

Turborepo monorepo with pnpm workspaces. Apps are independent (own databases, no cross-app imports). Shared code lives in packages.

**Apps** (under `apps/`):
- **website** — Static marketing site (Next.js 15, `output: "export"`, port 3000)
- **core-api** — Backend API (NestJS, port 4000). Modules: Health, Auth, Users, Points, Achievements
- **sanctum** — Personal dashboard (Next.js 15, port 3001)
- **destiny-loom** — Guided journeys (Next.js 15, port 3002)
- **sanctuary** — Community space (Next.js 15, port 3003)

**Packages** (under `packages/`):
- **types** — Shared TypeScript types (User, AuthTokens, ApiResponse, etc.). Type-only, no runtime code
- **utils** — `cn()` (clsx + tailwind-merge), `formatDate()`, `generateId()`
- **db-utils** — `createDbClient()`, `idColumn()`, `timestampColumns()` for Drizzle ORM
- **ui** — React component library: Button, Card, Input, Modal. Uses `cn()` from utils
- **auth-client** — AuthProvider context, useAuth hook, route middleware (currently stubbed)
- **config-typescript** — Shared tsconfigs: `base.json`, `nextjs.json`, `nestjs.json`
- **config-eslint** — Shared ESLint flat config
- **config-tailwind** — Tailwind v4 theme (CSS-based `@theme`, purple/indigo palette)

## Key Patterns

**Package exports are raw TypeScript** — Packages use `"exports": { ".": "./src/index.ts" }` and are not pre-compiled. Next.js apps must list workspace packages in `transpilePackages` in `next.config.ts`.

**Database per app** — Each app has its own PostgreSQL database and Drizzle schema (`src/db/schema.ts`). All schemas use `idColumn()` and `timestampColumns()` from `@cyberfaith/db-utils` for consistency. Drizzle config files are at the app root.

**TypeScript config chain** — Apps extend from `@cyberfaith/config-typescript/{base,nextjs,nestjs}.json`. NestJS config enables `experimentalDecorators` and `emitDecoratorMetadata`. Next.js apps use `@/*` path alias for `./src/*`.

**CSS architecture** — Tailwind CSS v4 with `@import` instead of config files. Apps import `@cyberfaith/config-tailwind/globals.css` (theme) and `@cyberfaith/ui/globals.css` (base styles) in their CSS entry point.

**Turbo pipeline** — `build`, `lint`, and `typecheck` depend on `^build` (build dependencies first). `test` depends on `^build` but is not cached. `dev` is persistent and uncached.

**Testing** — Vitest with workspace config at root. UI tests use `jsdom` environment + `@testing-library/react`. NestJS tests use `@nestjs/testing`. Each package/app has its own `vitest.config.ts`.
