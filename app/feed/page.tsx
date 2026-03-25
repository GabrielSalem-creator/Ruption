import { FeedExperience } from "@/components/feed/feed-experience";
import { appConfig } from "@/lib/env";
import { listFeedItems } from "@/lib/server/repository";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  return <main><div className="section-heading" style={{ marginTop: 0 }}><div><h1>Rupture feed</h1><p className="muted">Launch niche: {appConfig.niche}. Full-screen app cards, preview mode, stabilized mode on tap.</p></div></div><FeedExperience initialItems={await listFeedItems()} /></main>;
}
