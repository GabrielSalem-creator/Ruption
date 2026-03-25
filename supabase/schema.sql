-- Security-first schema for Rupture on Supabase
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  bio text not null default '',
  goal text not null default '',
  avatar_gradient text not null default 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
  banner_gradient text not null default 'linear-gradient(135deg, rgba(59,130,246,0.5), rgba(124,58,237,0.55), rgba(15,23,42,0.82))',
  website_url text,
  twitter_url text,
  github_url text,
  contact_email text not null default '',
  niche_focus text not null default 'AI tools for builders and creators',
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  slug text unique not null,
  title text not null,
  hook text not null,
  description text not null,
  app_url text not null,
  runtime_slug text not null default 'prompt-studio',
  preview_mode text not null check (preview_mode in ('snapshot','static','sandbox')),
  tags jsonb not null default '[]'::jsonb,
  category text not null,
  intent_label text not null,
  resources_needed text not null default '',
  contact_info text not null default '',
  who_its_for text not null default '',
  what_it_does text not null default '',
  is_verified boolean not null default false,
  version text not null default '0.1.0',
  changelog text not null default '',
  collaboration jsonb not null default '{}'::jsonb,
  stats jsonb not null default '{"views":0,"likes":0,"comments":0,"saves":0,"avgSessionTimeSeconds":0,"bounceRate":0,"timeToValueSeconds":0,"healthScore":0}'::jsonb,
  theme jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active','pending','banned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name, contact_email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1) || '-' || substr(new.id::text, 1, 6)),
    coalesce(new.raw_user_meta_data->>'display_name', coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.apps enable row level security;

create policy "public can read profiles"
on public.profiles
for select
using (true);

create policy "users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "public can read active apps"
on public.apps
for select
using (status = 'active');

create policy "owners can update own apps"
on public.apps
for update
using (auth.uid() = creator_id)
with check (auth.uid() = creator_id);

create policy "owners can delete own apps"
on public.apps
for delete
using (auth.uid() = creator_id);

create or replace function public.slugify(value text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(value, '')), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.create_app_secure(
  title text,
  hook text,
  description text,
  app_url text,
  runtime_slug text,
  preview_mode text,
  tags jsonb,
  category text,
  intent_label text,
  resources_needed text,
  contact_info text,
  who_its_for text,
  what_it_does text,
  collaboration jsonb,
  preflight_result jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile public.profiles%rowtype;
  v_slug text;
  v_inserted public.apps%rowtype;
  v_theme jsonb := jsonb_build_object(
    'accent', '#22c55e',
    'surface', 'linear-gradient(135deg, rgba(34,197,94,0.28), rgba(15,23,42,0.92), rgba(59,130,246,0.2))',
    'panel', 'rgba(21, 128, 61, 0.2)'
  );
  v_stats jsonb := jsonb_build_object(
    'views', 0,
    'likes', 0,
    'comments', 0,
    'saves', 0,
    'avgSessionTimeSeconds', 0,
    'bounceRate', 0,
    'timeToValueSeconds', greatest(1, ceil(coalesce((preflight_result->>'medianLoadTimeMs')::numeric, 1800) / 1000.0)),
    'healthScore', case when coalesce(preflight_result->>'verdict', 'review') = 'pass' then 86 else 70 end
  );
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select * into v_profile from public.profiles where id = v_user_id;
  if not found then
    raise exception 'Profile not found';
  end if;

  if coalesce(preflight_result->>'hasLoginWallRisk', 'false') = 'true' then
    raise exception 'Login-wall apps are not allowed';
  end if;

  if coalesce((preflight_result->>'medianLoadTimeMs')::int, 999999) > 2000 then
    raise exception 'App exceeds 2 second load target';
  end if;

  v_slug := public.slugify(title);
  if v_slug = '' then
    raise exception 'Invalid title';
  end if;

  if exists(select 1 from public.apps where slug = v_slug) then
    v_slug := v_slug || '-' || substr(gen_random_uuid()::text, 1, 6);
  end if;

  insert into public.apps (
    creator_id, slug, title, hook, description, app_url, runtime_slug, preview_mode,
    tags, category, intent_label, resources_needed, contact_info, who_its_for,
    what_it_does, collaboration, stats, theme, status
  ) values (
    v_user_id, v_slug, title, hook, description, app_url, runtime_slug, preview_mode,
    coalesce(tags, '[]'::jsonb), category, intent_label, coalesce(resources_needed, ''),
    coalesce(contact_info, ''), coalesce(who_its_for, ''), coalesce(what_it_does, ''),
    coalesce(collaboration, '{}'::jsonb), v_stats, v_theme, 'active'
  ) returning * into v_inserted;

  return (
    select jsonb_build_object(
      'id', v_inserted.id,
      'slug', v_inserted.slug,
      'title', v_inserted.title,
      'hook', v_inserted.hook,
      'description', v_inserted.description,
      'appUrl', v_inserted.app_url,
      'runtimeSlug', v_inserted.runtime_slug,
      'previewMode', v_inserted.preview_mode,
      'tags', v_inserted.tags,
      'category', v_inserted.category,
      'intentLabel', v_inserted.intent_label,
      'resourcesNeeded', v_inserted.resources_needed,
      'contactInfo', v_inserted.contact_info,
      'whoItsFor', v_inserted.who_its_for,
      'whatItDoes', v_inserted.what_it_does,
      'isVerified', v_inserted.is_verified,
      'creator', jsonb_build_object(
        'id', v_profile.id,
        'username', v_profile.username,
        'displayName', v_profile.display_name,
        'bio', v_profile.bio,
        'goal', v_profile.goal,
        'avatarGradient', v_profile.avatar_gradient,
        'bannerGradient', v_profile.banner_gradient,
        'websiteUrl', v_profile.website_url,
        'twitterUrl', v_profile.twitter_url,
        'githubUrl', v_profile.github_url,
        'contactEmail', v_profile.contact_email,
        'nicheFocus', v_profile.niche_focus,
        'verified', v_profile.verified,
        'stats', jsonb_build_object('followers', 0, 'following', 0, 'totalViews', 0, 'avgSessionTimeSeconds', 0, 'apps', 1)
      ),
      'createdAt', v_inserted.created_at,
      'updatedAt', v_inserted.updated_at,
      'version', v_inserted.version,
      'changelog', v_inserted.changelog,
      'collaboration', v_inserted.collaboration,
      'stats', v_inserted.stats,
      'theme', v_inserted.theme,
      'recommendationScore', 0.79,
      'reasons', jsonb_build_array('Fresh submission', 'Preflight checked', 'Matches launch niche')
    )
  );
end;
$$;

revoke all on function public.create_app_secure(text,text,text,text,text,text,jsonb,text,text,text,text,text,text,jsonb,jsonb) from public;
grant execute on function public.create_app_secure(text,text,text,text,text,text,jsonb,text,text,text,text,text,text,jsonb,jsonb) to authenticated;

create or replace view public.profiles_public as
select
  p.id,
  p.username,
  p.display_name,
  p.bio,
  p.goal,
  p.avatar_gradient,
  p.banner_gradient,
  p.website_url,
  p.twitter_url,
  p.github_url,
  p.contact_email,
  p.niche_focus,
  p.verified,
  0::int as followers,
  0::int as following,
  coalesce(sum((a.stats->>'views')::int), 0)::int as total_views,
  coalesce(avg((a.stats->>'avgSessionTimeSeconds')::numeric), 0)::int as avg_session_time_seconds,
  count(a.id)::int as apps_count
from public.profiles p
left join public.apps a on a.creator_id = p.id and a.status = 'active'
group by p.id;

create or replace view public.feed_items as
select
  a.id,
  a.slug,
  a.title,
  a.hook,
  a.description,
  a.app_url,
  a.runtime_slug,
  a.preview_mode,
  a.tags,
  a.category,
  a.intent_label,
  a.resources_needed,
  a.contact_info,
  a.who_its_for,
  a.what_it_does,
  a.is_verified,
  a.version,
  a.changelog,
  a.collaboration,
  a.stats,
  a.theme,
  a.created_at,
  a.updated_at,
  p.username as creator_username,
  case when a.is_verified then 0.95 else 0.78 end as recommendation_score,
  case when a.is_verified then array['Verified quality signal','Fast time-to-value','Live runtime ready'] else array['Fresh submission','Live runtime ready','Cold-start boost'] end as reasons,
  jsonb_build_object(
    'id', p.id,
    'username', p.username,
    'display_name', p.display_name,
    'bio', p.bio,
    'goal', p.goal,
    'avatar_gradient', p.avatar_gradient,
    'banner_gradient', p.banner_gradient,
    'website_url', p.website_url,
    'twitter_url', p.twitter_url,
    'github_url', p.github_url,
    'contact_email', p.contact_email,
    'niche_focus', p.niche_focus,
    'verified', p.verified,
    'followers', 0,
    'following', 0,
    'total_views', 0,
    'avg_session_time_seconds', 0,
    'apps_count', 0
  ) as creator_profile
from public.apps a
join public.profiles p on p.id = a.creator_id
where a.status = 'active';

grant select on public.profiles_public to anon, authenticated;
grant select on public.feed_items to anon, authenticated;
