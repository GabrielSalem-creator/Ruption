import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const { Client } = pg;

function getConnectionString() {
  return process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
}

function getProjectUrl() {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
}

function getServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
}

function getSupabaseAdmin() {
  const projectUrl = getProjectUrl();
  const serviceKey = getServiceKey();
  if (!projectUrl || !serviceKey) {
    throw new Error('Missing Supabase server configuration');
  }

  return createClient(projectUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function getSupabaseUser(accessToken: string) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.getUser(accessToken);
  if (error || !data.user) {
    throw new Error(error?.message ?? 'Invalid or expired session');
  }

  return {
    id: data.user.id,
    email: data.user.email,
    user_metadata: {
      username: data.user.user_metadata?.username as string | undefined,
      display_name: data.user.user_metadata?.display_name as string | undefined,
    },
  } as {
    id: string;
    email?: string;
    user_metadata?: { username?: string; display_name?: string };
  };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function ensureProfile(
  client: pg.Client,
  input: { userId: string; username: string; displayName: string; email: string },
) {
  const existing = await client.query(
    'select id, username, display_name, contact_email from public.profiles where id = $1 limit 1',
    [input.userId],
  );

  if (existing.rowCount && existing.rows[0]) {
    await client.query(
      `
      update public.profiles
      set display_name = $2,
          contact_email = $3,
          updated_at = now()
      where id = $1
      `,
      [input.userId, input.displayName, input.email],
    );

    return {
      username: String(existing.rows[0].username),
      displayName: String(existing.rows[0].display_name),
      email: String(existing.rows[0].contact_email ?? input.email),
    };
  }

  let candidateUsername = input.username;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await client.query(
        `
        insert into public.profiles (id, username, display_name, contact_email)
        values ($1, $2, $3, $4)
        `,
        [input.userId, candidateUsername, input.displayName, input.email],
      );

      return {
        username: candidateUsername,
        displayName: input.displayName,
        email: input.email,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (!message.includes('profiles_username_key')) {
        throw error;
      }

      candidateUsername = `${input.username}-${Math.random().toString(36).slice(2, 8)}`;
    }
  }

  throw new Error('Could not create a unique profile username');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const connectionString = getConnectionString();
  if (!connectionString) {
    return res.status(500).json({ error: 'Missing Postgres connection string' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  const accessToken = authHeader.slice('Bearer '.length);
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    const user = await getSupabaseUser(accessToken);
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {});
    const title = String(payload.title ?? '').trim();
    const hook = String(payload.hook ?? '').trim();
    const description = String(payload.description ?? '').trim();
    const appUrl = String(payload.app_url ?? '').trim();
    const runtimeSlug = String(payload.runtime_slug ?? 'prompt-studio').trim();
    const previewMode = String(payload.preview_mode ?? 'static').trim();
    const tags = Array.isArray(payload.tags) ? payload.tags : [];
    const category = String(payload.category ?? 'ai_tool').trim();
    const intentLabel = String(payload.intent_label ?? 'tool').trim();
    const resourcesNeeded = String(payload.resources_needed ?? '').trim();
    const contactInfo = String(payload.contact_info ?? '').trim();
    const whoItsFor = String(payload.who_its_for ?? '').trim();
    const whatItDoes = String(payload.what_it_does ?? '').trim();
    const collaboration = payload.collaboration ?? {};
    const preflight = payload.preflight_result ?? {};
    const medianLoadTimeMs = Number(preflight.medianLoadTimeMs ?? 1800);
    const loginWallRisk = Boolean(preflight.hasLoginWallRisk ?? false);

    if (!title || !hook || !description || !appUrl) {
      return res.status(400).json({ error: 'Missing required app fields' });
    }
    if (loginWallRisk) {
      return res.status(400).json({ error: 'Login-wall apps are not allowed' });
    }
    if (medianLoadTimeMs > 2000) {
      return res.status(400).json({ error: 'App exceeds 2 second load target' });
    }

    await client.connect();

    const preferredUsername = user.user_metadata?.username || user.email?.split('@')[0] || `user-${user.id.slice(0, 6)}`;
    const preferredDisplayName = user.user_metadata?.display_name || preferredUsername;
    const email = user.email || '';

    const profile = await ensureProfile(client, {
      userId: user.id,
      username: preferredUsername,
      displayName: preferredDisplayName,
      email,
    });

    let slug = slugify(title);
    if (!slug) slug = `app-${Date.now()}`;

    const existingSlug = await client.query('select 1 from public.apps where slug = $1 limit 1', [slug]);
    if (existingSlug.rowCount) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 8)}`;
    }

    const insertResult = await client.query(
      `
      insert into public.apps (
        creator_id, slug, title, hook, description, app_url, runtime_slug, preview_mode,
        tags, category, intent_label, resources_needed, contact_info, who_its_for,
        what_it_does, collaboration, stats, theme, status
      ) values (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9::jsonb, $10, $11, $12, $13, $14,
        $15, $16::jsonb, $17::jsonb, $18::jsonb, 'active'
      )
      returning *
      `,
      [
        user.id,
        slug,
        title,
        hook,
        description,
        appUrl,
        runtimeSlug,
        previewMode,
        JSON.stringify(tags),
        category,
        intentLabel,
        resourcesNeeded,
        contactInfo,
        whoItsFor,
        whatItDoes,
        JSON.stringify(collaboration),
        JSON.stringify({
          views: 0,
          likes: 0,
          comments: 0,
          saves: 0,
          avgSessionTimeSeconds: 0,
          bounceRate: 0,
          timeToValueSeconds: Math.max(1, Math.ceil(medianLoadTimeMs / 1000)),
          healthScore: preflight.verdict === 'pass' ? 86 : 70,
        }),
        JSON.stringify({
          accent: '#22c55e',
          surface: 'linear-gradient(135deg, rgba(34,197,94,0.28), rgba(15,23,42,0.92), rgba(59,130,246,0.2))',
          panel: 'rgba(21, 128, 61, 0.2)',
        }),
      ],
    );

    const app = insertResult.rows[0];

    return res.status(201).json({
      data: {
        id: app.id,
        slug: app.slug,
        title: app.title,
        hook: app.hook,
        description: app.description,
        appUrl: app.app_url,
        runtimeSlug: app.runtime_slug,
        previewMode: app.preview_mode,
        tags: app.tags,
        category: app.category,
        intentLabel: app.intent_label,
        resourcesNeeded: app.resources_needed,
        contactInfo: app.contact_info,
        whoItsFor: app.who_its_for,
        whatItDoes: app.what_it_does,
        isVerified: app.is_verified,
        creator: {
          id: user.id,
          username: profile.username,
          displayName: profile.displayName,
          bio: '',
          goal: '',
          avatarGradient: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
          bannerGradient: 'linear-gradient(135deg, rgba(59,130,246,0.5), rgba(124,58,237,0.55), rgba(15,23,42,0.82))',
          websiteUrl: null,
          twitterUrl: null,
          githubUrl: null,
          contactEmail: profile.email,
          nicheFocus: 'AI tools for builders and creators',
          verified: false,
          stats: { followers: 0, following: 0, totalViews: 0, avgSessionTimeSeconds: 0, apps: 1 },
        },
        createdAt: app.created_at,
        updatedAt: app.updated_at,
        version: app.version,
        changelog: app.changelog,
        collaboration: app.collaboration,
        stats: app.stats,
        theme: app.theme,
        recommendationScore: 0.79,
        reasons: ['Fresh submission', 'Preflight checked', 'Matches launch niche'],
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Create app failed';
    console.error('create-app failed', error);
    return res.status(400).json({ error: message, debug: { code: 'CREATE_APP_FAILED', message } });
  } finally {
    await client.end().catch(() => undefined);
  }
}
