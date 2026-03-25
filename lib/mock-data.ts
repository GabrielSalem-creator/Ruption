import { InterestVector, Profile, RuptureApp } from "@/lib/types";

export const APP_NICHE = "AI tools for builders and creators";

export const currentViewerInterests: InterestVector = {
  ai_tool: 0.95,
  agent: 0.82,
  productivity: 0.68,
  design_tool: 0.36,
  prompt: 0.92,
  workflow: 0.78,
  copy: 0.54,
  planning: 0.71,
};

export const profiles: Profile[] = [
  {
    id: "profile-1",
    username: "mira",
    displayName: "Mira Kline",
    bio: "Building sharp AI surfaces for operators and founders.",
    goal: "Looking for design partners and early growth users.",
    avatarGradient: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
    bannerGradient: "linear-gradient(135deg, rgba(59,130,246,0.5), rgba(124,58,237,0.55), rgba(15,23,42,0.82))",
    websiteUrl: "https://ruption.app",
    twitterUrl: "https://twitter.com/example",
    githubUrl: "https://github.com/example",
    contactEmail: "mira@ruption.app",
    nicheFocus: "AI workflow interfaces",
    verified: true,
    stats: {
      followers: 1240,
      following: 183,
      totalViews: 230410,
      avgSessionTimeSeconds: 39,
      apps: 3,
    },
  },
  {
    id: "profile-2",
    username: "owen",
    displayName: "Owen Vale",
    bio: "I ship small AI products that feel immediate.",
    goal: "Need beta users and GTM experiments.",
    avatarGradient: "linear-gradient(135deg, #06b6d4, #0f172a)",
    bannerGradient: "linear-gradient(135deg, rgba(6,182,212,0.35), rgba(15,23,42,0.9), rgba(14,165,233,0.22))",
    websiteUrl: "https://vercel.com",
    twitterUrl: "https://twitter.com/example2",
    githubUrl: "https://github.com/example2",
    contactEmail: "owen@ruption.app",
    nicheFocus: "AI agents and copilots",
    verified: false,
    stats: {
      followers: 628,
      following: 90,
      totalViews: 89210,
      avgSessionTimeSeconds: 34,
      apps: 2,
    },
  },
];

export const apps: RuptureApp[] = [
  {
    id: "app-1",
    slug: "prompt-studio",
    title: "Prompt Studio",
    hook: "Stress-test prompts, constraints, and system messages in one screen.",
    description:
      "Prompt Studio helps builders iterate on prompts fast. Compare variations, inspect confidence deltas, and surface weak instructions before shipping to production.",
    appUrl: "/runtime/prompt-studio",
    runtimeSlug: "prompt-studio",
    hostedBundleUrl: null,
    previewImageUrl: null,
    videoDemoUrl: null,
    previewMode: "snapshot",
    tags: ["prompt", "workflow", "llm", "testing"],
    category: "ai_tool",
    intentLabel: "tool",
    resourcesNeeded: "Frontend designer, AI eval specialist, 20 beta users.",
    contactInfo: "DM @mira or email mira@ruption.app",
    whoItsFor: "AI product builders, prompt engineers, startup operators",
    whatItDoes: "Compares prompts, logs response quality, and exposes weak outputs.",
    isVerified: true,
    creator: profiles[0],
    createdAt: "2026-03-20T08:00:00.000Z",
    updatedAt: "2026-03-25T10:00:00.000Z",
    version: "1.4.2",
    changelog: "Added scenario cards, faster scoring, and better output diffing.",
    collaboration: {
      lookingForDevs: true,
      lookingForDesigners: true,
      lookingForFunding: false,
    },
    stats: {
      views: 18420,
      likes: 2910,
      comments: 183,
      saves: 944,
      avgSessionTimeSeconds: 51,
      bounceRate: 0.16,
      timeToValueSeconds: 2,
      healthScore: 94,
    },
    theme: {
      accent: "#8b5cf6",
      surface: "linear-gradient(135deg, rgba(59,130,246,0.45), rgba(124,58,237,0.55), rgba(15,23,42,0.96))",
      panel: "rgba(15, 23, 42, 0.72)",
    },
  },
  {
    id: "app-2",
    slug: "agent-planner",
    title: "Agent Planner",
    hook: "Turn vague tasks into an AI execution graph with blockers and next actions.",
    description:
      "Agent Planner breaks work into agents, dependencies, and handoffs. It is built for small teams shipping AI workflows who need instant clarity.",
    appUrl: "/runtime/agent-planner",
    runtimeSlug: "agent-planner",
    hostedBundleUrl: null,
    previewImageUrl: null,
    videoDemoUrl: null,
    previewMode: "sandbox",
    tags: ["agent", "planning", "tasks", "workflow"],
    category: "agent",
    intentLabel: "utility",
    resourcesNeeded: "Need prompt systems reviewer and growth operator.",
    contactInfo: "Reach out via Owen profile or GitHub.",
    whoItsFor: "Builders coordinating AI agents, founders running solo teams",
    whatItDoes: "Maps tasks to agents, dependencies, and execution steps.",
    isVerified: false,
    creator: profiles[1],
    createdAt: "2026-03-19T08:00:00.000Z",
    updatedAt: "2026-03-25T09:40:00.000Z",
    version: "0.9.8",
    changelog: "Introduced timeline re-ranking and blocker scoring.",
    collaboration: {
      lookingForDevs: true,
      lookingForDesigners: false,
      lookingForFunding: true,
    },
    stats: {
      views: 12210,
      likes: 1644,
      comments: 104,
      saves: 522,
      avgSessionTimeSeconds: 42,
      bounceRate: 0.21,
      timeToValueSeconds: 3,
      healthScore: 89,
    },
    theme: {
      accent: "#06b6d4",
      surface: "linear-gradient(135deg, rgba(6,182,212,0.38), rgba(15,23,42,0.92), rgba(14,165,233,0.2))",
      panel: "rgba(8, 47, 73, 0.34)",
    },
  },
  {
    id: "app-3",
    slug: "copy-lab",
    title: "Copy Lab",
    hook: "Generate launch copy variations with value-based scoring and CTA heat.",
    description:
      "Copy Lab is a fast surface for founders shaping launch pages, product hunt blurbs, and onboarding copy. It scores clarity, urgency, and persona fit.",
    appUrl: "/runtime/copy-lab",
    runtimeSlug: "copy-lab",
    hostedBundleUrl: null,
    previewImageUrl: null,
    videoDemoUrl: null,
    previewMode: "static",
    tags: ["copy", "marketing", "launch", "ai_tool"],
    category: "productivity",
    intentLabel: "experiment",
    resourcesNeeded: "Need launch partners and distribution feedback.",
    contactInfo: "Email mira@ruption.app for collaboration.",
    whoItsFor: "Founders, marketers, indie hackers",
    whatItDoes: "Creates and scores landing page copy variants instantly.",
    isVerified: true,
    creator: profiles[0],
    createdAt: "2026-03-18T08:00:00.000Z",
    updatedAt: "2026-03-25T08:50:00.000Z",
    version: "1.1.0",
    changelog: "Added persona presets and stronger CTA grading.",
    collaboration: {
      lookingForDevs: false,
      lookingForDesigners: true,
      lookingForFunding: false,
    },
    stats: {
      views: 9100,
      likes: 1320,
      comments: 76,
      saves: 402,
      avgSessionTimeSeconds: 37,
      bounceRate: 0.18,
      timeToValueSeconds: 2,
      healthScore: 91,
    },
    theme: {
      accent: "#f472b6",
      surface: "linear-gradient(135deg, rgba(244,114,182,0.34), rgba(15,23,42,0.92), rgba(59,130,246,0.16))",
      panel: "rgba(76, 29, 149, 0.22)",
    },
  },
];

export function getAppBySlug(slug: string) {
  return apps.find((app) => app.slug === slug || app.runtimeSlug === slug);
}

export function getProfileByUsername(username: string) {
  return profiles.find((profile) => profile.username === username);
}

export function getAppsByProfile(username: string) {
  return apps.filter((app) => app.creator.username === username);
}
