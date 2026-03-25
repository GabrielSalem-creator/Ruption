export type IntentLabel = "tool" | "agent" | "utility" | "experiment" | "game";

export type AppCategory =
  | "ai_agent"
  | "ai_tool"
  | "workflow"
  | "productivity"
  | "research"
  | "education"
  | "developer_tool"
  | "experiment";

export type CollaborationNeed =
  | "developers"
  | "designers"
  | "funding"
  | "distribution"
  | "operators";

export type InlineFeedbackType = "brilliant" | "confusing" | "slow";

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
  linkedinUrl?: string;
  contactEmail?: string;
  goal?: string;
  goals?: string[];
  verified?: boolean;
  followersCount?: number;
  stats?: {
    totalViews: number;
    totalLikes: number;
    totalSaves: number;
    avgSessionTimeSeconds: number;
    followersCount: number;
  };
  apps?: AppCard[];
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
  loadTimeMs?: number;
  timeToValueSeconds?: number;
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
  targetUser?: string;
  problemStatement?: string;
  resourcesNeeded?: string;
  contactInfo?: string;
  collaborationHooks: CollaborationNeed[];
  creator: CreatorProfile;
  metrics: AppMetrics;
  isVerified?: boolean;
  version?: string;
  changelog?: string;
  pricingModel?: string;
}

export type AppRecord = AppCard;
export type AppFeedItem = AppCard;
