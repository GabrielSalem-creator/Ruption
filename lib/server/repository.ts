import { appConfig, hasDatabase } from "@/lib/env";
import { FeedItem, InterestVector, PreflightResult, Profile } from "@/lib/types";
import { ensureBootstrap } from "@/lib/server/bootstrap";
import { getSql } from "@/lib/server/db";
import { createSessionToken, getSessionUser, hashPassword, verifyPassword } from "@/lib/server/auth";
import { cookies } from "next/headers";
import { currentViewerInterests, getAppBySlug as getMockAppBySlug, getAppsByProfile as getMockAppsByProfile, getProfileByUsername as getMockProfileByUsername } from "@/lib/mock-data";
import { rankApps } from "@/lib/recommendation";

function normalize(value: number, max: number) {
  if (max <= 0) return 0;
  return Math.min(value / max, 1);
}

function cosineSimilarity(a: InterestVector, b: InterestVector) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (const key of keys) {
    const av = a[key] ?? 0;
    const bv = b[key] ?? 0;
    dot += av * bv;
    magA += av * av;
    magB += bv * bv;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (!value) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

function buildReasons(item: FeedItem, similarity: number) {
  const reasons: string[] = [];
  if (similarity > 0.7) reasons.push(`High semantic match for ${item.tags[0]}`);
  if (item.stats.timeToValueSeconds <= 3) reasons.push("Fast time-to-value");
  if (item.stats.avgSessionTimeSeconds >= 40) reasons.push("Strong session depth");
  if (item.isVerified) reasons.push("Verified quality signal");
  if (item.collaboration.lookingForDevs) reasons.push("Open to collaboration");
  return reasons.slice(0, 3);
}

function buildInterestVector(item: FeedItem): InterestVector {
  const vector: InterestVector = { [item.category]: 0.82, [item.intentLabel]: 0.4 };
  item.tags.forEach((tag) => (vector[tag] = Math.max(vector[tag] ?? 0, 0.72)));
  const keywords = `${item.description} ${item.whatItDoes}`.toLowerCase();
  if (keywords.includes("agent")) vector.agent = Math.max(vector.agent ?? 0, 0.76);
  if (keywords.includes("copy")) vector.copy = Math.max(vector.copy ?? 0, 0.72);
  if (keywords.includes("workflow")) vector.workflow = Math.max(vector.workflow ?? 0, 0.72);
  if (keywords.includes("planning")) vector.planning = Math.max(vector.planning ?? 0, 0.74);
  if (keywords.includes("prompt")) vector.prompt = Math.max(vector.prompt ?? 0, 0.78);
  return vector;
}

function rankRows(items: FeedItem[]) {
  const maxSession = Math.max(...items.map((app) => app.stats.avgSessionTimeSeconds || 0), 1);
  const maxLikes = Math.max(...items.map((app) => app.stats.likes || 0), 1);

  return items
    .map((app) => {
      const similarity = cosineSimilarity(currentViewerInterests, buildInterestVector(app));
      const normalizedSession = normalize(app.stats.avgSessionTimeSeconds, maxSession);
      const interactionScore = normalize(app.stats.likes, maxLikes) * 0.55 + (1 - app.stats.bounceRate) * 0.45;
      const qualityScore = app.stats.healthScore / 100;
      const explorationFactor = app.intentLabel === "experiment" ? 0.12 : 0.06;
      const recommendationScore = normalizedSession * 0.22 + interactionScore * 0.2 + similarity * 0.22 + 0.92 * 0.12 + qualityScore * 0.18 + explorationFactor * 0.06;
      return { ...app, recommendationScore, reasons: buildReasons(app, similarity) } satisfies FeedItem;
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore);
}

function rowToProfile(row: Record<string, unknown>, stats?: Profile["stats"]): Profile {
  return {
    id: String(row.id),
    username: String(row.username),
    displayName: String(row.display_name),
    bio: String(row.bio ?? ""),
    goal: String(row.goal ?? ""),
    avatarGradient: String(row.avatar_gradient),
    bannerGradient: String(row.banner_gradient),
    websiteUrl: row.website_url ? String(row.website_url) : undefined,
    twitterUrl: row.twitter_url ? String(row.twitter_url) : undefined,
    githubUrl: row.github_url ? String(row.github_url) : undefined,
    contactEmail: String(row.contact_email),
    nicheFocus: String(row.niche_focus ?? appConfig.niche),
    verified: Boolean(row.verified),
    stats: stats ?? { followers: 0, following: 0, totalViews: 0, avgSessionTimeSeconds: 0, apps: 0 },
  };
}

function rowToApp(row: Record<string, unknown>, creator: Profile): FeedItem {
  const tags = parseJson<string[]>(row.tags, []);
  const collaboration = parseJson<Record<string, boolean>>(row.collaboration, {});
  const stats = parseJson<Record<string, number>>(row.stats, {});
  const theme = parseJson<Record<string, string>>(row.theme, {});

  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    hook: String(row.hook),
    description: String(row.description),
    appUrl: String(row.app_url),
    runtimeSlug: String(row.runtime_slug),
    hostedBundleUrl: null,
    previewImageUrl: null,
    videoDemoUrl: null,
    previewMode: (row.preview_mode as FeedItem["previewMode"]) ?? "snapshot",
    tags,
    category: row.category as FeedItem["category"],
    intentLabel: row.intent_label as FeedItem["intentLabel"],
    resourcesNeeded: String(row.resources_needed ?? ""),
    contactInfo: String(row.contact_info ?? ""),
    whoItsFor: String(row.who_its_for ?? ""),
    whatItDoes: String(row.what_it_does ?? ""),
    isVerified: Boolean(row.is_verified),
    creator,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
    version: String(row.version ?? "0.1.0"),
    changelog: String(row.changelog ?? ""),
    collaboration: {
      lookingForDevs: Boolean(collaboration.lookingForDevs),
      lookingForDesigners: Boolean(collaboration.lookingForDesigners),
      lookingForFunding: Boolean(collaboration.lookingForFunding),
    },
    stats: {
      views: Number(stats.views ?? 0),
      likes: Number(stats.likes ?? 0),
      comments: Number(stats.comments ?? 0),
      saves: Number(stats.saves ?? 0),
      avgSessionTimeSeconds: Number(stats.avgSessionTimeSeconds ?? 0),
      bounceRate: Number(stats.bounceRate ?? 0),
      timeToValueSeconds: Number(stats.timeToValueSeconds ?? 0),
      healthScore: Number(stats.healthScore ?? 0),
    },
    theme: {
      accent: String(theme.accent ?? "#8b5cf6"),
      surface: String(theme.surface ?? "linear-gradient(135deg, rgba(59,130,246,0.45), rgba(124,58,237,0.55), rgba(15,23,42,0.96))"),
      panel: String(theme.panel ?? "rgba(15, 23, 42, 0.72)"),
    },
    recommendationScore: 0,
    reasons: [],
  };
}

export async function getSession() {
  return getSessionUser();
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(appConfig.authCookieName);
}

export async function loginUser(email: string, password: string) {
  if (!hasDatabase()) return null;
  await ensureBootstrap();
  const sql = getSql();
  const rows = await sql`SELECT id, username, email, display_name, password_hash FROM users WHERE email = ${email} LIMIT 1`;
  if (rows.length === 0) return null;
  const row = rows[0] as Record<string, unknown>;
  const ok = await verifyPassword(password, String(row.password_hash));
  if (!ok) return null;
  const token = await createSessionToken({ id: String(row.id), username: String(row.username), email: String(row.email), displayName: String(row.display_name) });
  const cookieStore = await cookies();
  cookieStore.set(appConfig.authCookieName, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return { id: String(row.id), username: String(row.username), email: String(row.email), displayName: String(row.display_name) };
}

export async function registerUser(payload: { username: string; email: string; password: string; displayName: string }) {
  if (!hasDatabase()) return null;
  await ensureBootstrap();
  const sql = getSql();
  const existing = await sql`SELECT id FROM users WHERE email = ${payload.email} OR username = ${payload.username} LIMIT 1`;
  if (existing.length > 0) {
    throw new Error("User already exists.");
  }
  const passwordHash = await hashPassword(payload.password);
  const inserted = await sql`
    INSERT INTO users (
      username, email, password_hash, display_name, bio, goal,
      avatar_gradient, banner_gradient, contact_email, niche_focus, verified
    ) VALUES (
      ${payload.username}, ${payload.email}, ${passwordHash}, ${payload.displayName}, '', '',
      'linear-gradient(135deg, #8b5cf6, #3b82f6)',
      'linear-gradient(135deg, rgba(59,130,246,0.5), rgba(124,58,237,0.55), rgba(15,23,42,0.82))',
      ${payload.email}, ${appConfig.niche}, false
    ) RETURNING id, username, email, display_name
  `;
  const row = inserted[0] as Record<string, unknown>;
  const token = await createSessionToken({ id: String(row.id), username: String(row.username), email: String(row.email), displayName: String(row.display_name) });
  const cookieStore = await cookies();
  cookieStore.set(appConfig.authCookieName, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return { id: String(row.id), username: String(row.username), email: String(row.email), displayName: String(row.display_name) };
}

export async function listFeedItems() {
  if (!hasDatabase()) return rankApps();
  await ensureBootstrap();
  const sql = getSql();
  const rows = await sql`
    SELECT a.*, u.id as creator_id_joined, u.username, u.email, u.display_name, u.bio, u.goal,
      u.avatar_gradient, u.banner_gradient, u.website_url, u.twitter_url, u.github_url,
      u.contact_email, u.niche_focus, u.verified
    FROM apps_runtime a
    JOIN users u ON u.id = a.creator_id
    ORDER BY a.created_at DESC
  `;

  const items = rows.map((row) => {
    const creator = rowToProfile(row as Record<string, unknown>, {
      followers: 0,
      following: 0,
      totalViews: 0,
      avgSessionTimeSeconds: 0,
      apps: 0,
    });
    return rowToApp(row as Record<string, unknown>, creator);
  });

  return rankRows(items);
}

export async function getAppBySlug(slug: string) {
  const items = await listFeedItems();
  return items.find((item) => item.slug === slug || item.runtimeSlug === slug) ?? getMockAppBySlug(slug);
}

export async function getProfileByUsername(username: string) {
  if (!hasDatabase()) return getMockProfileByUsername(username) ?? null;
  await ensureBootstrap();
  const sql = getSql();
  const rows = await sql`SELECT * FROM users WHERE username = ${username} LIMIT 1`;
  if (rows.length === 0) return null;
  const apps = await getAppsByProfile(username);
  const totalViews = apps.reduce((sum, app) => sum + app.stats.views, 0);
  const avgSessionTimeSeconds = apps.length ? Math.round(apps.reduce((sum, app) => sum + app.stats.avgSessionTimeSeconds, 0) / apps.length) : 0;
  return rowToProfile(rows[0] as Record<string, unknown>, {
    followers: 0,
    following: 0,
    totalViews,
    avgSessionTimeSeconds,
    apps: apps.length,
  });
}

export async function getAppsByProfile(username: string) {
  const items = await listFeedItems();
  return items.filter((item) => item.creator.username === username) ?? getMockAppsByProfile(username);
}

export async function createApp(payload: {
  title: string;
  hook: string;
  description: string;
  appUrl: string;
  tags: string[];
  category: FeedItem["category"];
  intentLabel: FeedItem["intentLabel"];
  whatItDoes: string;
  whoItsFor: string;
  resourcesNeeded: string;
  contactInfo: string;
  lookingForDevs: boolean;
  lookingForDesigners: boolean;
  lookingForFunding: boolean;
  previewMode: FeedItem["previewMode"];
  preflight: PreflightResult;
}) {
  if (!hasDatabase()) {
    throw new Error("DATABASE_URL is required to create persistent apps.");
  }

  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  await ensureBootstrap();
  const sql = getSql();
  const slug = payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `app-${Date.now()}`;
  const inserted = await sql`
    INSERT INTO apps_runtime (
      creator_id, slug, title, hook, description, app_url, runtime_slug, preview_mode,
      tags, category, intent_label, resources_needed, contact_info, who_its_for,
      what_it_does, is_verified, version, changelog, collaboration, stats, theme
    ) VALUES (
      ${user.id}, ${slug}, ${payload.title}, ${payload.hook}, ${payload.description}, ${payload.appUrl},
      'prompt-studio', ${payload.previewMode}, ${JSON.stringify(payload.tags)}, ${payload.category}, ${payload.intentLabel},
      ${payload.resourcesNeeded}, ${payload.contactInfo}, ${payload.whoItsFor}, ${payload.whatItDoes}, false,
      '0.1.0', 'Initial published version.',
      ${JSON.stringify({ lookingForDevs: payload.lookingForDevs, lookingForDesigners: payload.lookingForDesigners, lookingForFunding: payload.lookingForFunding })},
      ${JSON.stringify({ views: 0, likes: 0, comments: 0, saves: 0, avgSessionTimeSeconds: 0, bounceRate: 0, timeToValueSeconds: Math.ceil(payload.preflight.medianLoadTimeMs / 1000), healthScore: payload.preflight.verdict === "pass" ? 86 : 70 })},
      ${JSON.stringify({ accent: "#22c55e", surface: "linear-gradient(135deg, rgba(34,197,94,0.28), rgba(15,23,42,0.92), rgba(59,130,246,0.2))", panel: "rgba(21, 128, 61, 0.2)" })}
    ) RETURNING *
  `;

  return getAppBySlug(String(inserted[0].slug));
}
