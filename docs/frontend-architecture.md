 # Rupture Frontend Architecture

 ## Frontend stack

 - Next.js App Router
 - TypeScript
 - Tailwind CSS
 - Framer Motion
 - Zustand or Redux Toolkit for client UI state
 - React Query or SWR for server state

 ## Top-level app structure

 ```text
 src/
   app/
     (marketing)/
       page.tsx
     feed/
       page.tsx
     app/[slug]/
       page.tsx
     create/
       page.tsx
     profile/[username]/
       page.tsx
     settings/
       page.tsx
     admin/
       moderation/
         page.tsx
     api/
       health/route.ts
   components/
     feed/
       FeedPage.tsx
       FeedCard.tsx
       FeedViewport.tsx
       FeedOverlay.tsx
       CardMeta.tsx
       InteractionRail.tsx
       StabilizePrompt.tsx
     player/
       AppPreviewShell.tsx
       AppPreviewImage.tsx
       AppIframeRuntime.tsx
       StabilizedAppModal.tsx
       TouchGuardLayer.tsx
       FallbackVideo.tsx
       BrokenEmbedState.tsx
     create/
       CreatePostForm.tsx
       UrlPasteStep.tsx
       PreviewFetchPanel.tsx
       MetadataStep.tsx
       TagsStep.tsx
       PublishStep.tsx
     profile/
       ProfileHeader.tsx
       ProfileLinks.tsx
       ProfileStats.tsx
       ProfileAppsGrid.tsx
     comments/
       CommentsDrawer.tsx
       CommentComposer.tsx
       CommentThread.tsx
     creator/
       CreatorDashboard.tsx
       RetentionChart.tsx
       HeatmapPanel.tsx
       DropoffTimeline.tsx
     ui/
       Button.tsx
       Dialog.tsx
       Drawer.tsx
       Input.tsx
       Badge.tsx
       Avatar.tsx
   lib/
     api/
       client.ts
       feed.ts
       apps.ts
       auth.ts
       users.ts
     analytics/
       sessionTracker.ts
       feedbackTracker.ts
     ranking/
       localPreferenceStore.ts
     runtime/
       iframePolicy.ts
       touchMode.ts
       healthCheck.ts
     utils/
       format.ts
       validators.ts
   store/
     authStore.ts
     feedStore.ts
     runtimeStore.ts
     commentsStore.ts
 ```

 ## Route responsibilities

 ### `/feed`

 Primary product surface.

 Responsibilities:
 - fetch paginated feed batches
 - maintain active card index
 - prefetch next two cards
 - record enter and exit times per app
 - render cards at viewport height with snap scroll

 ### `/app/[slug]`

 Dedicated page for deep links and sharing.

 Responsibilities:
 - render stabilized mode immediately
 - show app metadata and comment drawer
 - support share previews for external links

 ### `/create`

 Creator posting flow.

 Responsibilities:
 - accept URL paste
 - fetch metadata preview
 - validate login wall and renderability assumptions
 - collect tags, intent label, collaboration hooks, and contacts

 ### `/profile/[username]`

 Creator and user identity surface.

 Responsibilities:
 - render profile header
 - list posted apps
 - show aggregate stats
 - expose follow action

 ## Feed behavior

 ### Scroll model

 Feed uses vertical snap scrolling with one dominant card at a time.

 Requirements:
 - 100vh card height
 - CSS scroll snapping
 - virtualization after the first batch
 - prefetch metadata and preview media for adjacent cards

 ### Card composition

 Every card contains:
 - preview shell
 - bottom metadata overlay
 - right rail interactions
 - subtle prompt telling user they can tap to stabilize

 ### Preview mode

 Preview mode must not run a heavy full app by default.

 Order of preference:
 1. lightweight preview snapshot
 2. trusted iframe preview with throttled initialization
 3. preview image
 4. video demo fallback

 ### Stabilized mode

 Triggered by explicit tap.

 Behavior:
 - opens full-screen surface
 - body scroll locked
 - iframe promoted to interaction mode
 - floating exit button always visible
 - info drawer accessible without leaving app

 ## Touch handling model

 Touch conflicts are a central product risk and must be solved deliberately.

 ### States

 1. `feed_scroll`
    - default
    - one-finger vertical drag scrolls feed
    - taps can open stabilized mode

 2. `stabilized_interact`
    - app receives pointer events
    - feed scroll disabled

 3. `forced_feed_scroll`
    - any two-finger gesture returns control to the feed
    - this acts as a universal escape hatch

 ### Implementation notes

 - Use a transparent guard layer in preview mode
 - Remove or relax the guard only after tap-to-stabilize
 - Listen for multi-touch gestures at container level
 - Avoid ambiguous hybrid states

 ## State boundaries

 ### Server state

 Use React Query or SWR for:
 - feed pages
 - app metadata
 - comments
 - likes and saves
 - profile data
 - creator dashboard metrics

 ### Client state

 Use a dedicated UI store for:
 - active card index
 - stabilized app id
 - comment drawer open state
 - transient optimistic reactions
 - local touch interaction mode

 ## Analytics capture

 Track the following client events:
 - feed_card_impression
 - app_preview_visible
 - stabilize_opened
 - stabilize_closed
 - app_meaningful_interaction
 - app_feedback_submitted
 - comment_opened
 - like_toggled
 - save_toggled
 - profile_opened
 - follow_clicked

 ## Rendering safety

 ### iframe policy

 Allowed sandbox attributes:
 - `allow-scripts`
 - `allow-same-origin`
 - `allow-forms`
 - optionally `allow-popups` only for reviewed apps

 Never allow:
 - top-level navigation without user intent
 - unrestricted permissions by default

 ### Failure handling

 When iframe fails:
 - mark runtime failure in telemetry
 - replace preview with image or video fallback
 - surface soft error state to user
 - flag app for creator remediation if repeat failures exceed threshold

 ## Accessibility and quality bar

 Requirements:
 - keyboard reachable primary actions
 - visible focus states
 - reduced motion support
 - minimum contrast compliance
 - loading skeletons rather than empty flashes

 ## Design system direction

 Visual rules:
 - dark-first interface
 - restrained gradients
 - strong typography
 - minimal chrome around the app itself
 - motion only when it improves orientation

 ## Initial milestones

 ### Milestone 1
 - feed page
 - static previews
 - stabilize modal
 - profiles
 - post creation with URL metadata

 ### Milestone 2
 - likes, saves, follows, comments
 - session tracking
 - fallback media paths

 ### Milestone 3
 - personalized feed
 - creator dashboard
 - moderation queue
 - verification and app health indicators
