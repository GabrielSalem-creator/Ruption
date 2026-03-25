## Rupture API Contract

This document defines the v1 backend contract for Rupture, focused on AI agents and AI micro-tools.

## Conventions

- Base path: `/api/v1`
- Auth: Bearer JWT for authenticated endpoints
- Public browsing does not require login
- All timestamps use ISO 8601 UTC strings
- Pagination: cursor-based whenever content is sorted chronologically or by rank

## Response envelope

Successful responses:

```json
{
  "data": {},
  "meta": {}
}
```

Error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Readable message",
    "details": {}
  }
}
```

## Authentication

### POST `/auth/register`

Create an account.

Request:

```json
{
  "username": "builder01",
  "email": "builder@example.com",
  "password": "strong-password",
  "displayName": "Builder 01"
}
```

Response:

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "username": "builder01",
      "displayName": "Builder 01",
      "role": "user"
    },
    "token": "jwt"
  }
}
```

### POST `/auth/login`

Request:

```json
{
  "email": "builder@example.com",
  "password": "strong-password"
}
```

### POST `/auth/logout`

Invalidates refresh token or current session.

### GET `/auth/me`

Returns current user and profile completion state.

## Profiles

### GET `/profiles/:username`

Public profile and creator stats.

Response fields:

- `user`
- `stats`
- `apps`
- `links`

### PATCH `/profiles/me`

Update creator profile.

Request:

```json
{
  "displayName": "Rafi",
  "bio": "Building AI micro-tools.",
  "avatarUrl": "https://cdn.example.com/avatar.png",
  "bannerUrl": "https://cdn.example.com/banner.png",
  "websiteUrl": "https://example.com",
  "twitterUrl": "https://x.com/example",
  "githubUrl": "https://github.com/example",
  "linkedinUrl": "https://linkedin.com/in/example",
  "contactEmail": "contact@example.com",
  "goal": "Looking for distribution partners"
}
```

### POST `/profiles/:username/follow`

Follow creator.

### DELETE `/profiles/:username/follow`

Unfollow creator.

## Feed

### GET `/feed`

Returns personalized or anonymous ranked feed.

Query params:

- `cursor`
- `limit`
- `mode=for-you|following|latest`
- `intentLabel`
- `category`
- `tags`

Response shape:

```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "Prompt Refiner",
        "slug": "prompt-refiner",
        "hook": "Rewrite prompts for better model outputs.",
        "description": "One-line and expanded description.",
        "preview": {
          "type": "live",
          "previewImageUrl": "https://cdn.example.com/preview.jpg",
          "videoDemoUrl": null,
          "appUrl": "https://tool.example.com",
          "renderMode": "iframe"
        },
        "creator": {
          "id": "uuid",
          "username": "builder01",
          "avatarUrl": "https://cdn.example.com/avatar.png",
          "verified": true
        },
        "metrics": {
          "viewsCount": 1200,
          "likesCount": 140,
          "commentsCount": 12,
          "savesCount": 53,
          "avgSessionTime": 23.8,
          "appHealthScore": 82
        },
        "viewerState": {
          "liked": false,
          "saved": true,
          "followingCreator": false
        },
        "classification": {
          "intentLabel": "tool",
          "category": "ai_tool",
          "tags": ["prompting", "llm", "writing"]
        }
      }
    ]
  },
  "meta": {
    "nextCursor": "opaque-cursor"
  }
}
```

### POST `/feed/impression`

Record that a feed card became visible.

Request:

```json
{
  "appId": "uuid",
  "visibleAt": "2026-03-25T12:00:00Z",
  "surface": "feed"
}
```

## Apps

### POST `/apps`

Create app post.

Request:

```json
{
  "title": "Prompt Refiner",
  "slug": "prompt-refiner",
  "hook": "Rewrite prompts for better model outputs.",
  "description": "Improve prompts with instant suggestions.",
  "appUrl": "https://tool.example.com",
  "loginRequired": false,
  "hostedBundleUrl": null,
  "previewImageUrl": "https://cdn.example.com/preview.jpg",
  "videoDemoUrl": null,
  "category": "ai_tool",
  "intentLabel": "tool",
  "tags": ["prompting", "llm", "writing"],
  "targetUser": "Indie builders and students using LLMs daily.",
  "problemStatement": "People waste time iterating on low-quality prompts.",
  "resourcesNeeded": "Looking for distribution and feedback.",
  "contactInfo": "DM or email",
  "collaborationHooks": {
    "lookingForDevs": false,
    "lookingForDesigners": false,
    "lookingForFunding": true,
    "lookingForDistribution": true
  },
  "versionName": "1.0.0",
  "changelog": "Initial release",
  "pricingModel": "free"
}
```

Validation rules:

- `title` required
- `slug` unique
- `appUrl` must be HTTPS
- login-wall apps rejected in moderation review
- preview image or video is required when live render reliability score is low

### GET `/apps/:slug`

Get full app details, creator, metrics, versions, lineage, and comments summary.

### PATCH `/apps/:id`

Update mutable app metadata.

### POST `/apps/:id/publish`

Move app from draft or pending review to published state.

### POST `/apps/:id/archive`

Archive creator-owned app.

### POST `/apps/:id/remix`

Create derivative app linked to parent lineage.

Request:

```json
{
  "title": "Prompt Refiner Remix",
  "slug": "prompt-refiner-remix",
  "appUrl": "https://new.example.com",
  "description": "Added citation-aware prompt templates."
}
```

## App sessions and analytics

### POST `/apps/:id/session/start`

Start session when user opens stabilized mode.

Request:

```json
{
  "enteredAt": "2026-03-25T12:00:00Z",
  "surface": "stabilized",
  "source": "feed",
  "anonymousId": "browser-generated-id"
}
```

Response:

```json
{
  "data": {
    "sessionId": "uuid"
  }
}
```

### POST `/apps/:id/session/update`

Heartbeat for analytics.

Request:

```json
{
  "sessionId": "uuid",
  "eventAt": "2026-03-25T12:00:08Z",
  "interactionCount": 3,
  "scrollDepth": 0.35,
  "clickMap": {
    "generateButton": 2,
    "inputArea": 1
  },
  "timeToFirstMeaningfulInteractionMs": 1800
}
```

### POST `/apps/:id/session/end`

End session and compute duration.

Request:

```json
{
  "sessionId": "uuid",
  "exitedAt": "2026-03-25T12:00:25Z",
  "exitReason": "user_closed"
}
```

### GET `/creator/apps/:id/analytics`

Creator-only analytics dashboard.

Response sections:

- `overview`
- `retentionCurve`
- `heatmap`
- `dropOffPoints`
- `feedbackSummary`
- `trafficSources`

## Interactions

### POST `/apps/:id/like`
### DELETE `/apps/:id/like`
### POST `/apps/:id/save`
### DELETE `/apps/:id/save`

### GET `/apps/:id/comments`

Query params:

- `cursor`
- `limit`
- `sort=top|latest`

### POST `/apps/:id/comments`

Request:

```json
{
  "content": "Very clean UX. Would love export support.",
  "parentId": null
}
```

### DELETE `/comments/:id`

Soft-delete own comment or moderate as admin.

### POST `/apps/:id/feedback`

Inline feedback for quality tuning.

Request:

```json
{
  "feedbackType": "brilliant"
}
```

Allowed `feedbackType` values:

- `confusing`
- `slow`
- `brilliant`

## Discovery and search

### GET `/search`

Query params:

- `q`
- `tags`
- `category`
- `intentLabel`

Returns mixed results: apps, creators, and tags.

### GET `/tags/trending`

Returns top tags for current niche.

## Moderation

### POST `/apps/:id/report`

Request:

```json
{
  "reasonCode": "phishing",
  "details": "Redirects to suspicious wallet connect page"
}
```

### GET `/moderation/queue`

Admin and moderator only.

### POST `/moderation/apps/:id/review`

Admin and moderator only.

Request:

```json
{
  "status": "approved",
  "notes": "Loads in 1.1s and passes sandbox checks."
}
```

## Recommendation support endpoints

### GET `/me/interests`

Returns current user interest vector and top inferred clusters.

### POST `/me/interests`

Explicit interest tuning from onboarding or settings.

Request:

```json
{
  "weights": {
    "agents": 0.9,
    "writing": 0.7,
    "education": 0.4
  }
}
```

### GET `/feed/explanations`

Optional internal endpoint for debugging why items ranked for a user.

Response item fields:

- `appId`
- `score`
- `watchTimeContribution`
- `interactionContribution`
- `similarityContribution`
- `freshnessContribution`
- `explorationContribution`
- `penalties`

## Notifications

### GET `/notifications`

Notification types:

- `new_comment`
- `new_follower`
- `app_verified`
- `remix_created`
- `collaboration_interest`

### PATCH `/notifications/:id/read`

## Creator collaboration

### POST `/apps/:id/collaboration-interest`

Request:

```json
{
  "message": "I can help with landing pages and onboarding UX.",
  "interestType": "designer"
}
```

Allowed `interestType` values:

- `dev`
- `designer`
- `funding`
- `distribution`

## Internal jobs

These do not need public routes but must exist in the system:

- URL metadata extraction job
- app load reliability probe
- preview image generation job
- moderation classification job
- ranking feature aggregation job
- creator analytics rollup job
