# Agents

## Cursor Cloud specific instructions

### Overview

Rupture is a Vite + React + TypeScript SPA (discovery engine for interactive AI tools). Backend is Supabase (auth, Postgres, RLS). Deployment target is Vercel. See `README.md` for full docs.

### Running locally

- `npm run dev` starts the Vite dev server on **port 3000**.
- Without Supabase env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), the app gracefully falls back to static demo data from `src/lib/static-data.ts`. Auth flows (login/register) and write operations (likes, saves, comments) require a live Supabase project.
- `npm run build` runs `tsc -b && vite build` — use this to verify TypeScript compilation and production build.

### Key caveats

- **No lint script**: `package.json` does not define a `lint` script. TypeScript strict-mode checking via `tsc -b` (part of `npm run build`) is the primary static analysis.
- **No test framework**: There are no automated tests or test runner configured in this repo.
- **Feed page in fallback mode**: The `/feed` page renders metadata panels but the full-screen app cards area may appear empty without Supabase data.
- **Vercel API routes** (`/api/*`) are serverless functions that only run on Vercel or via `vercel dev`; they do not run under `npm run dev`.
- **Package manager**: npm (lockfile is `package-lock.json`).
