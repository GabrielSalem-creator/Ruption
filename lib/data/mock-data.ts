import type { AppCard, CreatorProfile, InlineFeedbackType } from "@/lib/types";

export const inlineFeedbackOptions: { label: string; value: InlineFeedbackType }[] = [
  { label: "Brilliant", value: "brilliant" },
  { label: "Confusing", value: "confusing" },
  { label: "Slow", value: "slow" },
];

export const mockApps: AppCard[] = [
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
    resourcesNeeded: "Looking for design partners and operators.",
    contactInfo: "team@atlaslabs.ai",
    collaborationHooks: ["developers", "operators"],
    targetUser: "Operators and founders who need browser-native execution.",
    problemStatement: "Too many AI agent products still feel like demos instead of usable workflows.",
    version: "1.3.0",
    changelog: "Added reusable task templates and smarter memory handoff.",
    creator: {
      id: "creator-1",
      username: "atlaslabs",
      displayName: "Atlas Labs",
      avatarUrl:
        "https://images.unsplash.com/photo-1541534401786-2077eed87a72?auto=format&fit=crop&w=300&q=80",
      bio: "Shipping agents that feel native to the browser.",
      websiteUrl: "https://example.com",
      twitterUrl: "https://x.com/example",
      githubUrl: "https://github.com/example",
      contactEmail: "team@atlaslabs.ai",
      goal: "Looking for growth operators and design partners.",
      verified: true,
      followersCount: 1831,
    },
    metrics: {
      viewsCount: 18243,
      likesCount: 2381,
      commentsCount: 184,
      savesCount: 1280,
      sharesCount: 418,
      avgSessionTimeSeconds: 46.8,
      bounceRate: 0.14,
      healthScore: 91,
      timeToValueSeconds: 2.1,
      loadTimeMs: 980,
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
    resourcesNeeded: "Looking for distribution and UX feedback.",
    contactInfo: "contact@promptsurgeon.ai",
    collaborationHooks: ["designers", "distribution"],
    targetUser: "Indie builders and students using LLMs every day.",
    problemStatement: "People waste time iterating on weak prompts without understanding why outputs fail.",
    version: "1.1.2",
    changelog: "Improved prompt diagnostics and added output-format presets.",
    creator: {
      id: "creator-2",
      username: "rafi",
      displayName: "Rafi Noor",
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      bio: "Designing AI micro-tools with fast time-to-value.",
      websiteUrl: "https://example.com",
      twitterUrl: "https://x.com/example",
      githubUrl: "https://github.com/example",
      contactEmail: "rafi@example.com",
      goal: "Looking for creators who want to fork or remix workflow tools.",
      verified: true,
      followersCount: 944,
    },
    metrics: {
      viewsCount: 10320,
      likesCount: 1542,
      commentsCount: 96,
      savesCount: 744,
      sharesCount: 204,
      avgSessionTimeSeconds: 35.2,
      bounceRate: 0.19,
      healthScore: 88,
      timeToValueSeconds: 1.8,
      loadTimeMs: 1210,
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
    resourcesNeeded: "Looking for student ambassadors and curriculum testers.",
    contactInfo: "hello@studyflow.app",
    collaborationHooks: ["designers", "distribution"],
    targetUser: "Students who need exam prep help without friction.",
    problemStatement: "Course notes are dense and hard to convert into actionable revision material quickly.",
    version: "0.9.4",
    changelog: "Improved quiz generation and note-to-flashcard parsing.",
    creator: {
      id: "creator-3",
      username: "campusai",
      displayName: "Campus AI",
      avatarUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80",
      bio: "Micro-tools for study speed and memory retention.",
      websiteUrl: "https://example.com",
      contactEmail: "hello@campusai.app",
      goal: "Looking for campus testers and creators.",
      verified: false,
      followersCount: 531,
    },
    metrics: {
      viewsCount: 8940,
      likesCount: 1160,
      commentsCount: 77,
      savesCount: 932,
      sharesCount: 177,
      avgSessionTimeSeconds: 41.1,
      bounceRate: 0.21,
      healthScore: 84,
      timeToValueSeconds: 2.6,
      loadTimeMs: 890,
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
    contactEmail: "team@atlaslabs.ai",
    goal: "Looking for growth operators and design partners.",
    verified: true,
    followersCount: 1831,
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
    contactEmail: "rafi@example.com",
    goal: "Looking for creators who want to fork or remix workflow tools.",
    verified: true,
    followersCount: 944,
  },
];

export function getMockProfileByUsername(username: string) {
  return mockProfiles.find((profile) => profile.username === username) ?? null;
}

export function getMockUserApps(username: string) {
  return mockApps.filter((app) => app.creator.username === username);
}
