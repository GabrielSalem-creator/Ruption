# Rupture System Blueprint

## 1. Product definition

### 1.1 One-line statement

Rupture is a discovery engine for interactive web apps where the app itself is the content.

### 1.2 Locked v1 niche

Rupture v1 is focused on:

**AI agents and AI micro-tools**

This means every decision in the first release should favor:

- utility over entertainment
- fast time-to-value
- no-login experiences
- small, high-signal creator ecosystem

### 1.3 What Rupture is not

Rupture is not:

- a general social network
- a broad app store for every type of software
- a video-first media platform

The feed format is inspired by short-form video products, but the substance is interactive software.

## 2. Product pillars

### 2.1 Pillar 1: Frictionless discovery

Users should discover useful tools without searching through directories, landing pages, or long-form marketing copy.

### 2.2 Pillar 2: Instant interaction

Users should be able to try a tool immediately inside the platform or in a controlled fallback state.

### 2.3 Pillar 3: Creator leverage

Creators should be able to publish a working app link, explain the value, state what support they need, and get measurable feedback.

### 2.4 Pillar 4: Feed quality

Low-quality, broken, slow, or deceptive apps must be filtered aggressively. Feed quality is more important than content volume.

## 3. Hard product rules

These are non-negotiable for featured apps in the feed:

- no login walls inside the core experience
- no app load over 2 seconds in stabilized mode on a normal connection
- no broken embeds in the feed
- no static screenshots except as a fallback state
- no phishing, credential harvesting, or wallet-drain patterns
- no deceptive metadata or fake creators

## 4. Core user loops

### 4.1 Viewer loop

1. Open Rupture with no login requirement.
2. Land directly in a personalized feed.
3. See a live or semi-live preview card for an AI tool.
4. Tap to enter stabilized mode.
5. Interact with the app.
6. Exit back to feed, like, save, follow, comment, or share.
7. Receive a better next recommendation based on behavior.

### 4.2 Creator loop

1. Create an account and complete a creator profile.
2. Paste an app URL into the create-post flow.
3. Rupture fetches metadata and validates embeddability/performance.
4. Creator edits title, hook, description, tags, and support needs.
5. App is submitted to moderation and health checks.
6. App is published to the feed.
7. Creator tracks retention, feedback, and collaboration interest.

## 5. Core surfaces

### 5.1 Feed screen

The feed is a vertical, full-screen, snap-scrolling surface.

Each card includes:

- preview viewport
- title
- one-line hook
- creator handle
- tags
- intent label
- right rail actions: like, comment, save, share, profile
- optional quality badge: verified, featured, trending

### 5.2 Stabilized mode

Stabilized mode is the primary interaction state for an app.

Behavior:

- app expands into full-screen
- feed scroll is disabled
- touch and keyboard focus are given to the app
- a floating control layer remains visible or summonable

Controls:

- exit
- info
- like
- save
- share
- report
- open original site

### 5.3 Profile page

Each creator profile contains:

- avatar
- banner
- username and display name
- bio
- website and social links
- collaboration goals
- app grid
- aggregate stats:
  - total views
  - total likes
  - average session time
  - saves
  - follower count

### 5.4 Create-post flow

Create-post is a structured, guided workflow:

1. Paste app URL
2. Run metadata extraction
3. Run embed/performance checks
4. Upload preview image if auto-preview fails
5. Edit metadata
6. Define support needs
7. Publish or submit for review

## 6. Required metadata for every app

The creator must provide:

- title
- short hook
- description
- app URL
- tags
- intent label
- target user
- what problem it solves
- resources needed
- contact method

Optional but strongly encouraged:

- preview image
- video demo fallback
- changelog
- collaboration roles
- pricing/free status

## 7. Intent labels and categorization

### 7.1 Intent label

Every app must declare exactly one primary intent label:

- Tool
- Agent
- Utility
- Experiment
- Game

For v1, feed ranking should heavily prefer Tool, Agent, and Utility.

### 7.2 Category examples

Suggested v1 categories:

- writing
- research
- automation
- productivity
- education
- design assist
- coding assist
- workflow

## 8. Rendering architecture

### 8.1 Rendering modes

#### Mode A: Preview mode

Preview mode is optimized for feed scrolling.

Allowed preview states:

- lightweight iframe preview for compatible apps
- controlled placeholder snapshot
- preview image
- silent video demo fallback

Rules:

- no heavy app boot if not near the viewport
- preload only the current card and next 2 cards
- pause inactive previews

#### Mode B: Stabilized mode

Stabilized mode prioritizes reliable interaction.

Initial implementation:

```html
<iframe
  src="app_url"
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
  loading="eager"
  referrerpolicy="strict-origin-when-cross-origin"
/>
```

Additional requirements:

- performance timeout after 2 seconds
- health checks before promotion into feed
- visible loading state with fallback path

### 8.2 Touch handling model

This is a critical interaction contract.

Default feed behavior:

- vertical swipe scrolls the feed
- tap enters stabilized mode

Inside stabilized mode:

- single-finger interaction is passed to the app
- two-finger vertical gesture always exits app gesture capture and scrolls the feed shell only if the user is not in locked focus mode
- explicit exit button always returns to the feed

Recommended state machine:

- browsing
- primed
- stabilized
- exiting

### 8.3 Fallback hierarchy

If an app cannot be embedded or fails health checks, display:

1. preview image
2. silent video demo
3. open-original-site CTA

Apps that consistently fail embedding should remain publishable only if their fallback still communicates value and they do not degrade the feed.

### 8.4 Long-term rendering roadmap

#### Phase 1

External iframe embedding with strict validation.

#### Phase 2

Creator-uploaded hosted bundles with Rupture-managed storage and sandboxing.

#### Phase 3

Controlled runtime environment with version pinning, asset scanning, and optional edge execution.

## 9. Recommendation system

### 9.1 Inputs

User profile vector is derived from:

- liked app tags
- saved app tags
- session duration by category
- stabilized entries
- comments
- follows
- feedback labels

Example:

```json
{
  "writing": 0.7,
  "research": 0.8,
  "automation": 0.9,
  "education": 0.3
}
```

App vectors are derived from:

- tags
- category
- intent label
- description embeddings
- creator reputation
- recent quality metrics

### 9.2 Ranking function

Initial scoring model:

```text
score =
  (watch_time_weight * normalized_watch_time) +
  (interaction_weight * interaction_score) +
  (similarity_weight * cosine_similarity) +
  (freshness_weight * recency_decay) +
  (exploration_weight * randomness) +
  (quality_weight * health_score)
```

### 9.3 Engagement signals

Use the following event weights:

- feed impression
- preview hold time
- stabilized mode entry
- time to first meaningful action
- total session duration
- interaction count
- save
- follow creator
- share
- return visit

### 9.4 Anti-garbage penalties

Down-rank apps for:

- high bounce rate
- load time over target
- low stabilize-entry rate
- low repeat sessions
- repeated "Confusing" or "Slow" feedback
- report volume
- broken previews

### 9.5 Cold-start boost

Every new app receives:

- temporary controlled exploration exposure
- audience sampling across several user segments
- early health score recalculation after the first meaningful session batch

### 9.6 Time-to-value metric

Time-to-value is the time between stabilized mode entry and the first meaningful interaction.

If median time-to-value exceeds 5 seconds:

- apply a quality penalty
- flag the creator dashboard
- recommend onboarding fixes

## 10. Analytics and creator intelligence

### 10.1 Session tracking

For each session capture:

- entered_at
- exited_at
- duration
- interaction_count
- click map
- scroll depth
- stabilize source
- device class
- country
- referrer

### 10.2 Event taxonomy

Minimum events:

- feed_card_impression
- feed_card_visible_2s
- stabilize_open
- stabilize_exit
- app_loaded
- app_load_failed
- app_meaningful_action
- like_created
- save_created
- comment_created
- follow_created
- feedback_submitted
- report_submitted
- outbound_open_original

### 10.3 Creator dashboard

The dashboard should include:

- views
- stabilized opens
- average session time
- median time-to-value
- save rate
- follow rate
- retention curve
- drop-off by second bucket
- feedback distribution
- click heatmap
- collaboration interest count

## 11. Social and collaboration features

### 11.1 Baseline social

- likes
- comments
- replies
- saves
- follows
- shares

### 11.2 Collaboration hooks

Each app can declare:

- looking for developers
- looking for designers
- looking for operators
- looking for funding
- looking for distribution partners

Users can submit collaboration interest with a short message.

### 11.3 Remix and fork

Creators can create a derivative listing that links back to the original app.

Fork relationships should preserve:

- original app ID
- derived app ID
- fork note
- derivative type

## 12. Security and trust

### 12.1 Must-have controls

- iframe sandboxing
- CSP on Rupture-owned surfaces
- URL validation
- DNS and domain risk screening
- rate limiting
- bot protection on posting and auth
- malware and phishing heuristics
- abuse reporting

### 12.2 Moderation workflow

Every app passes through:

1. URL normalization
2. metadata fetch
3. embeddability check
4. performance check
5. automated risk scan
6. moderation state assignment

Moderation states:

- draft
- pending_review
- active
- limited_distribution
- removed
- banned

### 12.3 Report reasons

Users should be able to report:

- phishing
- malware
- broken app
- hateful content
- sexual content
- spam
- copyright issue
- impersonation

## 13. Performance targets

### 13.1 Product targets

- initial feed load under 1 second for cached users
- first preview visible under 1 second
- stabilized mode boot under 2 seconds
- feed scrolling at 60fps

### 13.2 Technical rules

- lazy load below-the-fold cards
- prefetch next 2 apps
- suspend inactive previews
- cache metadata and previews at the edge
- use image/video optimization for fallback assets
- debounce analytics writes to batching layer

## 14. Design system direction

### 14.1 Visual principles

- dark-first UI
- low-noise chrome
- large, readable typography
- subtle depth instead of excessive motion
- focus should remain on the app viewport

### 14.2 Tone

Rupture should feel:

- sharp
- credible
- slightly futuristic
- creator-centric

### 14.3 Motion

Animation should be limited to:

- feed snap transitions
- stabilization transitions
- button affordance
- drawer and modal transitions

Avoid decorative motion that competes with the embedded app.

## 15. Suggested technical architecture

### 15.1 Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- TanStack Query for data fetching
- Zustand or context for lightweight client UI state

### 15.2 Backend

- Node.js API service
- PostgreSQL
- Redis for caching and queue support
- object storage for preview assets and uploaded bundles
- background workers for metadata extraction and moderation checks

### 15.3 Services

- auth and identity service
- creator profile service
- app registry service
- feed service
- interactions service
- analytics ingestion service
- moderation service

## 16. Launch strategy

### 16.1 Seed supply

Before open launch, curate the first 100 apps manually.

Selection criteria:

- fast load
- clear use case
- good mobile interaction
- no login barrier
- visible value in under 5 seconds

### 16.2 Initial audience

Target:

- builders of AI micro-tools
- indie hackers shipping AI demos
- early adopters who like trying AI utilities

### 16.3 Growth loops

- shareable app pages
- creator profiles
- fork/remix lineage
- collaboration interest
- "featured in Rupture" social proof

## 17. Execution phases

### Phase 0: Foundation

- define schema
- define API contracts
- define feed interaction model
- define moderation rules

### Phase 1: MVP

- anonymous feed
- creator auth
- profiles
- create-post flow
- preview and stabilized mode
- likes, saves, comments, follows

### Phase 2: Quality

- moderation queue
- health scoring
- verified apps
- analytics pipeline
- creator dashboard

### Phase 3: Intelligence

- recommendation v1
- cold-start exploration
- feedback-driven penalties
- simple vector similarity scoring

### Phase 4: Platform

- hosted bundles
- controlled runtime
- remix lineage
- collaboration marketplace

## 18. Final product decisions

The first decisive product constraint is:

**Rupture launches as a discovery platform for AI agents and AI micro-tools, not for all web apps.**

The most important product truth is:

**If the apps are not instantly usable, the feed has no value.**
