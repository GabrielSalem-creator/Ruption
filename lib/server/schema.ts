import { getSql } from "@/lib/server/db";

let initialized = false;

export async function ensureSchema() {
  if (initialized) return;
  const sql = getSql();

  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      bio TEXT NOT NULL DEFAULT '',
      goal TEXT NOT NULL DEFAULT '',
      avatar_gradient TEXT NOT NULL DEFAULT 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
      banner_gradient TEXT NOT NULL DEFAULT 'linear-gradient(135deg, rgba(59,130,246,0.5), rgba(124,58,237,0.55), rgba(15,23,42,0.82))',
      website_url TEXT,
      twitter_url TEXT,
      github_url TEXT,
      contact_email TEXT NOT NULL,
      niche_focus TEXT NOT NULL DEFAULT 'AI tools for builders and creators',
      verified BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS apps_runtime (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      hook TEXT NOT NULL,
      description TEXT NOT NULL,
      app_url TEXT NOT NULL,
      runtime_slug TEXT NOT NULL,
      preview_mode TEXT NOT NULL,
      tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      category TEXT NOT NULL,
      intent_label TEXT NOT NULL,
      resources_needed TEXT NOT NULL DEFAULT '',
      contact_info TEXT NOT NULL DEFAULT '',
      who_its_for TEXT NOT NULL DEFAULT '',
      what_it_does TEXT NOT NULL DEFAULT '',
      is_verified BOOLEAN NOT NULL DEFAULT false,
      version TEXT NOT NULL DEFAULT '0.1.0',
      changelog TEXT NOT NULL DEFAULT '',
      collaboration JSONB NOT NULL DEFAULT '{}'::jsonb,
      stats JSONB NOT NULL DEFAULT '{}'::jsonb,
      theme JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  initialized = true;
}
