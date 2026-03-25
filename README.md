# Rupture

Rupture is a discovery platform for interactive web apps.

Instead of scrolling static videos, users scroll live app previews, open an app into a stabilized full-screen mode, interact with it, save it, comment on it, and follow the creator behind it.

This repository now contains both the execution blueprint and the first implementation scaffold for Rupture:

- product definition and UX rules
- system architecture and rendering model
- live Next.js frontend scaffold
- Supabase integration layer
- frontend component and folder structure
- API contract
- PostgreSQL schema and first migration
- launch and moderation requirements

## First niche

Rupture v1 is locked to:

**AI agents and AI micro-tools**

That means the first feed should prioritize:

- single-purpose AI utilities
- lightweight AI workflow tools
- AI demos that work without a login wall
- agent-like apps that deliver value in a few seconds

This constraint is intentional. It reduces low-quality content and gives the recommendation system a clean starting dataset.

## Core product statement

Rupture = frictionless discovery and interaction of live web apps in a scrollable feed.

The app itself is the content.

## Hard rules

- no login walls inside featured apps
- no app load over 2 seconds in stabilized mode
- no broken embeds in the feed
- no static screenshots unless used as a fallback state

## Repository contents

- `docs/rupture-system-blueprint.md` - complete product, UX, architecture, ranking, moderation, and launch blueprint
- `docs/api-contract.md` - exact API routes, payloads, and response contracts
- `docs/backend-architecture.md` - backend folder structure, service boundaries, jobs, and infrastructure responsibilities
- `docs/frontend-architecture.md` - app structure, component tree, state boundaries, and rendering behavior
- `docs/launch-plan.md` - niche seeding, supply strategy, and first distribution loops
- `db/migrations/0001_initial_schema.sql` - initial PostgreSQL schema
- `app/` and `components/` - first frontend implementation scaffold
- `supabase/migrations/0001_ruption_platform.sql` - Supabase-native schema, RLS, triggers, and RPC functions
- `supabase/seed.sql` - optional local/dev seed data

## Recommended build stack

- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion
- Node.js API layer
- PostgreSQL
- Redis
- S3-compatible object storage

## Build order

1. ship browsing feed and stabilized mode
2. ship creator posting flow and profiles
3. ship interactions and analytics capture
4. ship recommendation v1
5. ship moderation, verification, and creator insights

## Local development

1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase project URL and keys locally
3. Run `npm run dev`
4. Apply `supabase/migrations/0001_ruption_platform.sql` in Supabase or via Supabase CLI
