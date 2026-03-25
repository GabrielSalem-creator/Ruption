import { createClient } from "@supabase/supabase-js";
import { hasSupabase, supabaseConfig } from "@/lib/env";

export const supabase = hasSupabase()
  ? createClient(supabaseConfig.url!, supabaseConfig.anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          "X-Client-Info": "rupture-web",
        },
      },
    })
  : null;
