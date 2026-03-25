export const APP_NICHE = "AI tools for builders and creators";

export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
};

export function hasSupabase() {
  return Boolean(supabaseConfig.url && supabaseConfig.anonKey);
}
