# Rupture

Rupture is a discovery engine for interactive web apps.

The current implementation in this repository is a:

- Vite + React + TypeScript frontend
- Supabase-backed authentication and data layer
- Vercel-ready SPA deployment target

## Locked launch niche

**AI tools for builders and creators**

This is intentionally constrained to prevent feed decay and low-quality inventory.

## What is implemented

### Product surfaces
- landing page
- feed with full-screen cards
- stabilized app mode via sandboxed iframe
- create-post flow
- profile page
- app detail page
- login and register flows
- internal runtime demos

### Supabase backend model
- profiles
- apps
- app likes
- app saves
- app comments
- app reports
- public read views
- RLS policies
- secure RPC functions for app creation and interactions

### Security posture
- only Supabase anon key is used in the browser
- service role / secret are **not** shipped to the frontend
- app creation uses `create_app_secure(...)`
- likes, saves, comments, and reports use controlled authenticated paths
- Vercel security headers configured in `vercel.json`

## Required Supabase setup

Run these files in the Supabase SQL editor for your project:

1. `supabase/schema.sql`
2. `supabase/seed.sql`

Your project URL is expected to be exposed to the frontend through environment variables only.

## Environment variables

Create `.env.local` locally:

```env
VITE_SUPABASE_URL=https://eiyxofhtcmbgaivgvkrh.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

For Vercel, add the same variables in Project Settings -> Environment Variables.

## Local development

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Production build

```bash
npm run build
```

## How to create an account

1. Open `/register`
2. Enter username, display name, email, and password
3. Sign in through `/login`
4. Publish through `/create`

## How to publish on Vercel

1. Push the repository to GitHub
2. Import the repo into Vercel
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add env vars:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Deploy

The `vercel.json` file already includes SPA rewrites so client-side routes like `/feed` and `/profile/:username` work correctly.
