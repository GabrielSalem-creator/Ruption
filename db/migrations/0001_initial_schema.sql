CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_status') THEN
    CREATE TYPE app_status AS ENUM ('draft', 'pending_review', 'active', 'limited_distribution', 'flagged', 'removed', 'banned', 'archived');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_category') THEN
    CREATE TYPE app_category AS ENUM ('ai_agent', 'ai_tool', 'workflow', 'productivity', 'research', 'developer_tool', 'experiment');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'intent_label') THEN
    CREATE TYPE intent_label AS ENUM ('tool', 'agent', 'game', 'experiment', 'utility');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feedback_label') THEN
    CREATE TYPE feedback_label AS ENUM ('confusing', 'slow', 'brilliant');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_reason') THEN
    CREATE TYPE report_reason AS ENUM ('phishing', 'malware', 'broken_embed', 'abuse', 'spam', 'copyright', 'other');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mod_status') THEN
    CREATE TYPE mod_status AS ENUM ('open', 'reviewing', 'resolved', 'dismissed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'collaboration_need') THEN
    CREATE TYPE collaboration_need AS ENUM ('developers', 'designers', 'funding', 'marketing', 'operators');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM ('new_comment', 'new_follower', 'app_verified', 'remix_created', 'collaboration_interest');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  website_url TEXT,
  twitter_url TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  contact_email TEXT,
  goal TEXT,
  interests JSONB NOT NULL DEFAULT '{}'::jsonb,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  one_line_hook TEXT NOT NULL,
  target_user TEXT,
  problem_statement TEXT,
  app_url TEXT NOT NULL,
  canonical_domain TEXT,
  hosted_bundle_url TEXT,
  preview_image_url TEXT,
  video_demo_url TEXT,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  category app_category NOT NULL,
  intent_label intent_label NOT NULL,
  resources_needed TEXT,
  contact_info TEXT,
  collaboration_hooks collaboration_need[] NOT NULL DEFAULT ARRAY[]::collaboration_need[],
  status app_status NOT NULL DEFAULT 'pending_review',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  version TEXT NOT NULL DEFAULT '1.0.0',
  changelog TEXT,
  parent_app_id UUID REFERENCES apps(id) ON DELETE SET NULL,
  views_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  saves_count INTEGER NOT NULL DEFAULT 0,
  shares_count INTEGER NOT NULL DEFAULT 0,
  avg_session_time_seconds NUMERIC(10,2) NOT NULL DEFAULT 0,
  bounce_rate NUMERIC(5,4) NOT NULL DEFAULT 0,
  time_to_value_seconds NUMERIC(10,2),
  health_score NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  changelog TEXT,
  app_url TEXT,
  hosted_bundle_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(app_id, version)
);

CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, app_id)
);

CREATE TABLE IF NOT EXISTS saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, app_id)
);

CREATE TABLE IF NOT EXISTS follows (
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  label feedback_label NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, app_id, label)
);

CREATE TABLE IF NOT EXISTS collaboration_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  interest_type collaboration_need NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  anonymous_id TEXT,
  entered_at TIMESTAMPTZ NOT NULL,
  exited_at TIMESTAMPTZ,
  duration_seconds NUMERIC(10,2),
  interaction_count INTEGER NOT NULL DEFAULT 0,
  click_map JSONB NOT NULL DEFAULT '{}'::jsonb,
  scroll_depth NUMERIC(5,2) NOT NULL DEFAULT 0,
  time_to_value_seconds NUMERIC(10,2),
  stabilized BOOLEAN NOT NULL DEFAULT FALSE,
  entry_surface TEXT,
  entry_source TEXT,
  device_class TEXT,
  country_code TEXT,
  referrer_context TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES session_tracking(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  reason report_reason NOT NULL,
  notes TEXT,
  status mod_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  report_id UUID REFERENCES app_reports(id) ON DELETE SET NULL,
  auto_flagged BOOLEAN NOT NULL DEFAULT FALSE,
  auto_flag_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  status mod_status NOT NULL DEFAULT 'open',
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feed_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  rank_position INTEGER NOT NULL,
  source TEXT NOT NULL,
  score NUMERIC(10,4),
  seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recommendation_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  profile_vector JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_embeddings (
  app_id UUID PRIMARY KEY REFERENCES apps(id) ON DELETE CASCADE,
  feature_vector JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apps_creator_id ON apps(creator_id);
CREATE INDEX IF NOT EXISTS idx_apps_status_created_at ON apps(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id_expires_at ON user_sessions(user_id, expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_app_id_created_at ON comments(app_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collaboration_interests_app_id_created_at ON collaboration_interests(app_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_tracking_app_id_entered_at ON session_tracking(app_id, entered_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_tracking_user_id_entered_at ON session_tracking(user_id, entered_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_events_app_id_created_at ON app_events(app_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_reports_app_id_status ON app_reports(app_id, status);
CREATE INDEX IF NOT EXISTS idx_feed_impressions_user_seen_at ON feed_impressions(user_id, seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_apps_tags_gin ON apps USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_users_interests_gin ON users USING GIN(interests);
