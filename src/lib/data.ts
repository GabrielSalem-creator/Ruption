import { fallbackFeed, fallbackProfiles } from "@/lib/static-data";
import { FeedItem, Profile } from "@/lib/types";
import { hasSupabase } from "@/lib/env";
import { supabase } from "@/lib/supabase";

function mapProfile(row: Record<string, any>): Profile {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    bio: row.bio ?? "",
    goal: row.goal ?? "",
    avatarGradient: row.avatar_gradient,
    bannerGradient: row.banner_gradient,
    websiteUrl: row.website_url,
    twitterUrl: row.twitter_url,
    githubUrl: row.github_url,
    contactEmail: row.contact_email,
    nicheFocus: row.niche_focus,
    verified: row.verified,
    stats: {
      followers: row.followers ?? 0,
      following: row.following ?? 0,
      totalViews: row.total_views ?? 0,
      avgSessionTimeSeconds: row.avg_session_time_seconds ?? 0,
      apps: row.apps_count ?? 0,
    },
  };
}

function mapApp(row: Record<string, any>): FeedItem {
  const creatorPayload = row.creator_profile ?? {
    id: row.creator_id,
    username: row.creator_username,
    display_name: row.creator_display_name,
    bio: row.creator_bio,
    goal: row.creator_goal,
    avatar_gradient: row.creator_avatar_gradient,
    banner_gradient: row.creator_banner_gradient,
    website_url: row.creator_website_url,
    twitter_url: row.creator_twitter_url,
    github_url: row.creator_github_url,
    contact_email: row.creator_contact_email,
    niche_focus: row.creator_niche_focus,
    verified: row.creator_verified,
    followers: 0,
    following: 0,
    total_views: 0,
    avg_session_time_seconds: 0,
    apps_count: 0,
  };

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    hook: row.hook,
    description: row.description,
    appUrl: row.app_url,
    runtimeSlug: row.runtime_slug,
    previewMode: row.preview_mode,
    tags: row.tags ?? [],
    category: row.category,
    intentLabel: row.intent_label,
    resourcesNeeded: row.resources_needed ?? "",
    contactInfo: row.contact_info ?? "",
    whoItsFor: row.who_its_for ?? "",
    whatItDoes: row.what_it_does ?? "",
    isVerified: row.is_verified ?? false,
    creator: mapProfile(creatorPayload),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    version: row.version ?? "0.1.0",
    changelog: row.changelog ?? "",
    collaboration: row.collaboration ?? { lookingForDevs: false, lookingForDesigners: false, lookingForFunding: false },
    stats: row.stats ?? { views: 0, likes: 0, comments: 0, saves: 0, avgSessionTimeSeconds: 0, bounceRate: 0, timeToValueSeconds: 0, healthScore: 0 },
    theme: row.theme ?? { accent: "#8b5cf6", surface: "linear-gradient(135deg, rgba(59,130,246,0.45), rgba(124,58,237,0.55), rgba(15,23,42,0.96))", panel: "rgba(15, 23, 42, 0.72)" },
    recommendationScore: row.recommendation_score ?? 0.7,
    reasons: row.reasons ?? ["Freshly loaded from backend"],
  };
}

export async function listFeedItems(): Promise<FeedItem[]> {
  if (!hasSupabase() || !supabase) return fallbackFeed;
  const { data, error } = await supabase.from("feed_items").select("*").order("recommendation_score", { ascending: false });
  if (error || !data) return fallbackFeed;
  return data.map((row) => mapApp(row as Record<string, any>));
}

export async function getAppBySlug(slug: string): Promise<FeedItem | null> {
  if (!hasSupabase() || !supabase) return fallbackFeed.find((item) => item.slug === slug) ?? null;
  const { data, error } = await supabase.from("feed_items").select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return fallbackFeed.find((item) => item.slug === slug) ?? null;
  return mapApp(data as Record<string, any>);
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  if (!hasSupabase() || !supabase) return fallbackProfiles.find((item) => item.username === username) ?? null;
  const { data, error } = await supabase.from("profiles_public").select("*").eq("username", username).maybeSingle();
  if (error || !data) return fallbackProfiles.find((item) => item.username === username) ?? null;
  return mapProfile(data as Record<string, any>);
}

export async function getAppsByProfile(username: string): Promise<FeedItem[]> {
  if (!hasSupabase() || !supabase) return fallbackFeed.filter((item) => item.creator.username === username);
  const { data, error } = await supabase.from("feed_items").select("*").eq("creator_username", username).order("created_at", { ascending: false });
  if (error || !data) return fallbackFeed.filter((item) => item.creator.username === username);
  return data.map((row) => mapApp(row as Record<string, any>));
}
