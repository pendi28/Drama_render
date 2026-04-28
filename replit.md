# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### `drama-app` — DramaShort

Mobile-first vertical short-form drama streaming web app (ReelShort-style). Browse, discover, watch, favorite, and unlock episodes with coins.

- **Path**: `artifacts/drama-app/` (preview path: `/`)
- **Pages**: Home (hero carousel + trending + recommended), Browse (search + genre filter + grid), Drama detail, Watch (full-screen vertical player), Library (continue watching + favorites), Profile (stats + coin wallet + store).
- **Single-user demo mode** keyed by constant `DEMO_USER_ID = "demo-user"` in `artifacts/api-server/src/lib/currentUser.ts`. Demo user starts with 240 coins; auto-seeded on server startup.
- **Sample videos**: served from Google's `gtv-videos-bucket` (Big Buck Bunny etc.).

### `api-server`

Backend for `drama-app`. Routes mounted under `/api/*`:

- `routes/user.ts` — `GET /me`, `GET /coins/packs`, `POST /coins/purchase`
- `routes/dramas.ts` — `GET /dramas` (with search/genre/sort), `/dramas/featured|trending|recommended|genres`, `GET /dramas/:id` (includes episodes + favorite state)
- `routes/episodes.ts` — `GET /episodes/:id` (with prev/next + progress), `POST /episodes/:id/unlock`
- `routes/library.ts` — favorites GET/POST/DELETE, continue-watching, save-progress

DB seed runs in `start()` in `src/index.ts` via `seedIfEmpty()` — inserts demo user + 12 dramas (with 8–12 episodes each) only if dramas table is empty.

## Database

PostgreSQL via `DATABASE_URL`. Schema in `lib/db/src/schema/index.ts`:
`users`, `dramas`, `episodes`, `unlocked_episodes` (composite PK), `favorites` (composite PK), `progress` (composite PK).

Run `pnpm --filter @workspace/db run push` after schema changes. After editing schema, run `pnpm --filter @workspace/db exec tsc -b` to refresh types consumed by `api-server`.

## API Spec & Codegen

OpenAPI 3.0 spec at `lib/api-spec/openapi.yaml` is the source of truth. Orval generates:
- `@workspace/api-zod` — Zod request/response schemas (used by server for validation)
- `@workspace/api-client-react` — TanStack Query hooks (used by frontend)

**Orval gotcha**: component schemas named `XxxBody` collide with Orval's auto-generated request body type names. Fix by inlining `requestBody.content.*.schema` (don't `$ref` body schemas) and selectively re-exporting types in `lib/api-zod/src/index.ts`.

After spec edits: `pnpm --filter @workspace/api-spec run codegen`.
