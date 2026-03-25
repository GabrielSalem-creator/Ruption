# Rupture

Rupture is a discovery engine for interactive web apps.

The first shipping niche is:

**AI tools for builders and creators**

This repository currently contains the implementation blueprint needed to build the product without ambiguity:

- product identity and non-negotiables
- system architecture
- frontend interaction model
- recommendation and moderation systems
- exact backend API contract
- initial PostgreSQL schema migration
- launch and seeding strategy

## Core product definition

Rupture is not a generic social network. It is a scrollable feed of live web apps where:

- users can discover apps without logging in
- creators publish apps by submitting a URL and metadata
- each feed item supports lightweight preview mode
- tapping an item enters a stabilized interaction mode
- the system ranks apps using engagement, quality, recency, and relevance

## Hard rules

- No login walls inside submitted apps
- No app load time above 2 seconds for accepted feed entries
- No broken embeds in the main feed
- No screenshot-only submissions unless used as fallback when live embedding fails

## Repository contents

- `docs/rupture-system-blueprint.md` - complete product and architecture blueprint
- `docs/api-contract.md` - exact REST API design
- `db/migrations/0001_initial_schema.sql` - initial PostgreSQL schema

## Build direction

Recommended implementation stack:

- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: NestJS, PostgreSQL, Redis
- Storage: S3-compatible object storage
- Delivery: CDN + edge caching

## Product principle

The product is the live execution surface itself.

Content supports discovery, but interactive app usage is the core experience.
