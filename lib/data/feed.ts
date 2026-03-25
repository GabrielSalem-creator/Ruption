import { cache } from "react";

import { getMockProfileByUsername, mockApps } from "@/lib/data/mock-data";
import type { AppCard, CreatorProfile } from "@/lib/types";
import { getServerSupabase } from "@/lib/supabase/server";

const isSupabaseConfigured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

export const getFeedApps = cache(async (): Promise<AppCard[]> => {
  if (!isSupabaseConfigured()) {
    return mockApps;
  }

  try {
    const supabase = await getServerSupabase();
    if (!supabase) {
      return mockApps;
    }
    const { data, error } = await supabase
      .from("feed_cards")
      .select("*")
      .limit(12);

    if (error || !data?.length) {
      return mockApps;
    }

    return data as AppCard[];
  } catch {
    return mockApps;
  }
});

export const getAppBySlug = cache(async (slug: string): Promise<AppCard | null> => {
  const feed = await getFeedApps();
  return feed.find((app) => app.slug === slug) ?? null;
});

export const getCreatorByUsername = cache(
  async (username: string): Promise<CreatorProfile | null> => {
    const fromMock = getMockProfileByUsername(username);

    if (!isSupabaseConfigured()) {
      return fromMock;
    }

    try {
      const supabase = await getServerSupabase();
      if (!supabase) {
        return fromMock;
      }
      const { data, error } = await supabase
        .from("public_profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (error || !data) {
        return fromMock;
      }

      return data as CreatorProfile;
    } catch {
      return fromMock;
    }
  },
);
