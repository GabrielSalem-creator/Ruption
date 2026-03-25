create extension if not exists "pgcrypto";

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.current_profile_id()
returns uuid
language sql
stable
as $$
  select id
  from public.profiles
  where auth_user_id = auth.uid()
  limit 1;
$$;

create type public.app_status as enum (
  'draft',
  'pending_review',
  'active',
  'limited_distribution',
  'removed',
  'banned'
);

create type public.intent_label as enum (
  'tool',
  'agent',
  'utility',
  'experiment',
  'game'
);

create type public.app_category as enum (
  'ai_agent',
  'ai_tool',
  'workflow',
  'productivity',
  'research',
  'education',
  'developer_tool',
  'experiment'
);

create type public.feedback_type as enum (
  'confusing',
  'slow',
  'brilliant'
);

create type public.report_reason as enum (
  'phishing',
  'malware',
  'broken_embed',
  'spam',
  'abuse',
  'copyright',
  'other'
);

create type public.collaboration_type as enum (
  'developers',
  'designers',
  'funding',
  'distribution',
  'operators'
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  bio text,
  avatar_url text,
  banner_url text,
  website_url text,
  twitter_url text,
  github_url text,
  linkedin_url text,
  contact_email text,
  goal text,
  interests jsonb not null default '{}'::jsonb,
  verified boolean not null default false,
  role text not null default 'user' check (role in ('user', 'admin', 'moderator')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text not null,
  one_line_hook text not null,
  target_user text,
  problem_statement text,
  app_url text not null,
  hosted_bundle_url text,
  canonical_domain text generated always as (regexp_replace(app_url, '^https?://([^/]+).*$','\1')) stored,
  preview_image_url text,
  video_demo_url text,
  tags jsonb not null default '[]'::jsonb,
  category public.app_category not null,
  intent_label public.intent_label not null,
  resources_needed text,
  contact_info text,
  collaboration_hooks public.collaboration_type[] not null default '{}'::public.collaboration_type[],
  login_required boolean not null default false,
  status public.app_status not null default 'pending_review',
  is_verified boolean not null default false,
  version text not null default '1.0.0',
  changelog text,
  pricing_model text default 'free',
  parent_app_id uuid references public.apps(id) on delete set null,
  views_count integer not null default 0,
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  saves_count integer not null default 0,
  shares_count integer not null default 0,
  avg_session_time numeric(10,2) not null default 0,
  bounce_rate numeric(5,4) not null default 0,
  time_to_value_seconds numeric(10,2),
  health_score numeric(5,2) not null default 50,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.app_versions (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  version text not null,
  changelog text,
  app_url text,
  hosted_bundle_url text,
  created_at timestamptz not null default timezone('utc', now()),
  unique(app_id, version)
);

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  app_id uuid not null references public.apps(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, app_id)
);

create table if not exists public.saves (
  user_id uuid not null references public.profiles(id) on delete cascade,
  app_id uuid not null references public.apps(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, app_id)
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  app_id uuid not null references public.apps(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  content text not null check (char_length(content) > 0 and char_length(content) <= 1000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.app_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  app_id uuid not null references public.apps(id) on delete cascade,
  feedback_type public.feedback_type not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, app_id, feedback_type)
);

create table if not exists public.collaboration_interests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  app_id uuid not null references public.apps(id) on delete cascade,
  interest_type public.collaboration_type not null,
  message text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.app_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  app_id uuid not null references public.apps(id) on delete cascade,
  anonymous_id text,
  entered_at timestamptz not null default timezone('utc', now()),
  exited_at timestamptz,
  duration_seconds numeric(10,2),
  interaction_count integer not null default 0,
  click_map jsonb not null default '{}'::jsonb,
  scroll_depth numeric(5,2) not null default 0,
  time_to_value_seconds numeric(10,2),
  entry_surface text default 'stabilized',
  entry_source text default 'feed',
  device_class text,
  country_code text,
  referrer_context text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.app_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.app_sessions(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  app_id uuid not null references public.apps(id) on delete cascade,
  event_type text not null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.feed_impressions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  app_id uuid not null references public.apps(id) on delete cascade,
  rank_position integer not null,
  score numeric(10,4),
  source text not null default 'for_you',
  seen_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.app_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid references public.profiles(id) on delete set null,
  app_id uuid not null references public.apps(id) on delete cascade,
  reason public.report_reason not null,
  notes text,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.moderation_queue (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  report_id uuid references public.app_reports(id) on delete set null,
  auto_flagged boolean not null default false,
  auto_flag_reasons jsonb not null default '[]'::jsonb,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.recommendation_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  profile_vector jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.app_embeddings (
  app_id uuid primary key references public.apps(id) on delete cascade,
  feature_vector jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete set null,
  app_id uuid references public.apps(id) on delete cascade,
  type text not null check (type in ('new_comment', 'new_follower', 'app_verified', 'remix_created', 'collaboration_interest')),
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.create_profile_for_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (auth_user_id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1) || '_' || substring(new.id::text, 1, 6)),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (auth_user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.create_profile_for_user();

create or replace function public.sync_app_counters(target_app_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  avg_duration numeric(10,2);
  bounce numeric(5,4);
  median_ttv numeric(10,2);
begin
  select coalesce(count(*), 0) into strict avg_duration
  from public.app_sessions
  where app_id = target_app_id;

  update public.apps
  set
    likes_count = (select count(*) from public.likes where app_id = target_app_id),
    comments_count = (select count(*) from public.comments where app_id = target_app_id),
    saves_count = (select count(*) from public.saves where app_id = target_app_id),
    views_count = (select count(*) from public.feed_impressions where app_id = target_app_id),
    avg_session_time = coalesce((select avg(duration_seconds) from public.app_sessions where app_id = target_app_id and duration_seconds is not null), 0),
    bounce_rate = coalesce((
      select avg(case when coalesce(duration_seconds, 0) < 5 then 1 else 0 end)::numeric
      from public.app_sessions
      where app_id = target_app_id
    ), 0),
    time_to_value_seconds = (
      select percentile_cont(0.5) within group (order by time_to_value_seconds)
      from public.app_sessions
      where app_id = target_app_id
        and time_to_value_seconds is not null
    ),
    updated_at = timezone('utc', now())
  where id = target_app_id;
end;
$$;

create or replace function public.handle_counter_refresh()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_app_counters(coalesce(new.app_id, old.app_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists likes_counter_refresh on public.likes;
create trigger likes_counter_refresh
after insert or delete on public.likes
for each row execute procedure public.handle_counter_refresh();

drop trigger if exists saves_counter_refresh on public.saves;
create trigger saves_counter_refresh
after insert or delete on public.saves
for each row execute procedure public.handle_counter_refresh();

drop trigger if exists comments_counter_refresh on public.comments;
create trigger comments_counter_refresh
after insert or delete or update on public.comments
for each row execute procedure public.handle_counter_refresh();

drop trigger if exists sessions_counter_refresh on public.app_sessions;
create trigger sessions_counter_refresh
after insert or update or delete on public.app_sessions
for each row execute procedure public.handle_counter_refresh();

drop trigger if exists apps_updated_at on public.apps;
create trigger apps_updated_at
before update on public.apps
for each row execute procedure public.handle_updated_at();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row execute procedure public.handle_updated_at();

drop trigger if exists comments_updated_at on public.comments;
create trigger comments_updated_at
before update on public.comments
for each row execute procedure public.handle_updated_at();

drop trigger if exists reports_updated_at on public.app_reports;
create trigger reports_updated_at
before update on public.app_reports
for each row execute procedure public.handle_updated_at();

drop trigger if exists moderation_updated_at on public.moderation_queue;
create trigger moderation_updated_at
before update on public.moderation_queue
for each row execute procedure public.handle_updated_at();

create or replace function public.update_recommendation_profile(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.recommendation_profiles (user_id, profile_vector, updated_at)
  values (
    target_user_id,
    coalesce((
      select jsonb_object_agg(tag_key, weight_sum)
      from (
        select
          tag_value as tag_key,
          sum(weight)::numeric as weight_sum
        from (
          select jsonb_array_elements_text(a.tags) as tag_value, 3 as weight
          from public.likes l
          join public.apps a on a.id = l.app_id
          where l.user_id = target_user_id
          union all
          select jsonb_array_elements_text(a.tags) as tag_value, 5 as weight
          from public.saves s
          join public.apps a on a.id = s.app_id
          where s.user_id = target_user_id
          union all
          select jsonb_array_elements_text(a.tags) as tag_value, 1 as weight
          from public.app_sessions ses
          join public.apps a on a.id = ses.app_id
          where ses.user_id = target_user_id
        ) weighted_tags
        group by tag_value
      ) ranked_tags
    ), '{}'::jsonb),
    timezone('utc', now())
  )
  on conflict (user_id) do update
  set profile_vector = excluded.profile_vector,
      updated_at = excluded.updated_at;
end;
$$;

create or replace function public.get_ranked_feed(limit_count integer default 12, viewer_id uuid default null)
returns table (
  app_id uuid,
  score numeric,
  reason text
)
language sql
stable
as $$
  with viewer_profile as (
    select coalesce(profile_vector, '{}'::jsonb) as profile_vector
    from public.recommendation_profiles
    where user_id = viewer_id
  ),
  app_scores as (
    select
      a.id as app_id,
      (
        (least(coalesce(a.avg_session_time, 0) / 45.0, 1) * 0.30) +
        (least((a.likes_count + a.saves_count * 2 + a.comments_count * 2)::numeric / 100.0, 1) * 0.25) +
        ((100 - least(coalesce(a.bounce_rate, 0) * 100, 100)) / 100.0 * 0.15) +
        (least(coalesce(a.health_score, 50), 100) / 100.0 * 0.20) +
        (greatest(0.0, 1 - (extract(epoch from (timezone('utc', now()) - a.created_at)) / 604800.0)) * 0.10)
      )::numeric(10,4) as base_score
    from public.apps a
    where a.status in ('active', 'limited_distribution')
      and a.login_required = false
  )
  select
    app_scores.app_id,
    app_scores.base_score as score,
    case
      when viewer_id is null then 'quality_trending'
      else 'personalized_quality'
    end as reason
  from app_scores
  order by app_scores.base_score desc, app_scores.app_id
  limit limit_count;
$$;

alter table public.profiles enable row level security;
alter table public.apps enable row level security;
alter table public.app_versions enable row level security;
alter table public.likes enable row level security;
alter table public.saves enable row level security;
alter table public.follows enable row level security;
alter table public.comments enable row level security;
alter table public.app_feedback enable row level security;
alter table public.collaboration_interests enable row level security;
alter table public.app_sessions enable row level security;
alter table public.app_events enable row level security;
alter table public.feed_impressions enable row level security;
alter table public.app_reports enable row level security;
alter table public.moderation_queue enable row level security;
alter table public.recommendation_profiles enable row level security;
alter table public.app_embeddings enable row level security;
alter table public.notifications enable row level security;

create policy "public profiles readable"
on public.profiles for select
using (true);

create policy "users manage own profile"
on public.profiles for update
using (auth.uid() = auth_user_id);

create policy "public active apps readable"
on public.apps for select
using (status in ('active', 'limited_distribution'));

create policy "creators read own apps"
on public.apps for select
using (creator_id = public.current_profile_id());

create policy "creators create apps"
on public.apps for insert
with check (creator_id = public.current_profile_id());

create policy "creators update own apps"
on public.apps for update
using (creator_id = public.current_profile_id());

create policy "public app versions readable"
on public.app_versions for select
using (
  exists (
    select 1 from public.apps
    where apps.id = app_versions.app_id
      and apps.status in ('active', 'limited_distribution')
  )
);

create policy "creator app versions manage own"
on public.app_versions for all
using (
  exists (
    select 1 from public.apps
    where apps.id = app_versions.app_id
      and apps.creator_id = public.current_profile_id()
  )
)
with check (
  exists (
    select 1 from public.apps
    where apps.id = app_versions.app_id
      and apps.creator_id = public.current_profile_id()
  )
);

create policy "users manage own likes"
on public.likes for all
using (user_id = public.current_profile_id())
with check (user_id = public.current_profile_id());

create policy "users manage own saves"
on public.saves for all
using (user_id = public.current_profile_id())
with check (user_id = public.current_profile_id());

create policy "users manage own follows"
on public.follows for all
using (follower_id = public.current_profile_id())
with check (follower_id = public.current_profile_id());

create policy "public comments readable"
on public.comments for select
using (
  exists (
    select 1 from public.apps
    where apps.id = comments.app_id
      and apps.status in ('active', 'limited_distribution')
  )
);

create policy "users manage own comments"
on public.comments for all
using (user_id = public.current_profile_id())
with check (user_id = public.current_profile_id());

create policy "users manage own feedback"
on public.app_feedback for all
using (user_id = public.current_profile_id())
with check (user_id = public.current_profile_id());

create policy "users create collaboration interest"
on public.collaboration_interests for insert
with check (user_id = public.current_profile_id());

create policy "creators read interests on own apps"
on public.collaboration_interests for select
using (
  exists (
    select 1 from public.apps
    where apps.id = collaboration_interests.app_id
      and apps.creator_id = public.current_profile_id()
  ) or user_id = public.current_profile_id()
);

create policy "users manage own sessions"
on public.app_sessions for all
using (user_id = public.current_profile_id() or user_id is null)
with check (user_id = public.current_profile_id() or user_id is null);

create policy "users manage own app events"
on public.app_events for all
using (user_id = public.current_profile_id() or user_id is null)
with check (user_id = public.current_profile_id() or user_id is null);

create policy "users create feed impressions"
on public.feed_impressions for insert
with check (user_id = public.current_profile_id() or user_id is null);

create policy "users create reports"
on public.app_reports for insert
with check (reporter_user_id = public.current_profile_id());

create policy "users read own recommendation profile"
on public.recommendation_profiles for select
using (user_id = public.current_profile_id());

create policy "users read own notifications"
on public.notifications for select
using (user_id = public.current_profile_id());

create policy "users update own notifications"
on public.notifications for update
using (user_id = public.current_profile_id());

create index if not exists idx_profiles_auth_user_id on public.profiles(auth_user_id);
create index if not exists idx_apps_creator_id on public.apps(creator_id);
create index if not exists idx_apps_status_created_at on public.apps(status, created_at desc);
create index if not exists idx_apps_tags_gin on public.apps using gin(tags);
create index if not exists idx_comments_app_id_created_at on public.comments(app_id, created_at desc);
create index if not exists idx_app_sessions_app_id_entered_at on public.app_sessions(app_id, entered_at desc);
create index if not exists idx_feed_impressions_app_id_seen_at on public.feed_impressions(app_id, seen_at desc);
create index if not exists idx_notifications_user_created_at on public.notifications(user_id, created_at desc);
