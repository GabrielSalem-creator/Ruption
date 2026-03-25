import { apps, currentViewerInterests } from "@/lib/mock-data";
import { FeedItem, InterestVector, RuptureApp } from "@/lib/types";

function normalize(value: number, max: number) {
  if (max <= 0) return 0;
  return Math.min(value / max, 1);
}

function buildAppVector(app: RuptureApp): InterestVector {
  const vector: InterestVector = {
    [app.category]: 0.82,
    [app.intentLabel]: 0.4,
  };

  for (const tag of app.tags) {
    vector[tag] = Math.max(vector[tag] ?? 0, 0.72);
  }

  const keywords = `${app.description} ${app.whatItDoes}`.toLowerCase();
  if (keywords.includes("agent")) vector.agent = Math.max(vector.agent ?? 0, 0.76);
  if (keywords.includes("copy")) vector.copy = Math.max(vector.copy ?? 0, 0.72);
  if (keywords.includes("workflow")) vector.workflow = Math.max(vector.workflow ?? 0, 0.72);
  if (keywords.includes("planning")) vector.planning = Math.max(vector.planning ?? 0, 0.74);
  if (keywords.includes("prompt")) vector.prompt = Math.max(vector.prompt ?? 0, 0.78);

  return vector;
}

function cosineSimilarity(a: InterestVector, b: InterestVector) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const key of keys) {
    const av = a[key] ?? 0;
    const bv = b[key] ?? 0;
    dot += av * bv;
    magA += av * av;
    magB += bv * bv;
  }

  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function computeReasons(app: RuptureApp, similarity: number): string[] {
  const reasons: string[] = [];
  if (similarity > 0.7) reasons.push(`High semantic match for ${app.tags[0]}`);
  if (app.stats.timeToValueSeconds <= 3) reasons.push("Fast time-to-value");
  if (app.stats.avgSessionTimeSeconds >= 40) reasons.push("Strong session depth");
  if (app.isVerified) reasons.push("Verified quality signal");
  if (app.collaboration.lookingForDevs) reasons.push("Open to collaboration");
  return reasons.slice(0, 3);
}

export function rankApps(interestVector: InterestVector = currentViewerInterests): FeedItem[] {
  const maxSession = Math.max(...apps.map((app) => app.stats.avgSessionTimeSeconds));
  const maxLikes = Math.max(...apps.map((app) => app.stats.likes));

  return apps
    .map((app) => {
      const appVector = buildAppVector(app);
      const similarity = cosineSimilarity(interestVector, appVector);
      const normalizedSession = normalize(app.stats.avgSessionTimeSeconds, maxSession);
      const interactionScore = normalize(app.stats.likes, maxLikes) * 0.55 + (1 - app.stats.bounceRate) * 0.45;
      const recencyDecay = 0.92;
      const qualityScore = app.stats.healthScore / 100;
      const explorationFactor = app.intentLabel === "experiment" ? 0.12 : 0.06;

      const recommendationScore =
        normalizedSession * 0.22 +
        interactionScore * 0.2 +
        similarity * 0.22 +
        recencyDecay * 0.12 +
        qualityScore * 0.18 +
        explorationFactor * 0.06;

      return {
        ...app,
        recommendationScore,
        reasons: computeReasons(app, similarity),
      } satisfies FeedItem;
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore);
}
