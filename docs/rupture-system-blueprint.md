# Rupture System Blueprint

## 1. Product decision

### Name

Rupture

### First niche

**AI tools for builders and creators**

This niche is narrow enough to prevent feed decay and broad enough to create strong network effects between:

- indie builders
- AI workflow creators
- prompt engineers
- no-code operators
- designers testing AI utilities
- early adopters searching for useful tools

### Product category

Rupture is not a generic social platform.

It is a **discovery engine for interactive web apps** with social mechanics layered around the core loop.

### Core loop

1. User opens Rupture without login
2. Feed instantly shows live app entries
3. User scrolls through lightweight previews
4. User taps into an app to enter stabilized mode
5. User interacts with the app
6. User exits back to the feed
7. System learns from session behavior and re-ranks the feed

If this loop is not fast, stable, and addictive, the product fails.

## 2. Non-negotiable platform rules

These rules must be enforced at submission, moderation, and ranking layers.

### Submission quality rules

- No login-required primary experience
- No app accepted if median load exceeds 2 seconds on platform checks
- No broken iframe or rendering failures in accepted feed inventory
- No dead links
- No malicious redirect chains
- No purely static screenshots as the primary experience
- No empty landing pages with no usable interaction

### Feed quality rules

- Preview mode must load in under 1 second for cached items
- Stabilized mode must enter in under 2 seconds
- Scroll must hold near 60 FPS
- Feed should only preload nearby cards
- Fallbacks must be graceful and never block feed scrolling

### Moderation rules

- phishing is an automatic block
- wallet drains, credential capture, hidden redirects, crypto scam flows, or obfuscated malicious scripts are auto-flagged
- repeated app failures reduce visibility before full ban
- creator reputation influences review priority, not final moderation decision

## 3. Product surfaces

## 3.1 Feed

The feed is the home screen and primary product.

### Layout

- full-screen vertical snap cards
- dark background with quiet gradients
- app preview centered
- right rail actions
- bottom metadata
- top utility bar for logo, search, and niche filter

### Right rail

- Like
- Comment
- Save
- Share
- Creator profile

### Bottom metadata

- app title
- creator handle
- one-line hook
- tags
- intent label
- verified badge when applicable

### Feed gestures

- vertical one-finger swipe: move feed
- tap: enter stabilized mode
- two-finger gesture: force feed scroll even when media area is active
- long press: preview details drawer

## 3.2 Stabilized mode

Stabilized mode is the immersive interaction state.

### Behavior

- app expands to fullscreen
- feed snap scrolling is disabled
- touch input is captured by app container
- floating UI remains minimal and non-invasive

### Floating controls

- exit button
- info button
- like button
- save button
- report button

### Details drawer

- full description
- version
- changelog
- category
- tags
- creator card
- collaboration hooks
- external link confirmation

## 3.3 Creator profile

### Header

- avatar
- banner
- display name
- username
- verified indicator
- niche badge

### Profile metadata

- bio
- website
- social links
- contact email
- "building" statement
- looking-for badges

### Stats

- follower count
- following count
- total views
- total saves
- average session time
- total published apps

### Content tabs

- published apps
- saved apps
- remixes
- liked apps

## 3.4 App submission

### Submission flow

1. Paste app URL
2. Run automated preflight
3. Fetch metadata
4. Creator fills required fields
5. Preview results
6. Publish or submit for review

### Preflight checks

- DNS resolution
- HTTPS availability
- response status
- iframe compatibility detection
- load-time test
- screenshot generation
- mobile viewport smoke test
- login wall detection
- suspicious script heuristics

### Required fields

- title
- one-line hook
- description
- intent label
- category
- tags
- target user
- resources needed
- contact info
- app URL

### Optional fields

- preview image
- demo video
- changelog
- version
- support URL
- repository URL
- docs URL
- pricing note
- collaboration hooks

## 4. Interaction model

## 4.1 Preview mode

Preview mode should not load the full app whenever avoidable.

Accepted preview strategies:

1. static preview image with animated shell
2. lightweight snapshot renderer
3. tiny sandbox preview if measured as safe and fast

Feed mode should prefer a deterministic preview artifact over full live execution.

## 4.2 Stabilized mode

### Initial MVP

Use sandboxed iframe embedding when possible.

Example:

```html
<iframe
  src="https://submitted-app.example"
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
  loading="lazy"
  referrerpolicy="strict-origin-when-cross-origin"
/>
```

### Gesture policy

- Preview card owns scroll by default
- tap switches app card into interactive lock
- explicit exit unlocks card back to feed
- two-finger gesture bypasses interactive lock and scrolls the feed

### Fallback chain

If stabilized embed fails:

1. attempt hosted runtime if available
2. fallback to preview image
3. fallback to video demo
4. show failure reason and report option

## 4.3 Long-term runtime strategy

### Phase A: External iframe

Fastest MVP, lowest compatibility.

### Phase B: Proxy renderer

Rewrite and serve app shell through Rupture-controlled domain for compatible sites.

### Phase C: Hosted runtime

Creators upload app bundles or connect a deploy hook. Rupture hosts the app in a controlled sandbox for:

- consistent rendering
- stronger moderation
- stable performance
- stronger analytics

## 5. Frontend architecture

Recommended stack:

- Next.js App Router
- TypeScript
- Tailwind CSS
- React Query
- Zustand for interaction state
- Framer Motion for restrained transitions

### Proposed frontend folder structure

```text
apps/web/
  app/
    (marketing)/
      page.tsx
    feed/
      page.tsx
    app/[slug]/
      page.tsx
    profile/[username]/
      page.tsx
    create/
      page.tsx
    settings/
      page.tsx
    saved/
      page.tsx
    notifications/
      page.tsx
    admin/moderation/
      page.tsx
    api/
      health/route.ts
  components/
    app-card/
      app-card.tsx
      app-card-overlay.tsx
      app-preview-shell.tsx
      app-stabilized-shell.tsx
      app-fallback.tsx
    feed/
      feed-list.tsx
      feed-viewport.tsx
      feed-snap-container.tsx
      feed-prefetch-boundary.tsx
    interactions/
      like-button.tsx
      save-button.tsx
      comment-drawer.tsx
      share-sheet.tsx
      inline-feedback-chip.tsx
    profile/
      profile-header.tsx
      profile-links.tsx
      profile-grid.tsx
      profile-stats.tsx
    create/
      app-url-step.tsx
      app-preflight-step.tsx
      app-details-step.tsx
      app-preview-step.tsx
      app-publish-step.tsx
    layout/
      top-bar.tsx
      bottom-nav.tsx
      modal-root.tsx
      page-shell.tsx
  features/
    feed/
      api.ts
      hooks.ts
      ranking.ts
      types.ts
    apps/
      api.ts
      forms.ts
      validators.ts
      transform.ts
    auth/
      api.ts
      session.ts
    analytics/
      session-tracker.ts
      click-map.ts
    moderation/
      reporting.ts
  lib/
    api-client.ts
    env.ts
    metrics.ts
    gestures.ts
    preload.ts
```

### Core frontend states

- `feedBrowsing`
- `previewFocused`
- `stabilizedInteraction`
- `detailsDrawerOpen`
- `commentDrawerOpen`
- `submissionFlow`

## 6. Backend architecture

Recommended stack:

- NestJS
- PostgreSQL
- Redis
- S3-compatible object storage
- background workers for metadata fetch, screenshot generation, safety scans, and analytics rollups

### Core services

1. Auth service
2. User service
3. App submission service
4. Feed service
5. Interaction service
6. Analytics service
7. Moderation service
8. Notification service
9. Asset service

### Event-driven background jobs

- app metadata refresh
- screenshot capture
- demo performance test
- broken link checks
- moderation scan
- recommendation vector refresh
- retention aggregation

## 7. Data model overview

The full executable schema is in `db/migrations/0001_initial_schema.sql`.

### Primary entities

- users
- user_interest_profiles
- apps
- app_versions
- app_tags
- likes
- comments
- follows
- saves
- app_sessions
- session_events
- inline_feedback
- app_reports
- moderation_cases
- app_collaboration_hooks
- app_remixes
- notifications

### Key computed fields

Apps should track:

- views_count
- likes_count
- comments_count
- saves_count
- avg_session_time_seconds
- bounce_rate
- median_ttv_ms
- quality_score
- health_score
- trending_score

## 8. Recommendation system

This is the main product moat.

## 8.1 Input signals

### Explicit signals

- liked apps
- saved apps
- follows
- profile tags
- creator interests
- search terms

### Implicit signals

- session duration
- stabilization entry rate
- click depth
- repeat opens
- scroll stop duration
- bounce rate
- time to value
- inline feedback
- share events

## 8.2 User interest vector

Store as normalized weighted dimensions in JSONB at first.

Example:

```json
{
  "ai_agents": 0.92,
  "writing_tools": 0.64,
  "image_generation": 0.31,
  "productivity": 0.71,
  "developer_tooling": 0.58
}
```

## 8.3 App vector

Generated from:

- tags
- description
- category
- intent label
- title embeddings
- creator cluster behavior

## 8.4 Ranking formula

Initial production formula:

```text
score =
  (session_time_weight * normalized_session_time) +
  (interaction_weight * interaction_score) +
  (similarity_weight * semantic_similarity) +
  (freshness_weight * recency_decay) +
  (quality_weight * quality_score) +
  (exploration_weight * exploration_factor)
```

Suggested starting weights:

- session time: 0.22
- interaction: 0.20
- semantic similarity: 0.18
- recency: 0.14
- quality: 0.18
- exploration: 0.08

### Interaction score components

- stabilize enters
- deep clicks
- save
- like
- comment
- share
- follow creator

### Quality score penalties

- high bounce rate
- slow load
- frequent render failure
- "confusing" feedback clusters
- repeated moderation warnings

### Quality score boosts

- verified creator
- strong completion rate
- high save-to-view ratio
- low time-to-value
- good session replay depth

## 8.5 Cold start handling

New apps receive a temporary boost only if:

- they pass preflight checks
- they meet performance thresholds
- they are in the target niche
- they have non-empty metadata

Cold-start exposure should decay quickly if engagement is weak.

## 8.6 Anti-garbage policy

Reduce or suppress inventory when:

- bounce rate exceeds threshold
- median time-to-value exceeds 5 seconds
- stabilization rate is low
- app repeatedly fails to render
- feedback skews heavily to slow or confusing

## 9. Analytics and creator intelligence

## 9.1 Session tracking

Every app open should create a session record with:

- anonymous or user identity
- source surface
- entered time
- exited time
- interaction count
- stabilization timestamp
- scroll depth before entry
- exit reason

## 9.2 Session events

Fine-grained event stream:

- preview_visible
- preview_tapped
- stabilize_entered
- app_loaded
- app_load_failed
- deep_interaction
- external_link_clicked
- save_clicked
- like_clicked
- comment_opened
- report_submitted
- stabilize_exited

## 9.3 Creator dashboard

Dashboard metrics:

- views
- unique viewers
- stabilization rate
- average session time
- median time to value
- bounce rate
- retention curve
- click heatmap
- drop-off points
- conversion clicks
- saves
- shares
- follows generated

## 10. Micro features that should ship

## 10.1 Intent label

Every app must declare exactly one primary intent:

- Tool
- Game
- Experiment
- Utility

## 10.2 Inline feedback

Every viewer can tap:

- Confusing
- Slow
- Brilliant

This feedback affects ranking and creator insights.

## 10.3 Collaboration hooks

Each app can show one or more:

- Looking for devs
- Looking for designers
- Looking for funding
- Looking for beta testers

## 10.4 Versioning

Apps support version metadata:

- semantic version
- changelog
- release note timestamp

## 10.5 Remix and fork lineage

Creators can publish a remix linked to a parent app.

Use this for:

- discovery
- attribution
- viral loops
- creator genealogy

## 10.6 Verified apps

Verification can be applied to creators and individual apps.

Signals:

- uptime
- load speed
- moderation history
- completion quality
- manual review

## 10.7 Demo mode compliance

Apps can be marked:

- demo-ready
- fallback-only
- hosted-runtime-ready
- blocked

## 11. Security and trust

Rupture runs user-submitted software surfaces. This is a core risk area.

### Must-have controls

- iframe sandboxing
- CSP for Rupture shell
- external URL allow/deny policies
- rate limiting
- malware heuristics
- link safety scanning
- report flow
- manual review queue
- signed asset URLs
- image and video validation

### Moderation workflow

1. automated scan at submission
2. quarantine if suspicious
3. reviewer queue for flagged apps
4. creator notification on action
5. resubmission flow with notes

### Report categories

- phishing
- malware
- impersonation
- spam
- broken app
- login wall
- adult content
- hateful content

## 12. Performance system

### Must implement

- feed virtualization or bounded card window
- next-card prefetching
- metadata caching
- CDN edge caching
- background screenshot generation
- low-overhead analytics batching

### Performance targets

- initial feed response under 500 ms server time
- visible feed load under 1 second on warm cache
- stabilized enter under 2 seconds
- scroll rendering near 60 FPS
- preview shell input latency under 100 ms

## 13. MVP sequence

## Phase 1

- public feed
- profile pages
- app submission by URL
- preview image generation
- stabilized iframe mode
- likes, saves, comments, follows
- manual moderation dashboard

## Phase 2

- personalized feed
- inline feedback
- creator analytics
- app versioning
- collaboration hooks
- share deep links

## Phase 3

- hosted runtime
- remix/fork graph
- semantic recommendations
- trust scoring
- advanced moderation automation

## 14. Growth strategy

Rupture only works if initial content quality is unnaturally high.

### Launch strategy

- manually recruit first 100 creators
- curate only AI tools for builders and creators
- reject general junk
- seed power-user accounts with saved collections
- spotlight best apps daily

### Viral loops

- share app opens inside Rupture
- profile pages accumulate authority
- remix chains create lineage discovery
- save lists become public collections later

## 15. Product decisions that should remain locked

- niche remains AI tools for builders and creators for launch
- no generic everything-platform positioning
- interaction quality beats feed volume
- live app experience is the product, not passive content
- low-friction discovery beats heavy creator dashboards in the MVP
