import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

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
  };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function ensureProfile(admin: ReturnType<typeof getSupabaseAdmin>, input: { userId: string; username: string; displayName: string; email: string }) {
  const { data: existing, error: existingError } = await admin
    .from('profiles')
    .select('id, username, display_name, contact_email')
    .eq('id', input.userId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    const { error: updateError } = await admin
      .from('profiles')
      .update({
        display_name: input.displayName,
        contact_email: input.email,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.userId);

    if (updateError) throw new Error(updateError.message);

    return {
      username: existing.username as string,
      displayName: (existing.display_name as string) ?? input.displayName,
      email: (existing.contact_email as string) ?? input.email,
    };
  }

  let candidateUsername = input.username;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { error: insertError } = await admin.from('profiles').insert({
      id: input.userId,
      username: candidateUsername,
      display_name: input.displayName,
      contact_email: input.email,
    });

    if (!insertError) {
      return {
        username: candidateUsername,
        displayName: input.displayName,
        email: input.email,
      };
    }

    if (!String(insertError.message).includes('duplicate') && !String(insertError.message).includes('profiles_username_key')) {
      throw new Error(insertError.message);
    }

    candidateUsername = `${input.username}-${Math.random().toString(36).slice(2, 8)}`;
  }

  throw new Error('Could not create a unique profile username');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  try {
    const accessToken = authHeader.slice('Bearer '.length);
    const admin = getSupabaseAdmin();
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

    const preferredUsername = user.user_metadata?.username || user.email?.split('@')[0] || `user-${user.id.slice(0, 6)}`;
    const preferredDisplayName = user.user_metadata?.display_name || preferredUsername;
    const email = user.email || '';

    const profile = await ensureProfile(admin, {
      userId: user.id,
      username: preferredUsername,
      displayName: preferredDisplayName,
      email,
    });

    let slug = slugify(title);
    if (!slug) slug = `app-${Date.now()}`;

    const { data: existingSlugRows, error: existingSlugError } = await admin
      .from('apps')
      .select('id')
      .eq('slug', slug)
      .limit(1);

    if (existingSlugError) throw new Error(existingSlugError.message);
    if (existingSlugRows && existingSlugRows.length > 0) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 8)}`;
    }

    const insertPayload = {
      creator_id: user.id,
      slug,
      title,
      hook,
      description,
      app_url: appUrl,
      runtime_slug: runtimeSlug,
      preview_mode: previewMode,
      tags,
      category,
      intent_label: intentLabel,
      resources_needed: resourcesNeeded,
      contact_info: contactInfo,
      who_its_for: whoItsFor,
      what_it_does: whatItDoes,
      collaboration,
      stats: {
        views: 0,
        likes: 0,
        comments: 0,
        saves: 0,
        avgSessionTimeSeconds: 0,
        bounceRate: 0,
        timeToValueSeconds: Math.max(1, Math.ceil(medianLoadTimeMs / 1000)),
        healthScore: preflight.verdict === 'pass' ? 86 : 70,
      },
      theme: {
        accent: '#22c55e',
        surface: 'linear-gradient(135deg, rgba(34,197,94,0.28), rgba(15,23,42,0.92), rgba(59,130,246,0.2))',
        panel: 'rgba(21, 128, 61, 0.2)',
      },
      status: 'active',
    };

    const { data: insertedApp, error: insertError } = await admin
      .from('apps')
      .insert(insertPayload)
      .select('*')
      .single();

    if (insertError || !insertedApp) {
      throw new Error(insertError?.message ?? 'Failed to insert app');
    }

    return res.status(201).json({
      data: {
        id: insertedApp.id,
        slug: insertedApp.slug,
        title: insertedApp.title,
        hook: insertedApp.hook,
        description: insertedApp.description,
        appUrl: insertedApp.app_url,
        runtimeSlug: insertedApp.runtime_slug,
        previewMode: insertedApp.preview_mode,
        tags: insertedApp.tags,
        category: insertedApp.category,
        intentLabel: insertedApp.intent_label,
        resourcesNeeded: insertedApp.resources_needed,
        contactInfo: insertedApp.contact_info,
        whoItsFor: insertedApp.who_its_for,
        whatItDoes: insertedApp.what_it_does,
        isVerified: insertedApp.is_verified,
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
        createdAt: insertedApp.created_at,
        updatedAt: insertedApp.updated_at,
        version: insertedApp.version,
        changelog: insertedApp.changelog,
        collaboration: insertedApp.collaboration,
        stats: insertedApp.stats,
        theme: insertedApp.theme,
        recommendationScore: 0.79,
        reasons: ['Fresh submission', 'Preflight checked', 'Matches launch niche'],
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Create app failed';
    console.error('create-app failed', error);
    return res.status(400).json({ error: message, debug: { code: 'CREATE_APP_FAILED', message } });
  }
}
