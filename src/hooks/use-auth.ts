import { useEffect, useState } from "react";
import { hasSupabase } from "@/lib/env";
import { supabase } from "@/lib/supabase";

export interface SessionUser {
  id: string;
  email: string | null;
  username: string | null;
  displayName: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasSupabase() || !supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      const authUser = data.user;
      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email ?? null,
          username: (authUser.user_metadata.username as string | undefined) ?? null,
          displayName: (authUser.user_metadata.display_name as string | undefined) ?? null,
        });
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user ?? null;
      setUser(authUser ? { id: authUser.id, email: authUser.email ?? null, username: (authUser.user_metadata.username as string | undefined) ?? null, displayName: (authUser.user_metadata.display_name as string | undefined) ?? null } : null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
