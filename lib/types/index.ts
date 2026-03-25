export type IntentLabel = "tool" | "agent" | "utility" | "experiment" | "game";

export type AppCategory =
  | "ai_agent"
  | "ai_tool"
  | "workflow"
  | "productivity"
  | "research"
  | "developer_tool"
  | "experiment";

export type CollaborationNeed =
  | "developers"
  | "designers"
  | "funding"
  | "marketing"
  | "operators";

export interface CreatorProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  bannerUrl?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  contactEmail?: string;
  goal?: string;
  verified?: boolean;
  followersCount: number;
}

export interface AppMetrics {
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  savesCount: number;
  sharesCount: number;
  avgSessionTimeSeconds: number;
  bounceRate: number;
  healthScore: number;
}

export interface AppCard {
  id: string;
  slug: string;
  title: string;
  hook: string;
  description: string;
  appUrl: string;
  previewImageUrl?: string;
  videoDemoUrl?: string;
  tags: string[];
  category: AppCategory;
  intentLabel: IntentLabel;
  resourcesNeeded?: string;
  contactInfo?: string;
  collaborationHooks: CollaborationNeed[];
  creator: CreatorProfile;
  metrics: AppMetrics;
  isVerified?: boolean;
  version?: string;
  changelog?: string;
}
