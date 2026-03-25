"use client";

import { CheckCircle2, LoaderCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { FeedItem, PreflightResult } from "@/lib/types";

export function CreatePostWizard() {
  const [step, setStep] = useState(1);
  const [url, setUrl] = useState("https://");
  const [preflight, setPreflight] = useState<PreflightResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState<FeedItem | null>(null);
  const [session, setSession] = useState<{ username: string } | null>(null);
  const [form, setForm] = useState({ title: "", hook: "", description: "", tags: "ai_tool, workflow", category: "ai_tool", intentLabel: "tool", whatItDoes: "", whoItsFor: "", resourcesNeeded: "", contactInfo: "", lookingForDevs: true, lookingForDesigners: false, lookingForFunding: false });

  useEffect(() => {
    fetch("/api/session")
      .then((response) => response.json())
      .then((payload) => setSession(payload.data?.user ?? null))
      .catch(() => setSession(null));
  }, []);

  const canAdvance = useMemo(() => {
    if (!session) return false;
    if (step === 1) return url.trim().startsWith("http");
    if (step === 2) return Boolean(preflight);
    if (step === 3) return form.title && form.hook && form.description && form.whatItDoes && form.whoItsFor;
    return true;
  }, [form, preflight, session, step, url]);

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

  async function publishDemo(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          hook: form.hook,
          description: form.description,
          appUrl: url,
          tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          category: form.category,
          intentLabel: form.intentLabel,
          whatItDoes: form.whatItDoes,
          whoItsFor: form.whoItsFor,
          resourcesNeeded: form.resourcesNeeded,
          contactInfo: form.contactInfo,
          lookingForDevs: form.lookingForDevs,
          lookingForDesigners: form.lookingForDesigners,
          lookingForFunding: form.lookingForFunding,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "Publish failed");
      setPublished(payload.data as FeedItem);
      setStep(4);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Publish failed");
    } finally {
      setLoading(false);
    }
  }

  if (!session) {
    return <div className="panel"><h1>Create a Rupture post</h1><p className="muted">You need an account to publish into the real database-backed feed.</p><div className="row"><Link className="button" href="/login">Sign in</Link><Link className="ghost-button" href="/register">Create account</Link></div></div>;
  }

  return <div className="panel"><div className="section-heading" style={{ marginTop: 0 }}><div><h1>Create a Rupture post</h1><p className="muted">Signed in as @{session.username}. Publish directly into the persistent feed.</p></div><span className="kicker"><Sparkles size={14} /> Real full-stack creator flow</span></div><div className="timeline">{["Paste URL", "Preflight", "Details", "Publish"].map((label, index) => <span className="timeline-node" key={label} data-active={index + 1 === step}><span>{index + 1}</span><span>{label}</span></span>)}</div><div style={{ height: 24 }} />{step <= 2 ? <form className="wizard-step" onSubmit={runPreflight}><label className="label">App URL<input className="input" value={url} onChange={(event) => setUrl(event.target.value)} /></label><div className="row"><button className="button" disabled={!canAdvance || loading} type="submit">{loading ? <LoaderCircle size={16} /> : null}Run automated preflight</button></div></form> : null}{step === 3 && preflight ? <form className="wizard-step" onSubmit={publishDemo}><div className="grid-3"><div className="sidebar-card"><div className="muted">Verdict</div><strong>{preflight.verdict}</strong></div><div className="sidebar-card"><div className="muted">Median load</div><strong>{preflight.medianLoadTimeMs} ms</strong></div><div className="sidebar-card"><div className="muted">Mode</div><strong>{preflight.fallbackMode}</strong></div></div><div className="form-grid"><label className="label">Title<input className="input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label><label className="label">Hook<input className="input" value={form.hook} onChange={(event) => setForm({ ...form, hook: event.target.value })} /></label><label className="label">Category<select className="select" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option value="ai_tool">AI tool</option><option value="agent">Agent</option><option value="productivity">Productivity</option><option value="developer_tool">Developer tool</option><option value="design_tool">Design tool</option></select></label><label className="label">Intent label<select className="select" value={form.intentLabel} onChange={(event) => setForm({ ...form, intentLabel: event.target.value })}><option value="tool">Tool</option><option value="utility">Utility</option><option value="experiment">Experiment</option><option value="game">Game</option></select></label></div><label className="label">Description<textarea className="textarea" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><div className="form-grid"><label className="label">What does it do?<textarea className="textarea" value={form.whatItDoes} onChange={(event) => setForm({ ...form, whatItDoes: event.target.value })} /></label><label className="label">Who is it for?<textarea className="textarea" value={form.whoItsFor} onChange={(event) => setForm({ ...form, whoItsFor: event.target.value })} /></label><label className="label">Resources needed<textarea className="textarea" value={form.resourcesNeeded} onChange={(event) => setForm({ ...form, resourcesNeeded: event.target.value })} /></label><label className="label">Contact info<textarea className="textarea" value={form.contactInfo} onChange={(event) => setForm({ ...form, contactInfo: event.target.value })} /></label></div><label className="label">Tags<input className="input" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} /></label><div className="row"><label className="chip"><input checked={form.lookingForDevs} onChange={(event) => setForm({ ...form, lookingForDevs: event.target.checked })} type="checkbox" /> Looking for devs</label><label className="chip"><input checked={form.lookingForDesigners} onChange={(event) => setForm({ ...form, lookingForDesigners: event.target.checked })} type="checkbox" /> Looking for designers</label><label className="chip"><input checked={form.lookingForFunding} onChange={(event) => setForm({ ...form, lookingForFunding: event.target.checked })} type="checkbox" /> Looking for funding</label></div><div className="row"><button className="button" disabled={!canAdvance || loading} type="submit">{loading ? "Publishing..." : "Publish into feed"}</button></div></form> : null}{step === 4 && published ? <div className="wizard-step"><div className="panel" style={{ background: "rgba(16, 185, 129, 0.08)" }}><div className="row" style={{ marginBottom: "0.75rem" }}><CheckCircle2 size={18} /><strong>App published to the database-backed feed</strong></div><p className="muted">Your app now exists as a persistent record and will appear in the ranked feed.</p></div><div className="sidebar-card"><div className="split"><strong>{published.title}</strong><span className="chip">{published.intentLabel}</span></div><p className="muted">{published.hook}</p><div className="row">{published.tags.map((tag) => <span className="tag" key={tag}>#{tag}</span>)}</div><div className="row"><Link className="button" href="/feed">View feed</Link><Link className="ghost-button" href={`/apps/${published.slug}`}>Open app</Link></div></div></div> : null}</div>;
}
