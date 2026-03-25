"use client";

import { Flame, Heart, MessageCircle, Rocket, Save, UserCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FeedItem } from "@/lib/types";
import { StabilizedView } from "@/components/feed/stabilized-view";

const LOCAL_STORAGE_KEY = "rupture-user-apps";

function formatCompact(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function FeedExperience({ initialItems }: { initialItems: FeedItem[] }) {
  const [stabilizedApp, setStabilizedApp] = useState<FeedItem | null>(null);
  const [localApps, setLocalApps] = useState<FeedItem[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return;
      setLocalApps(JSON.parse(raw) as FeedItem[]);
    } catch {
      setLocalApps([]);
    }
  }, []);

  const items = useMemo(() => {
    const map = new Map<string, FeedItem>();
    [...localApps, ...initialItems].forEach((item) => map.set(item.slug, item));
    return [...map.values()].sort((a, b) => b.recommendationScore - a.recommendationScore);
  }, [initialItems, localApps]);

  return (
    <div className="feed-shell">
      <section className="feed-viewport">
        {items.map((app) => (
          <article className="feed-card" key={app.id}>
            <div className="feed-card__preview">
              <div className="preview-surface" style={{ background: app.theme.surface }}>
                <div className="split">
                  <span className="kicker"><Flame size={14} /> {app.intentLabel}</span>
                  <span className="metric-pill">{Math.round(app.recommendationScore * 100)}% fit</span>
                </div>
                <div className="preview-window">
                  <div className="split"><strong>{app.title}</strong><span className="muted">Preview mode</span></div>
                  <div className="grid-2">
                    <div className="preview-widget"><div className="muted">Primary action</div><strong>{app.whatItDoes}</strong></div>
                    <div className="preview-widget"><div className="muted">Time to value</div><strong>{app.stats.timeToValueSeconds}s</strong></div>
                  </div>
                  <div className="preview-widget">
                    <div className="muted">Preview insight</div>
                    <div className="row">{app.reasons.map((reason) => <span className="chip" key={reason}>{reason}</span>)}</div>
                  </div>
                </div>
                <div className="preview-footer">
                  <div>
                    <strong>Tap to stabilize</strong>
                    <div className="muted">Two-finger gesture always keeps feed scrolling.</div>
                  </div>
                  <button className="button" onClick={() => setStabilizedApp(app)} type="button">Stabilize app</button>
                </div>
              </div>
            </div>

            <div className="feed-card__meta">
              <div className="side-actions">
                <button className="side-action" type="button"><Heart size={18} /><span>{formatCompact(app.stats.likes)}</span></button>
                <button className="side-action" type="button"><MessageCircle size={18} /><span>{formatCompact(app.stats.comments)}</span></button>
                <button className="side-action" type="button"><Save size={18} /><span>{formatCompact(app.stats.saves)}</span></button>
                <Link className="side-action" href={`/profile/${app.creator.username}`}><UserCircle2 size={18} /><span>Profile</span></Link>
                <Link className="side-action" href={`/apps/${app.slug}`}><Rocket size={18} /><span>Details</span></Link>
              </div>
              <div className="app-info">
                <div>
                  <div className="row">
                    <strong>@{app.creator.username}</strong>
                    {app.isVerified ? <span className="chip">Verified</span> : null}
                    <span className="chip">{app.category.replaceAll("_", " ")}</span>
                  </div>
                  <h3 style={{ fontSize: "1.8rem", marginTop: "0.65rem" }}>{app.title}</h3>
                  <p className="muted">{app.hook}</p>
                </div>
                <div className="row">{app.tags.map((tag) => <span className="tag" key={tag}>#{tag}</span>)}</div>
                <div className="grid-2">
                  <div className="sidebar-card"><div className="muted">Avg session</div><strong>{app.stats.avgSessionTimeSeconds}s</strong></div>
                  <div className="sidebar-card"><div className="muted">Bounce rate</div><strong>{Math.round(app.stats.bounceRate * 100)}%</strong></div>
                </div>
                <Link className="ghost-button" href={`/apps/${app.slug}`}>Open app brief</Link>
              </div>
            </div>
          </article>
        ))}
      </section>

      <aside className="sticky-stack">
        <div className="sidebar-card">
          <strong>Feed rules</strong>
          <div style={{ height: 12 }} />
          <div className="chip" style={{ marginBottom: "0.5rem" }}>No login walls</div>
          <div className="chip" style={{ marginBottom: "0.5rem" }}>No load over 2 seconds</div>
          <div className="chip" style={{ marginBottom: "0.5rem" }}>No broken embeds</div>
          <div className="chip">No screenshot-only listings</div>
        </div>
        <div className="sidebar-card">
          <strong>Recommendation model</strong>
          <p className="muted">Ranking balances session depth, interaction score, semantic similarity, freshness, and quality.</p>
          <div className="grid-2">
            <div className="metric-pill">0.22 session</div>
            <div className="metric-pill">0.20 interaction</div>
            <div className="metric-pill">0.22 similarity</div>
            <div className="metric-pill">0.18 quality</div>
          </div>
        </div>
        <div className="sidebar-card">
          <strong>Creator CTA</strong>
          <p className="muted">Paste a URL, run preflight, add metadata, publish a demo-ready app.</p>
          <Link className="button" href="/create">Publish to Rupture</Link>
        </div>
      </aside>

      {stabilizedApp ? <StabilizedView app={stabilizedApp} onClose={() => setStabilizedApp(null)} /> : null}
    </div>
  );
}
