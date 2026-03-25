CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_status') THEN
        CREATE TYPE app_status AS ENUM ('draft', 'pending_review', 'active', 'rejected', 'banned', 'archived');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_category') THEN
        CREATE TYPE app_category AS ENUM ('ai_tool', 'agent', 'productivity', 'developer_tool', 'design_tool', 'education', 'experiment', 'utility');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'intent_label') THEN
        CREATE TYPE intent_label AS ENUM ('tool', 'game', 'experiment', 'utility');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feedback_label') THEN
        CREATE TYPE feedback_label AS ENUM ('confusing', 'slow', 'brilliant');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'collaboration_type') THEN
        CREATE TYPE collaboration_type AS ENUM ('developer', 'designer', 'funding', 'growth', 'operator');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_reason') THEN
        CREATE TYPE report_reason AS ENUM (
            'phishing',
            'malware',
            'malicious',
            'spam',
            'broken',
            'abuse',
            'impersonation',
            'login_wall',
            'adult_content',
            'hateful_content',
            'other'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_status') THEN
        CREATE TYPE report_status AS ENUM ('open', 'reviewing', 'resolved', 'dismissed');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(32) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    website_url TEXT,
    twitter_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    contact_email TEXT,
    niche_focus TEXT,
    goal TEXT,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(140) NOT NULL,
    slug VARCHAR(160) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    hook TEXT NOT NULL,
    app_url TEXT NOT NULL,
    canonical_url TEXT,
    hosted_bundle_url TEXT,
    preview_image_url TEXT,
    video_demo_url TEXT,
    repository_url TEXT,
    docs_url TEXT,
    support_url TEXT,
    category app_category NOT NULL,
    intent intent_label NOT NULL,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    required_resources TEXT,
    contact_info TEXT,
    target_user TEXT,
    pricing_note TEXT,
    preview_mode VARCHAR(24) NOT NULL DEFAULT 'snapshot',
    current_version VARCHAR(32),
    time_to_value_ms INTEGER,
    average_load_time_ms INTEGER,
    bounce_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
    average_session_time_seconds INTEGER NOT NULL DEFAULT 0,
    views_count INTEGER NOT NULL DEFAULT 0,
    likes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    saves_count INTEGER NOT NULL DEFAULT 0,
    share_count INTEGER NOT NULL DEFAULT 0,
    stabilize_enters_count INTEGER NOT NULL DEFAULT 0,
    broken_embed_count INTEGER NOT NULL DEFAULT 0,
    quality_score NUMERIC(6,3) NOT NULL DEFAULT 0,
    health_score NUMERIC(6,3) NOT NULL DEFAULT 0,
    status app_status NOT NULL DEFAULT 'draft',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    has_login_wall BOOLEAN NOT NULL DEFAULT FALSE,
    allow_embed BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apps_creator_id ON apps(creator_id);
CREATE INDEX IF NOT EXISTS idx_apps_status_created_at ON apps(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category);
CREATE INDEX IF NOT EXISTS idx_apps_tags ON apps USING GIN(tags);

CREATE TABLE IF NOT EXISTS app_preflight_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    http_status_code INTEGER,
    dns_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    https_available BOOLEAN NOT NULL DEFAULT FALSE,
    iframe_compatible BOOLEAN NOT NULL DEFAULT FALSE,
    median_load_time_ms INTEGER,
    mobile_smoke_passed BOOLEAN NOT NULL DEFAULT FALSE,
    login_wall_detected BOOLEAN NOT NULL DEFAULT FALSE,
    suspicious_script_detected BOOLEAN NOT NULL DEFAULT FALSE,
    preview_image_generated BOOLEAN NOT NULL DEFAULT FALSE,
    error_summary TEXT,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_preflight_checks_app_id_checked_at
    ON app_preflight_checks(app_id, checked_at DESC);

CREATE TABLE IF NOT EXISTS app_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    version VARCHAR(32) NOT NULL,
    changelog TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (app_id, version)
);

CREATE TABLE IF NOT EXISTS app_collaboration_hooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    type collaboration_type NOT NULL,
    details TEXT,
    is_open BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_remix_lineage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    derived_app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (source_app_id, derived_app_id)
);

CREATE TABLE IF NOT EXISTS follows (
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id <> following_id)
);

CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, app_id)
);

CREATE TABLE IF NOT EXISTS saves (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, app_id)
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

CREATE INDEX IF NOT EXISTS idx_comments_app_id_created_at ON comments(app_id, created_at DESC);

CREATE TABLE IF NOT EXISTS app_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    label feedback_label NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_feedback_app_id ON app_feedback(app_id);

CREATE TABLE IF NOT EXISTS app_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    entered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    exited_at TIMESTAMPTZ,
    duration_ms INTEGER,
    interaction_count INTEGER NOT NULL DEFAULT 0,
    click_map JSONB NOT NULL DEFAULT '{}'::jsonb,
    scroll_depth NUMERIC(5,2) NOT NULL DEFAULT 0,
    meaningful_action_at_ms INTEGER,
    stabilized BOOLEAN NOT NULL DEFAULT FALSE,
    load_time_ms INTEGER,
    had_error BOOLEAN NOT NULL DEFAULT FALSE,
    device_type VARCHAR(24),
    referrer_source VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_app_sessions_app_id_entered_at ON app_sessions(app_id, entered_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_sessions_user_id_entered_at ON app_sessions(user_id, entered_at DESC);

CREATE TABLE IF NOT EXISTS session_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES app_sessions(id) ON DELETE CASCADE,
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(64) NOT NULL,
    event_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_session_events_session_id_event_at
    ON session_events(session_id, event_at ASC);

CREATE TABLE IF NOT EXISTS recommendation_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    interest_vector JSONB NOT NULL DEFAULT '{}'::jsonb,
    last_recomputed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_vectors (
    app_id UUID PRIMARY KEY REFERENCES apps(id) ON DELETE CASCADE,
    feature_vector JSONB NOT NULL DEFAULT '{}'::jsonb,
    embedding_source TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    reason report_reason NOT NULL,
    details TEXT,
    status report_status NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_app_reports_status_created_at ON app_reports(status, created_at DESC);

CREATE TABLE IF NOT EXISTS moderation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(64) NOT NULL,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at
    ON notifications(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS creator_dashboard_daily_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    impressions INTEGER NOT NULL DEFAULT 0,
    opens INTEGER NOT NULL DEFAULT 0,
    stabilized_sessions INTEGER NOT NULL DEFAULT 0,
    avg_session_time_seconds INTEGER NOT NULL DEFAULT 0,
    bounce_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
    completion_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
    join_clicks INTEGER NOT NULL DEFAULT 0,
    support_clicks INTEGER NOT NULL DEFAULT 0,
    feedback_brilliant_count INTEGER NOT NULL DEFAULT 0,
    feedback_confusing_count INTEGER NOT NULL DEFAULT 0,
    feedback_slow_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (app_id, metric_date)
);
