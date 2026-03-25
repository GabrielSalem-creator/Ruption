export type IntentLabel = "tool" | "game" | "experiment" | "utility";
export type AppCategory = "ai_tool" | "agent" | "productivity" | "developer_tool" | "design_tool" | "experiment" | "utility";
export type AppFeedback = "confusing" | "slow" | "brilliant";
export type InterestVector = Record<string, number>;

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  goal: string;
  avatarGradient: string;
  bannerGradient: string;
  websiteUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  contactEmail: string;
  nicheFocus: string;
  verified: boolean;
  stats: {
    followers: number;
    following: number;
    totalViews: number;
    avgSessionTimeSeconds: number;
    apps: number;
  };
}

export interface RuptureApp {
  id: string;
  slug: string;
  title: string;
  hook: string;
  description: string;
  appUrl: string;
  runtimeSlug: string;
  hostedBundleUrl?: string | null;
  previewImageUrl?: string | null;
  videoDemoUrl?: string | null;
  previewMode: "snapshot" | "static" | "sandbox";
  tags: string[];
  category: AppCategory;
  intentLabel: IntentLabel;
  resourcesNeeded: string;
  contactInfo: string;
  whoItsFor: string;
  whatItDoes: string;
  isVerified: boolean;
  creator: Profile;
  createdAt: string;
  updatedAt: string;
  version: string;
  changelog: string;
  collaboration: {
    lookingForDevs: boolean;
    lookingForDesigners: boolean;
    lookingForFunding: boolean;
  };
  stats: {
    views: number;
    likes: number;
    comments: number;
    saves: number;
    avgSessionTimeSeconds: number;
    bounceRate: number;
    timeToValueSeconds: number;
    healthScore: number;
  };
  theme: {
    accent: string;
    surface: string;
    panel: string;
  };
}

export interface FeedItem extends RuptureApp {
  recommendationScore: number;
  reasons: string[];
}

export interface PreflightResult {
  url: string;
  normalizedUrl: string;
  isReachable: boolean;
  iframeCompatible: boolean;
  hasLoginWallRisk: boolean;
  screenshotReady: boolean;
  medianLoadTimeMs: number;
  fallbackMode: "interactive" | "preview_only";
  verdict: "pass" | "review" | "block";
  notes: string[];
}
