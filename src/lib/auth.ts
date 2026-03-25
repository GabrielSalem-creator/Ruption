import { supabase } from "@/lib/supabase";
import { hasSupabase } from "@/lib/env";

export async function signUpWithEmail(input: { email: string; password: string; username: string; displayName: string }) {
  if (!hasSupabase() || !supabase) {
    throw new Error("Supabase env vars are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const redirectTo = `${window.location.origin}/feed`;
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        username: input.username,
        display_name: input.displayName || input.username,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signInWithEmail(input: { email: string; password: string }) {
  if (!hasSupabase() || !supabase) {
    throw new Error("Supabase env vars are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}
