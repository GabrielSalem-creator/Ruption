# Rupture Backend Architecture

## Backend goals

The backend must do more than CRUD. It must protect feed quality, keep app rendering reliable, and provide enough analytics to improve ranking and creator outcomes.

Core responsibilities:

- identity and auth
- creator profiles
- app registry and publishing workflow
- feed ranking and retrieval
- interactions and social graph
- analytics ingestion and rollups
- moderation and trust systems
- preview generation and render health checks

## Suggested stack

- Node.js
- TypeScript
- NestJS or modular Express
- PostgreSQL
- Redis
- S3-compatible object storage
- background job runner

## Service boundaries

### 1. Auth service

Responsibilities:

- register
- login
- JWT issuance
- password reset
- session revocation
- role-based access control

Tables touched:

- `users`
- external session store or future `user_sessions`

### 2. Profile service

Responsibilities:

- public profiles
- profile editing
- social links
- creator goals
- follower counts

Tables touched:

- `users`
- `follows`

### 3. App registry service

Responsibilities:

- create app posts
- update metadata
- store version history
- attach fallback assets
- manage remix lineage
- archive and republish

Tables touched:

- `apps`
- `app_versions`

### 4. Feed service

Responsibilities:

- fetch feed candidates
- apply ranking
- filter unsafe or low-quality apps
- mix exploration and exploitation
- record impression positions

Tables touched:

- `apps`
- `feed_impressions`
- `recommendation_profiles`
- `app_embeddings`

### 5. Interaction service

Responsibilities:

- likes
- saves
- follows
- comments
- shares
- inline feedback
- collaboration interest

Tables touched:

- `likes`
- `saves`
- `follows`
- `comments`
- `app_feedback`
- `collaboration_interests`
- `notifications`

### 6. Analytics service

Responsibilities:

- session lifecycle
- event ingestion
- creator analytics rollups
- time-to-value computation
- bounce rate updates

Tables touched:

- `session_tracking`
- `app_events`

### 7. Moderation service

Responsibilities:

- URL safety checks
- embeddability checks
- performance probes
- moderation queue
- manual review
- report resolution

Tables touched:

- `app_reports`
- `moderation_queue`
- `apps`

## Suggested backend folder structure

```text
server/
  src/
    app.ts
    config/
      env.ts
      database.ts
      redis.ts
    modules/
      auth/
        auth.controller.ts
        auth.service.ts
        auth.repository.ts
        auth.types.ts
      profiles/
        profiles.controller.ts
        profiles.service.ts
        profiles.repository.ts
      apps/
        apps.controller.ts
        apps.service.ts
        apps.repository.ts
        apps.validators.ts
      feed/
        feed.controller.ts
        feed.service.ts
        ranking.service.ts
        candidate.service.ts
      interactions/
        likes.controller.ts
        saves.controller.ts
        comments.controller.ts
        follows.controller.ts
        feedback.controller.ts
      analytics/
        sessions.controller.ts
        analytics.service.ts
        ingestion.service.ts
        rollups.service.ts
      moderation/
        moderation.controller.ts
        moderation.service.ts
        risk.service.ts
        review.service.ts
      notifications/
        notifications.controller.ts
        notifications.service.ts
      jobs/
        metadata.job.ts
        render-health.job.ts
        preview-generation.job.ts
        moderation-scan.job.ts
        ranking-rollup.job.ts
    shared/
      middleware/
      guards/
      errors/
      logger/
      queue/
      storage/
      http/
```

## Feed request lifecycle

1. Request arrives with auth token or anonymous viewer ID.
2. Feed service loads a candidate set from active apps.
3. Safety filters remove banned, flagged, or slow apps.
4. Personalization features are loaded from recommendation profile and recent session history.
5. Ranking score is computed.
6. Exploration slots are injected.
7. Results are returned with viewer-state hydration.
8. Impressions are logged asynchronously.

## Ranking architecture

### Candidate generation

Start with:

- recent active apps
- high health-score apps
- apps matching top user interests
- creator-follow graph matches
- exploration bucket

### Feature computation

Per-user features:

- top tags
- top categories
- save rate
- average session depth
- recency of similar interactions

Per-app features:

- health score
- time-to-value
- bounce rate
- verified status
- recent save velocity

### Rank score

Use the documented weighted function first. Keep it deterministic and explainable before trying heavier models.

## Background jobs

### Metadata extraction job

Input:

- app URL

Output:

- normalized domain
- page title
- open graph image
- fallback metadata

### Render health job

Input:

- app URL

Output:

- embeddability status
- load duration
- failure reason
- recommended preview mode

### Preview generation job

Input:

- app URL

Output:

- preview image
- optional short demo clip

### Moderation scan job

Input:

- app URL
- metadata

Output:

- suspicious patterns
- queue entry if needed

### Ranking rollup job

Runs periodically to:

- update recommendation profiles
- aggregate app metrics
- compute health score
- refresh creator dashboard summaries

## Data integrity rules

- every app must belong to a creator
- every published app must have a moderation status that allows distribution
- every comment belongs to one app and one author
- every session belongs to one app
- every follow edge must be unique
- every app slug must be globally unique
- `notifications.user_id` must always point to a valid recipient

## Caching strategy

Redis should cache:

- feed page candidate ids
- profile summaries
- app detail summaries
- trending tags
- creator dashboard aggregates

Do not cache raw moderation queue decisions without invalidation hooks.

## Security rules

- validate all incoming URLs
- enforce HTTPS for app URLs
- rate limit auth, posting, and feedback endpoints
- reject private network targets in metadata/render jobs
- sanitize rich text inputs or store as plain text only
- log moderation actions with actor identity

## Operational metrics

Track backend health via:

- feed latency
- metadata job duration
- render health success rate
- moderation backlog size
- analytics ingestion lag
- cache hit rate
- failed publish attempts
