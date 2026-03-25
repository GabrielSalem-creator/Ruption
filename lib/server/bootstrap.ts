import { hashPassword } from "@/lib/server/auth";
import { getSql } from "@/lib/server/db";
import { ensureSchema } from "@/lib/server/schema";
import { seedApps, seedUsers } from "@/lib/server/seed-data";

let bootstrapped = false;

export async function ensureBootstrap() {
  if (bootstrapped) return;
  await ensureSchema();
  const sql = getSql();

  for (const user of seedUsers) {
    const existing = await sql`SELECT id FROM users WHERE username = ${user.username} LIMIT 1`;
    if (existing.length === 0) {
      const passwordHash = await hashPassword(user.password);
      await sql`
        INSERT INTO users (
          username, email, password_hash, display_name, bio, goal,
          avatar_gradient, banner_gradient, website_url, twitter_url,
          github_url, contact_email, niche_focus, verified
        ) VALUES (
          ${user.username}, ${user.email}, ${passwordHash}, ${user.displayName}, ${user.bio}, ${user.goal},
          ${user.avatarGradient}, ${user.bannerGradient}, ${user.websiteUrl ?? null}, ${user.twitterUrl ?? null},
          ${user.githubUrl ?? null}, ${user.contactEmail}, ${user.nicheFocus}, ${user.verified}
        )
      `;
    }
  }

  const users = await sql`SELECT id, username FROM users`;
  const userMap = new Map(users.map((user) => [user.username as string, user.id as string]));

  for (const app of seedApps) {
    const existing = await sql`SELECT id FROM apps_runtime WHERE slug = ${app.slug} LIMIT 1`;
    if (existing.length === 0) {
      await sql`
        INSERT INTO apps_runtime (
          creator_id, slug, title, hook, description, app_url, runtime_slug, preview_mode,
          tags, category, intent_label, resources_needed, contact_info, who_its_for,
          what_it_does, is_verified, version, changelog, collaboration, stats, theme
        ) VALUES (
          ${userMap.get(app.creatorUsername)!}, ${app.slug}, ${app.title}, ${app.hook}, ${app.description},
          ${app.appUrl}, ${app.runtimeSlug}, ${app.previewMode}, ${JSON.stringify(app.tags)}, ${app.category},
          ${app.intentLabel}, ${app.resourcesNeeded}, ${app.contactInfo}, ${app.whoItsFor}, ${app.whatItDoes},
          ${app.isVerified}, ${app.version}, ${app.changelog}, ${JSON.stringify(app.collaboration)}, ${JSON.stringify(app.stats)}, ${JSON.stringify(app.theme)}
        )
      `;
    }
  }

  bootstrapped = true;
}
