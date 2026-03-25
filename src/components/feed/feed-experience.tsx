import { Heart, MessageCircle, Play, Save, UserCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FeedItem } from "@/lib/types";
import { StabilizedView } from "@/components/feed/stabilized-view";
import { toggleLike, toggleSave } from "@/lib/data";
import { CommentSheet } from "@/components/feed/comment-sheet";

function formatCompact(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function FeedExperience({ items }: { items: FeedItem[] }) {
  const [stabilizedApp, setStabilizedApp] = useState<FeedItem | null>(null);
  const [commentingApp, setCommentingApp] = useState<FeedItem | null>(null);
  const [localItems, setLocalItems] = useState(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const rankedItems = useMemo(() => [...localItems].sort((a, b) => b.recommendationScore - a.recommendationScore), [localItems]);

  async function handleLike(slug: string) {
    try {
      const result = await toggleLike(slug);
      setLocalItems((current) => current.map((item) => item.slug === slug ? { ...item, stats: { ...item.stats, likes: result.likes } } : item));
    } catch {}
  }

  async function handleSave(slug: string) {
    try {
      const result = await toggleSave(slug);
      setLocalItems((current) => current.map((item) => item.slug === slug ? { ...item, stats: { ...item.stats, saves: result.saves } } : item));
    } catch {}
  }

  return <div className="feed-mobile-wrap"><div className="phone-shell"><section className="feed-viewport">{rankedItems.map((app) => <article className="feed-card" key={app.id}><div className="feed-stage"><iframe className="feed-iframe" src={app.appUrl} sandbox="allow-scripts allow-same-origin allow-forms" loading="lazy" title={`${app.title} preview`} /><div className="feed-overlay"><div className="feed-copy"><div className="feed-status"><span className="kicker">{app.intentLabel}</span>{app.isVerified ? <span className="chip">Verified</span> : null}<span className="chip">{app.category.replace(/_/g, " ")}</span></div><div><div className="row"><strong>@{app.creator.username}</strong></div><h2>{app.title}</h2><p className="muted">{app.hook}</p></div><div className="row">{app.tags.map((tag) => <span className="tag" key={tag}>#{tag}</span>)}</div><div className="feed-hint">Scroll vertically for the next app. Tap open to lock interaction and fully use it.</div><button className="button" onClick={() => setStabilizedApp(app)} type="button"><Play size={16} /> Open live app</button></div><div className="side-actions"><button className="side-action" onClick={() => handleLike(app.slug)} type="button"><Heart size={18} /><span>{formatCompact(app.stats.likes)}</span></button><button className="side-action" onClick={() => setCommentingApp(app)} type="button"><MessageCircle size={18} /><span>{formatCompact(app.stats.comments)}</span></button><button className="side-action" onClick={() => handleSave(app.slug)} type="button"><Save size={18} /><span>{formatCompact(app.stats.saves)}</span></button><Link className="side-action" to={`/profile/${app.creator.username}`}><UserCircle2 size={18} /><span>Profile</span></Link></div></div></div></article>)}</section>{stabilizedApp ? <StabilizedView app={stabilizedApp} onClose={() => setStabilizedApp(null)} /> : null}{commentingApp ? <CommentSheet appId={commentingApp.id} appSlug={commentingApp.slug} onClose={() => setCommentingApp(null)} /> : null}</div></div>;
}
