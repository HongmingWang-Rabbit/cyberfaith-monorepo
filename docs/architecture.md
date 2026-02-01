# Architecture

## Overview

CyberFaith is a multi-app spiritual platform built as a Turborepo monorepo. Each app is independent with its own database, while shared code (types, utilities, UI components, database helpers) lives in packages.

## System Diagram

```
┌─────────────────────────────────────────────────────────┐
│                        Apps                              │
│                                                          │
│  website (3000)   sanctum (3001)   destiny-loom (3002)  │
│  Static export    Dashboard        Guided journeys       │
│                                                          │
│  sanctuary (3003)   core-api (4000)                     │
│  Community          NestJS REST API                      │
└────────────┬────────────────────────────────────────────┘
             │ imports
┌────────────▼────────────────────────────────────────────┐
│                      Packages                            │
│                                                          │
│  types        utils        ui         auth-client        │
│  db-utils     config-ts    config-eslint  config-tw      │
└─────────────────────────────────────────────────────────┘
```

## Apps

### website
Static marketing site. Next.js 15 with `output: "export"`. No database, no auth. Pages: Home, About, Products, Contact.

### core-api
NestJS backend. Handles users, authentication, points, and achievements. Owns the main `cyberfaith` PostgreSQL database with `users`, `points`, and `achievements` tables.

### sanctum
Personal spiritual dashboard. Full-stack Next.js 15. Owns the `sanctum` database with `sanctum_profiles` table.

### destiny-loom
Guided spiritual journeys. Full-stack Next.js 15. Owns the `destiny-loom` database with `journeys` table (tracks progress 0-100, status, metadata).

### sanctuary
Community features. Full-stack Next.js 15. Owns the `sanctuary` database with `communities` and `memberships` tables.

## Database Architecture

Each app connects to its own PostgreSQL database. The `@cyberfaith/db-utils` package provides a shared Drizzle ORM client factory and column helpers (`idColumn`, `timestampColumns`) so all schemas have consistent UUID primary keys and created_at/updated_at timestamps.

```
PostgreSQL
├── cyberfaith      ← core-api (users, points, achievements)
├── sanctum         ← sanctum (sanctum_profiles)
├── destiny-loom    ← destiny-loom (journeys)
└── sanctuary       ← sanctuary (communities, memberships)
```

Drizzle config files live at each app root. Migrations are generated per-app with `drizzle-kit`.

## Package Dependency Graph

```
ui ──→ utils
auth-client ──→ types
db-utils ──→ drizzle-orm, postgres

All Next.js apps ──→ ui, utils, types, auth-client, db-utils, config-tailwind
core-api ──→ types, db-utils
website ──→ ui, utils, config-tailwind
```

## Authentication

Currently stubbed. The `@cyberfaith/auth-client` package provides:
- `AuthProvider` — React context with user/session state
- `useAuth()` — Hook returning user, login, logout, isLoading
- `authMiddleware` — Next.js middleware that protects `/dashboard`, `/settings`, `/profile` routes by checking an `auth-token` cookie

The `core-api` has `/auth/login` and `/auth/register` endpoints (not yet implemented).

## CSS & Theming

Uses Tailwind CSS v4 with CSS-based configuration (no `tailwind.config.js`). The `@cyberfaith/config-tailwind` package defines the shared theme (purple/indigo color palette, custom spacing, border radii) using `@theme` blocks. Apps import this via:

```css
@import "@cyberfaith/config-tailwind/globals.css";
@import "@cyberfaith/ui/globals.css";
```

The `@cyberfaith/ui` package provides pre-styled components (Button with variants, Card, Input, Modal) that use the `cn()` utility from `@cyberfaith/utils` for className merging.

## Build & Dev

Turborepo orchestrates all builds. The pipeline ensures packages are built before apps that depend on them. In practice, packages export raw TypeScript (not compiled JS), so Next.js apps use `transpilePackages` in `next.config.ts` to compile them at build time. The NestJS app compiles everything via `nest build`.

Dev mode runs all apps concurrently via `turbo dev` (persistent, uncached).
