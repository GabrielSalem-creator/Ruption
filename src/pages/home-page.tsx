import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { APP_NICHE } from "@/lib/env";
import { FeedItem } from "@/lib/types";

export function HomePage({ items }: { items: FeedItem[] }) {
  const heroApp = items[0];

  return <main><section className="hero"><div className="card hero-copy"><div><span className="kicker"><Sparkles size={14} /> {APP_NICHE}</span><h1 className="title-xl">Discover live web apps the way people scroll video.</h1><p className="subtitle">Rupture is a TikTok-style feed for real interactive apps. Every post is a live surface. Scroll. Stop. Tap. Stabilize. Use.</p><div className="row" style={{ marginTop: "1.5rem" }}><Link className="button" to="/feed">Open the live feed <ArrowRight size={16} /></Link><Link className="ghost-button" to="/create">Publish your app</Link></div></div><div className="grid-3"><div className="stat-card"><div className="muted">Product rule</div><strong>Live execution</strong></div><div className="stat-card"><div className="muted">Load target</div><strong>&lt; 2s</strong></div><div className="stat-card"><div className="muted">Phone first</div><strong>Social-native</strong></div></div></div><div className="preview-device">{heroApp ? <><div className="hero-preview-label kicker"><ShieldCheck size={14} /> Live preview</div><iframe src={heroApp.appUrl} sandbox="allow-scripts allow-same-origin allow-forms" title={`${heroApp.title} hero preview`} /><div className="feed-overlay"><div className="feed-copy"><div className="feed-status"><span className="chip">@{heroApp.creator.username}</span><span className="chip">{heroApp.intentLabel}</span></div><div><h2>{heroApp.title}</h2><p className="muted">{heroApp.hook}</p></div><button className="button" onClick={() => window.location.assign('/feed')} type="button">Enter feed</button></div></div></> : null}</div></section></main>;
}
