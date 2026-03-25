"use client";

import { ExternalLink, Heart, Info, MessageCircleWarning, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FeedItem } from "@/lib/types";

export function StabilizedView({ app, onClose }: { app: FeedItem; onClose: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const [forceFallback, setForceFallback] = useState(false);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const runtimeUrl = useMemo(() => app.appUrl, [app.appUrl]);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-frame">
        <div className="iframe-shell">
          {!forceFallback ? (
            <iframe
              src={runtimeUrl}
              sandbox="allow-scripts allow-same-origin allow-forms"
              loading="lazy"
              title={`${app.title} runtime`}
              onLoad={() => setLoaded(true)}
            />
          ) : null}

          {!loaded ? (
            <div className="fallback-layer">
              <div className="panel" style={{ maxWidth: 460 }}>
                <div className="row" style={{ marginBottom: "0.75rem" }}>
                  <ShieldCheck size={18} />
                  <strong>Stabilized mode is booting</strong>
                </div>
                <p className="muted">
                  Rupture uses a sandboxed iframe for live interaction. If a runtime blocks embedding, the system
                  falls back to preview or video mode.
                </p>
                <div className="row">
                  <button className="button" onClick={() => setLoaded(true)} type="button">Continue</button>
                  <button className="ghost-button" onClick={() => setForceFallback(true)} type="button">Use fallback</button>
                </div>
              </div>
            </div>
          ) : null}

          {forceFallback ? (
            <div className="fallback-layer">
              <div className="panel" style={{ maxWidth: 520 }}>
                <div className="row" style={{ marginBottom: "0.75rem" }}>
                  <MessageCircleWarning size={18} />
                  <strong>Fallback mode active</strong>
                </div>
                <p className="muted">
                  This demo exposes how Rupture would degrade gracefully when an embed blocks interaction.
                </p>
                <div className="row">
                  <Link className="button" href={`/apps/${app.slug}`}>Open app page</Link>
                  <Link className="ghost-button" href={app.appUrl} target="_blank">
                    <ExternalLink size={16} /> Open runtime
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <aside className="detail-grid">
          <div className="detail-grid__panel">
            <div className="split" style={{ marginBottom: "1rem" }}>
              <strong>{app.title}</strong>
              <button className="ghost-button" onClick={onClose} type="button"><X size={16} /> Exit</button>
            </div>
            <p className="muted">{app.hook}</p>
            <div className="row">
              <span className="metric-pill">v{app.version}</span>
              <span className="metric-pill">{app.intentLabel}</span>
              <span className="metric-pill">{Math.round(app.recommendationScore * 100)} match</span>
            </div>
          </div>

          <div className="detail-grid__panel">
            <div className="split" style={{ marginBottom: "0.75rem" }}>
              <strong>Floating controls</strong>
              <Link className="ghost-button" href={`/apps/${app.slug}`}><Info size={16} /> Details</Link>
            </div>
            <div className="grid-2">
              <button className="ghost-button" type="button"><Heart size={16} /> Like</button>
              <Link className="ghost-button" href={app.appUrl}><ExternalLink size={16} /> Deep link</Link>
            </div>
          </div>

          <div className="detail-grid__panel">
            <strong>Why it ranks</strong>
            <div style={{ height: 12 }} />
            {app.reasons.map((reason) => <div className="chip" key={reason} style={{ marginBottom: "0.5rem" }}>{reason}</div>)}
          </div>

          <div className="detail-grid__panel">
            <strong>Collaboration</strong>
            <div style={{ height: 12 }} />
            <div className="row">
              {app.collaboration.lookingForDevs ? <span className="chip">Looking for devs</span> : null}
              {app.collaboration.lookingForDesigners ? <span className="chip">Looking for designers</span> : null}
              {app.collaboration.lookingForFunding ? <span className="chip">Looking for funding</span> : null}
            </div>
            <p className="muted" style={{ marginBottom: 0 }}>{app.resourcesNeeded}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
