insert into public.apps (
  creator_id, slug, title, hook, description, app_url, runtime_slug, preview_mode, tags, category, intent_label,
  resources_needed, contact_info, who_its_for, what_it_does, is_verified, version, changelog, collaboration, stats, theme, status
)
select
  p.id,
  'prompt-studio',
  'Prompt Studio',
  'Stress-test prompts, constraints, and system messages in one screen.',
  'Prompt Studio helps builders iterate on prompts fast. Compare variations, inspect confidence deltas, and surface weak instructions before shipping to production.',
  '/runtime/prompt-studio',
  'prompt-studio',
  'snapshot',
  '["prompt","workflow","llm","testing"]'::jsonb,
  'ai_tool',
  'tool',
  'Frontend designer, AI eval specialist, 20 beta users.',
  'DM @mira or email mira@ruption.app',
  'AI product builders, prompt engineers, startup operators',
  'Compares prompts, logs response quality, and exposes weak outputs.',
  true,
  '1.4.2',
  'Added scenario cards, faster scoring, and better output diffing.',
  '{"lookingForDevs":true,"lookingForDesigners":true,"lookingForFunding":false}'::jsonb,
  '{"views":18420,"likes":2910,"comments":183,"saves":944,"avgSessionTimeSeconds":51,"bounceRate":0.16,"timeToValueSeconds":2,"healthScore":94}'::jsonb,
  '{"accent":"#8b5cf6","surface":"linear-gradient(135deg, rgba(59,130,246,0.45), rgba(124,58,237,0.55), rgba(15,23,42,0.96))","panel":"rgba(15, 23, 42, 0.72)"}'::jsonb,
  'active'
from public.profiles p
where p.username = 'mira'
on conflict (slug) do nothing;
