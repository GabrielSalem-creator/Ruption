import { AppFeedItem, CreatorProfile, InlineFeedbackType } from "@/lib/types";

export const inlineFeedbackOptions: { label: string; value: InlineFeedbackType }[] = [
  { label: "Brilliant", value: "brilliant" },
  { label: "Confusing", value: "confusing" },
  { label: "Slow", value: "slow" },
];

export const mockApps: AppFeedItem[] = [
  {
    id: "app-1",
    slug: "agent-atlas",
    title: "Agent Atlas",
    hook: "Map your tasks into a live AI operator workflow.",
    description:
      "A browser-based AI agent workspace that turns natural-language requests into structured task runs, summaries, and reusable automations.",
    appUrl: "https://example.com/agent-atlas",
    previewImageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80",
    videoDemoUrl: "https://example.com/demo/agent-atlas.mp4",
    tags: ["agents", "automation", "workflow"],
    category: "ai_agent",
    intentLabel: "agent",
    isVerified: true,
    loadTimeMs: 980,
    appHealthScore: 91,
    timeToValueSeconds: 2.1,
    viewsCount: 18243,
    likesCount: 2381,
    commentsCount: 184,
    savesCount: 1280,
    avgSessionTimeSeconds: 46.8,
    bounceRate: 0.14,
    creator: {
      id: "creator-1",
      username: "atlaslabs",
      displayName: "Atlas Labs",
      avatarUrl:
        "https://images.unsplash.com/photo-1541534401786-2077eed87a72?auto=format&fit=crop&w=300&q=80",
      bio: "Shipping agents that feel native to the browser.",
      verified: true,
    },
  },
  {
    id: "app-2",
    slug: "prompt-surgeon",
    title: "Prompt Surgeon",
    hook: "Diagnose weak prompts and repair them in one pass.",
    description:
      "An AI prompt editor that identifies ambiguity, missing context, and output-format issues, then rewrites prompts for better model behavior.",
    appUrl: "https://example.com/prompt-surgeon",
    previewImageUrl:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1600&q=80",
    tags: ["prompting", "writing", "llm"],
    category: "ai_tool",
    intentLabel: "tool",
    isVerified: true,
    loadTimeMs: 1210,
    appHealthScore: 88,
    timeToValueSeconds: 1.8,
    viewsCount: 10320,
    likesCount: 1542,
    commentsCount: 96,
    savesCount: 744,
    avgSessionTimeSeconds: 35.2,
    bounceRate: 0.19,
    creator: {
      id: "creator-2",
      username: "rafi",
      displayName: "Rafi Noor",
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      bio: "Designing AI micro-tools with fast time-to-value.",
      verified: true,
    },
  },
  {
    id: "app-3",
    slug: "study-flow",
    title: "Study Flow",
    hook: "Turn course notes into flashcards, tests, and summaries instantly.",
    description:
      "A student-first AI utility that converts pasted notes and PDFs into quiz decks, revision maps, and exam-ready recaps.",
    appUrl: "https://example.com/study-flow",
    previewImageUrl:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1600&q=80",
    tags: ["education", "students", "summaries"],
    category: "productivity",
    intentLabel: "utility",
    isVerified: false,
    loadTimeMs: 890,
    appHealthScore: 84,
    timeToValueSeconds: 2.6,
    viewsCount: 8940,
    likesCount: 1160,
    commentsCount: 77,
    savesCount: 932,
    avgSessionTimeSeconds: 41.1,
    bounceRate: 0.21,
    creator: {
      id: "creator-3",
      username: "campusai",
      displayName: "Campus AI",
      avatarUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80",
      bio: "Micro-tools for study speed and memory retention.",
      verified: false,
    },
  },
];

export const mockProfiles: CreatorProfile[] = [
  {
    id: "creator-1",
    username: "atlaslabs",
    displayName: "Atlas Labs",
    bio: "Shipping agents that feel native to the browser. Focused on operator workflows, browser actions, and zero-friction AI execution.",
    avatarUrl:
      "https://images.unsplash.com/photo-1541534401786-2077eed87a72?auto=format&fit=crop&w=300&q=80",
    bannerUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
    websiteUrl: "https://example.com",
    twitterUrl: "https://x.com/example",
    githubUrl: "https://github.com/example",
    goal: "Looking for growth operators and design partners.",
    verified: true,
    stats: {
      totalViews: 98230,
      totalLikes: 8344,
      totalSaves: 3904,
      avgSessionTimeSeconds: 44.2,
      followersCount: 1831,
    },
    apps: [mockApps[0]],
  },
  {
    id: "creator-2",
    username: "rafi",
    displayName: "Rafi Noor",
    bio: "I build narrow AI products that do one job brilliantly.",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    bannerUrl:
      "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=1600&q=80",
    websiteUrl: "https://example.com",
    twitterUrl: "https://x.com/example",
    githubUrl: "https://github.com/example",
    goal: "Looking for creators who want to fork or remix workflow tools.",
    verified: true,
    stats: {
      totalViews: 40124,
      totalLikes: 3820,
      totalSaves: 1604,
      avgSessionTimeSeconds: 34.6,
      followersCount: 944,
    },
    apps: [mockApps[1]],
  },
];
