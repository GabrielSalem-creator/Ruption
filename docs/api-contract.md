# Rupture API Contract

This API contract targets the first shipping niche:

**AI tools for builders and creators**

Base path:

`/api/v1`

Authentication:

- public feed endpoints are available without authentication
- authenticated actions use `Authorization: Bearer <jwt>`
- moderation and admin endpoints require elevated roles

## Response envelope

Success:

```json
{
  "data": {},
  "meta": {}
}
```

Error:

```json
{
  "error": {
    "code": "string_code",
    "message": "Human readable message",
    "details": {}
  }
}
```

## Auth

### POST /auth/register

Creates a user account.

Request:

```json
{
  "username": "buildermax",
  "email": "max@example.com",
  "password": "strong_password"
}
```

Response:

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "username": "buildermax",
      "role": "user"
    },
    "token": "jwt"
  }
}
```

### POST /auth/login

Request:

```json
{
  "email": "max@example.com",
  "password": "strong_password"
}
```

### POST /auth/logout

Invalidates refresh token/session if implemented.

### GET /auth/me

Returns authenticated user profile summary.

## Profiles

### GET /profiles/:username

Returns public profile with published apps and stats.

Response:

```json
{
  "data": {
    "profile": {
      "id": "uuid",
      "username": "buildermax",
      "bio": "Shipping AI copilots",
      "avatarUrl": "https://...",
      "bannerUrl": "https://...",
      "websiteUrl": "https://...",
      "twitterUrl": "https://...",
      "githubUrl": "https://...",
      "contactEmail": "hello@example.com",
      "verified": false,
      "stats": {
        "followers": 120,
        "following": 84,
        "apps": 6,
        "totalViews": 10023,
        "avgSessionTimeSeconds": 32.4
      }
    },
    "apps": []
  }
}
```

### PATCH /profiles/me

Updates profile data.

Request:

```json
{
  "bio": "AI product builder",
  "websiteUrl": "https://...",
  "twitterUrl": "https://...",
  "githubUrl": "https://...",
  "contactEmail": "hello@example.com",
  "goal": "Looking for early adopters"
}
```

### POST /profiles/:username/follow

Follows a profile.

### DELETE /profiles/:username/follow

Unfollows a profile.

## Feed

### GET /feed

Returns ranked feed items.

Query parameters:

- `cursor`
- `limit`
- `intentLabel`
- `category`
- `tag`

Response:

```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "slug": "promptlab",
        "title": "PromptLab",
        "description": "Generate and test prompt variants",
        "hook": "Stress-test prompts in seconds",
        "previewMode": "snapshot",
        "appUrl": "https://...",
        "previewImageUrl": "https://...",
        "videoDemoUrl": "https://...",
        "intentLabel": "tool",
        "category": "ai_tool",
        "tags": ["prompts", "llm", "workflow"],
        "creator": {
          "username": "buildermax",
          "avatarUrl": "https://..."
        },
        "stats": {
          "views": 820,
          "likes": 143,
          "comments": 12,
          "saves": 55,
          "avgSessionTimeSeconds": 41.2
        },
        "flags": {
          "verified": true,
          "supportsForking": true,
          "lookingForDevs": true,
          "lookingForDesigners": false,
          "lookingForFunding": false
        }
      }
    ]
  },
  "meta": {
    "nextCursor": "opaque_cursor"
  }
}
```

### GET /feed/featured

Returns editorially curated apps for onboarding and fallback.

## Apps

### POST /apps

Creates a new app post.

Request:

```json
{
  "title": "PromptLab",
  "description": "Interactive prompt testing app for builders",
  "hook": "Stress-test prompts in seconds",
  "appUrl": "https://promptlab.example.com",
  "previewImageUrl": "https://cdn.example.com/previews/promptlab.png",
  "videoDemoUrl": "https://cdn.example.com/demos/promptlab.mp4",
  "tags": ["prompts", "llm", "workflow"],
  "category": "ai_tool",
  "intentLabel": "tool",
  "resourcesNeeded": "Need a frontend designer and beta users",
  "contactInfo": "DM on profile or email",
  "whoItsFor": "AI builders and prompt engineers",
  "whatItDoes": "Test prompts against scenarios",
  "timeToValueTargetSeconds": 3,
  "lookingForDevs": true,
  "lookingForDesigners": true,
  "lookingForFunding": false,
  "supportsForking": true
}
```

Behavior:

- validates URL format
- fetches metadata
- runs embed and performance validation
- stores item in `pending_review` or `active` based on trust rules

### GET /apps/:slug

Returns public app details.

### PATCH /apps/:id

Edits app metadata.

### DELETE /apps/:id

Soft deletes or archives creator-owned app.

### POST /apps/:id/publish

Transitions draft to pending review or active.

### POST /apps/:id/view

Records an impression.

Request:

```json
{
  "surface": "feed"
}
```

### POST /apps/:id/stabilize

Records entry into stabilized interaction mode.

Request:

```json
{
  "enteredAt": "2026-03-25T12:00:00Z"
}
```

### POST /apps/:id/exit

Closes active session.

Request:

```json
{
  "sessionId": "uuid",
  "exitedAt": "2026-03-25T12:00:18Z",
  "durationSeconds": 18,
  "interactionCount": 6,
  "scrollDepth": 0.9,
  "clickMap": {
    "cta": 1,
    "primary_input": 2
  },
  "timeToFirstMeaningfulInteractionMs": 1800
}
```

### POST /apps/:id/like

Likes an app.

### DELETE /apps/:id/like

Unlikes an app.

### POST /apps/:id/save

Saves an app.

### DELETE /apps/:id/save

Unsaves an app.

### POST /apps/:id/share

Tracks outbound share action.

### POST /apps/:id/report

Reports an app.

Request:

```json
{
  "reason": "malicious",
  "notes": "Suspicious redirect behavior"
}
```

### POST /apps/:id/feedback

Stores inline quality feedback.

Request:

```json
{
  "type": "slow"
}
```

Allowed types:

- `confusing`
- `slow`
- `brilliant`

## Comments

### GET /apps/:id/comments

Returns threaded comments.

### POST /apps/:id/comments

Request:

```json
{
  "content": "The prompt test flow is excellent",
  "parentId": null
}
```

### PATCH /comments/:id

Edits own comment.

### DELETE /comments/:id

Deletes own comment or moderator deletes.

## Versions and changelog

### GET /apps/:id/versions

Returns version history.

### POST /apps/:id/versions

Request:

```json
{
  "version": "1.2.3",
  "changelog": "Improved prompt editor performance"
}
```

## Remix / lineage

### POST /apps/:id/remix

Creates lineage link between source app and derivative app.

Request:

```json
{
  "childAppId": "uuid",
  "relationshipType": "fork"
}
```

### GET /apps/:id/lineage

Returns parent/child graph.

## Creator dashboard

### GET /creator/apps/:id/dashboard

Returns private creator analytics for owned app.

Response:

```json
{
  "data": {
    "summary": {
      "views": 1120,
      "uniqueViewers": 920,
      "likes": 181,
      "saves": 82,
      "comments": 24,
      "avgSessionTimeSeconds": 43.1,
      "bounceRate": 0.22,
      "timeToValueSeconds": 2.3
    },
    "retentionCurve": [
      { "second": 1, "retained": 0.92 },
      { "second": 3, "retained": 0.74 },
      { "second": 5, "retained": 0.61 }
    ],
    "feedback": {
      "confusing": 8,
      "slow": 4,
      "brilliant": 65
    },
    "heatmap": {
      "primaryCta": 0.61,
      "inputField": 0.43
    },
    "dropOffPoints": [
      {
        "second": 4,
        "reason": "waiting_for_response"
      }
    ]
  }
}
```

## Recommendations

### GET /recommendations/interests

Returns inferred interest vector for authenticated user.

### GET /recommendations/next

Returns next batch of personalized apps and ranking explanations for internal debugging or admin tooling.

## Moderation

### GET /moderation/queue

Admin/mod only. Returns flagged apps and reports.

### POST /moderation/apps/:id/approve

Approves pending app.

### POST /moderation/apps/:id/reject

Rejects app with reason.

### POST /moderation/apps/:id/ban

Bans app.

### POST /moderation/comments/:id/remove

Removes abusive content.

## Webhook and ingestion support

### POST /ingestion/metadata

Internal service endpoint for asynchronous metadata extraction and embed validation.

### POST /ingestion/performance

Internal service endpoint for load-time and health scoring updates.

## Validation rules

- `title` max 120 chars
- `hook` max 140 chars
- `description` max 1000 chars
- `tags` max 8 entries
- URLs must be valid and normalized
- no app with mandatory auth wall can be published as active
- apps exceeding the load threshold are auto-deprioritized or blocked
- comments and profile fields pass through moderation filters
