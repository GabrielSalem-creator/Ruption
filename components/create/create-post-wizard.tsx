"use client";

import { CheckCircle2, LoaderCircle, Sparkles } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { currentViewerInterests, profiles } from "@/lib/mock-data";
import { FeedItem, PreflightResult } from "@/lib/types";

const LOCAL_STORAGE_KEY = "rupture-user-apps";

export function CreatePostWizard() {
  const [step, setStep] = useState(1);
  const [url, setUrl] = useState("https://");
  const [preflight, setPreflight] = useState<PreflightResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState<FeedItem | null>(null);
  const [form, setForm] = useState({ title: "", hook: "", description: "", tags: "ai_tool, workflow", category: "ai_tool", intentLabel: "tool", whatItDoes: "", whoItsFor: "", resourcesNeeded: "", contactInfo: "", lookingForDevs: true, lookingForDesigners: false, lookingForFunding: false });

  const canAdvance = useMemo(() => {
    if (step === 1) return url.trim().startsWith("http");
    if (step === 2) return Boolean(preflight);
    if (step === 3) return form.title && form.hook && form.description && form.whatItDoes && form.whoItsFor;
    return true;
  }, [form, preflight, step, url]);

  async function runPreflight(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/preflight", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
      const payload = (await response.json()) as { data: PreflightResult };
      setPreflight(payload.data);
      setStep(3);
    } finally {
      setLoading(false);
    }
  }

  function publishDemo(event: FormEvent) {
    event.preventDefault();
    const creator = profiles[0];
    const newApp: FeedItem = {
      id: crypto.randomUUID(),
      slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `app-${Date.now()}`,
      title: form.title,
      hook: form.hook,
      description: form.description,
      appUrl: url,
      runtimeSlug: "prompt-studio",
      hostedBundleUrl: null,
      previewImageUrl: null,
      videoDemoUrl: null,
      previewMode: preflight?.fallbackMode === "interactive" ? "sandbox" : "static",
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      category: form.category as FeedItem["category"],
      intentLabel: form.intentLabel as FeedItem["intentLabel"],
      resourcesNeeded: form.resourcesNeeded,
      contactInfo: form.contactInfo,
      whoItsFor: form.whoItsFor,
      whatItDoes: form.whatItDoes,
      isVerified: false,
      creator,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: "0.1.0",
      changelog: "Initial demo submission through Rupture creator flow.",
      collaboration: { lookingForDevs: form.lookingForDevs, lookingForDesigners: form.lookingForDesigners, lookingForFunding: form.lookingForFunding },
      stats: { views: 0, likes: 0, comments: 0, saves: 0, avgSessionTimeSeconds: 0, bounceRate: 0, timeToValueSeconds: Math.ceil((preflight?.medianLoadTimeMs ?? 1800) / 1000), healthScore: preflight?.verdict === "pass" ? 86 : 71 },
      theme: { accent: "#22c55e", surface: "linear-gradient(135deg, rgba(34,197,94,0.28), rgba(15,23,42,0.92), rgba(59,130,246,0.2))", panel: "rgba(21, 128, 61, 0.2)" },
      recommendationScore: 0.18 * (currentViewerInterests.ai_tool ?? 0.5) + 0.14 * (currentViewerInterests.workflow ?? 0.4) + 0.12 * (preflight?.verdict === "pass" ? 1 : 0.65),
      reasons: ["Fresh submission", "Preflight checked", "Matches launch niche"],
    };
    try {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      const existing = raw ? (JSON.parse(raw) as FeedItem[]) : [];
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([newApp, ...existing]));
    } catch {}
    setPublished(newApp);
    setStep(4);
  }

  return <div className="panel"><div className="section-heading" style={{ marginTop: 0 }}><div><h1>Create a Rupture post</h1><p className="muted">Paste a URL, validate it, then publish a live app card into the feed.</p></div><span className="kicker"><Sparkles size={14} /> Demo-ready creator flow</span></div><div className="timeline">{["Paste URL", "Preflight", "Details", "Publish"].map((label, index) => <span className="timeline-node" key={label} data-active={index + 1 === step}><span>{index + 1}</span><span>{label}</span></span>)}</div><div style={{ height: 24 }} />{step <= 2 ? <form className="wizard-step" onSubmit={runPreflight}><label className="label">App URL<input className="input" value={url} onChange={(event) => setUrl(event.target.value)} /></label><div className="row"><button className="button" disabled={!canAdvance || loading} type="submit">{loading ? <LoaderCircle size={16} /> : null}Run automated preflight</button></div></form> : null}{step === 3 && preflight ? <form className="wizard-step" onSubmit={publishDemo}><div className="grid-3"><div className="sidebar-card"><div className="muted">Verdict</div><strong>{preflight.verdict}</strong></div><div className="sidebar-card"><div className="muted">Median load</div><strong>{preflight.medianLoadTimeMs} ms</strong></div><div className="sidebar-card"><div className="muted">Mode</div><strong>{preflight.fallbackMode}</strong></div></div><div className="form-grid"><label className="label">Title<input className="input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label><label className="label">Hook<input className="input" value={form.hook} onChange={(event) => setForm({ ...form, hook: event.target.value })} /></label><label className="label">Category<select className="select" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option value="ai_tool">AI tool</option><option value="agent">Agent</option><option value="productivity">Productivity</option><option value="developer_tool">Developer tool</option><option value="design_tool">Design tool</option></select></label><label className="label">Intent label<select className="select" value={form.intentLabel} onChange={(event) => setForm({ ...form, intentLabel: event.target.value })}><option value="tool">Tool</option><option value="utility">Utility</option><option value="experiment">Experiment</option><option value="game">Game</option></select></label></div><label className="label">Description<textarea className="textarea" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><div className="form-grid"><label className="label">What does it do?<textarea className="textarea" value={form.whatItDoes} onChange={(event) => setForm({ ...form, whatItDoes: event.target.value })} /></label><label className="label">Who is it for?<textarea className="textarea" value={form.whoItsFor} onChange={(event) => setForm({ ...form, whoItsFor: event.target.value })} /></label><label className="label">Resources needed<textarea className="textarea" value={form.resourcesNeeded} onChange={(event) => setForm({ ...form, resourcesNeeded: event.target.value })} /></label><label className="label">Contact info<textarea className="textarea" value={form.contactInfo} onChange={(event) => setForm({ ...form, contactInfo: event.target.value })} /></label></div><label className="label">Tags<input className="input" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} /></label><div className="row"><label className="chip"><input checked={form.lookingForDevs} onChange={(event) => setForm({ ...form, lookingForDevs: event.target.checked })} type="checkbox" /> Looking for devs</label><label className="chip"><input checked={form.lookingForDesigners} onChange={(event) => setForm({ ...form, lookingForDesigners: event.target.checked })} type="checkbox" /> Looking for designers</label><label className="chip"><input checked={form.lookingForFunding} onChange={(event) => setForm({ ...form, lookingForFunding: event.target.checked })} type="checkbox" /> Looking for funding</label></div><div className="row"><button className="button" disabled={!canAdvance} type="submit">Publish into feed</button></div></form> : null}{step === 4 && published ? <div className="wizard-step"><div className="panel" style={{ background: "rgba(16, 185, 129, 0.08)" }}><div className="row" style={{ marginBottom: "0.75rem" }}><CheckCircle2 size={18} /><strong>App published in demo mode</strong></div><p className="muted">Your app is stored locally in the browser so you can immediately see it in the feed.</p></div><div className="sidebar-card"><div className="split"><strong>{published.title}</strong><span className="chip">{published.intentLabel}</span></div><p className="muted">{published.hook}</p><div className="row">{published.tags.map((tag) => <span className="tag" key={tag}>#{tag}</span>)}</div></div></div> : null}</div>;
}
