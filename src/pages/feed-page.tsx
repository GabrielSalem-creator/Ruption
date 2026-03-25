import { FeedExperience } from "@/components/feed/feed-experience";
import { APP_NICHE } from "@/lib/env";
import { FeedItem } from "@/lib/types";

export function FeedPage({ items }: { items: FeedItem[] }) {
  return <main><div className="section-heading" style={{ marginTop: 0 }}><div><h1>Rupture feed</h1><p className="muted">Launch niche: {APP_NICHE}. Full-screen app cards, preview mode, stabilized mode on tap.</p></div></div><FeedExperience items={items} /></main>;
}
