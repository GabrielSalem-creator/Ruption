import { CheckCircle2, LoaderCircle, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { runPreflight } from "@/lib/preflight";
import { hasSupabase } from "@/lib/env";
import { supabase } from "@/lib/supabase";
import { FeedItem, PreflightResult } from "@/lib/types";

async function ensureSupabaseBackendReady() {
  const bootstrapSecret = import.meta.env.VITE_SUPABASE_BOOTSTRAP_SECRET;
  if (!bootstrapSecret) {
    throw new Error("Supabase backend is not initialized. Run supabase/schema.sql and supabase/seed.sql, or set VITE_SUPABASE_BOOTSTRAP_SECRET for automated bootstrap.");
  }

  const response = await fetch("/api/bootstrap-supabase", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${bootstrapSecret}`,
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: "Bootstrap failed" }));
    throw new Error(payload.error ?? "Bootstrap failed");
  }
}

export function CreatePostWizard() {
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [url, setUrl] = useState("https://");
  const [preflight, setPreflight] = useState<PreflightResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState<FeedItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", hook: "", description: "", tags: "ai_tool, workflow", category: "ai_tool", intentLabel: "tool", whatItDoes: "", whoItsFor: "", resourcesNeeded: "", contactInfo: "", lookingForDevs: true, lookingForDesigners: false, lookingForFunding: false });

  const canAdvance = useMemo(() => {
    if (!user) return false;
    if (step === 1) return url.trim().startsWith("http");
    if (step === 2) return Boolean(preflight);
    if (step === 3) return form.title && form.hook && form.description && form.whatItDoes && form.whoItsFor;
    return true;
  }, [form, preflight, step, url, user]);

  async function handlePreflight(event: React.FormEvent) {
    event.preventDefault();
    const result = runPreflight(url);
    setPreflight(result);
    setStep(3);
  }

  async function handlePublish(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!hasSupabase() || !supabase) {
        throw new Error("Supabase env vars are missing. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      }

      const result = preflight ?? runPreflight(url);
      const payload = {
        title: form.title,
        hook: form.hook,
        description: form.description,
        app_url: url,
        runtime_slug: "prompt-studio",
        preview_mode: result.fallbackMode === "interactive" ? "sandbox" : "static",
        tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        category: form.category,
        intent_label: form.intentLabel,
        resources_needed: form.resourcesNeeded,
        contact_info: form.contactInfo,
        who_its_for: form.whoItsFor,
        what_it_does: form.whatItDoes,
        collaboration: {
          lookingForDevs: form.lookingForDevs,
          lookingForDesigners: form.lookingForDesigners,
          lookingForFunding: form.lookingForFunding,
        },
        preflight_result: result,
      };

      const sessionResult = await supabase.auth.getSession();
      const accessToken = sessionResult.data.session?.access_token;
      if (!accessToken) {
        throw new Error("No active authenticated session found.");
      }

      let response = await fetch("/api/create-app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const failedPayload = await response.json().catch(() => ({ error: "Publish failed" }));
        const missingRpc =
          String(failedPayload.error ?? "").includes("create_app_secure") ||
          String(failedPayload.error ?? "").includes("relation") ||
          response.status === 404;

        if (missingRpc) {
          await ensureSupabaseBackendReady();
          response = await fetch("/api/create-app", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
          });
        }
      }

      const publishPayload = await response.json().catch(() => ({ error: "Publish failed" }));
      if (!response.ok) {
        throw new Error(publishPayload.error ?? "Publish failed");
      }

      setPublished(publishPayload.data as FeedItem);
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return <div className="panel"><p className="muted">Checking session...</p></div>;
  }

  if (!user) {
    return <div className="panel"><h1>Create a Rupture post</h1><p className="muted">You need an authenticated Supabase account to publish into the feed.</p><div className="row"><Link className="button" to="/login">Sign in</Link><Link className="ghost-button" to="/register">Create account</Link></div></div>;
  }

  return <div className="panel"><div className="section-heading" style={{ marginTop: 0 }}><div><h1>Create a Rupture post</h1><p className="muted">Signed in as @{user.username ?? user.email?.split("@")[0]}. Secure publish goes through a Supabase RPC with RLS.</p></div><span className="kicker"><Sparkles size={14} /> Security-first creator flow</span></div><div className="timeline">{["Paste URL", "Preflight", "Details", "Publish"].map((label, index) => <span className="timeline-node" key={label} data-active={index + 1 === step}><span>{index + 1}</span><span>{label}</span></span>)}</div><div style={{ height: 24 }} />{step <= 2 ? <form className="wizard-step" onSubmit={handlePreflight}><label className="label">App URL<input className="input" value={url} onChange={(event) => setUrl(event.target.value)} /></label><div className="row"><button className="button" disabled={!canAdvance} type="submit">Run automated preflight</button></div></form> : null}{step === 3 && preflight ? <form className="wizard-step" onSubmit={handlePublish}><div className="grid-3"><div className="sidebar-card"><div className="muted">Verdict</div><strong>{preflight.verdict}</strong></div><div className="sidebar-card"><div className="muted">Median load</div><strong>{preflight.medianLoadTimeMs} ms</strong></div><div className="sidebar-card"><div className="muted">Mode</div><strong>{preflight.fallbackMode}</strong></div></div><div className="form-grid"><label className="label">Title<input className="input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label><label className="label">Hook<input className="input" value={form.hook} onChange={(event) => setForm({ ...form, hook: event.target.value })} /></label><label className="label">Category<select className="select" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option value="ai_tool">AI tool</option><option value="agent">Agent</option><option value="productivity">Productivity</option><option value="developer_tool">Developer tool</option><option value="design_tool">Design tool</option></select></label><label className="label">Intent label<select className="select" value={form.intentLabel} onChange={(event) => setForm({ ...form, intentLabel: event.target.value })}><option value="tool">Tool</option><option value="utility">Utility</option><option value="experiment">Experiment</option><option value="game">Game</option></select></label></div><label className="label">Description<textarea className="textarea" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><div className="form-grid"><label className="label">What does it do?<textarea className="textarea" value={form.whatItDoes} onChange={(event) => setForm({ ...form, whatItDoes: event.target.value })} /></label><label className="label">Who is it for?<textarea className="textarea" value={form.whoItsFor} onChange={(event) => setForm({ ...form, whoItsFor: event.target.value })} /></label><label className="label">Resources needed<textarea className="textarea" value={form.resourcesNeeded} onChange={(event) => setForm({ ...form, resourcesNeeded: event.target.value })} /></label><label className="label">Contact info<textarea className="textarea" value={form.contactInfo} onChange={(event) => setForm({ ...form, contactInfo: event.target.value })} /></label></div><label className="label">Tags<input className="input" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} /></label><div className="row"><label className="chip"><input checked={form.lookingForDevs} onChange={(event) => setForm({ ...form, lookingForDevs: event.target.checked })} type="checkbox" /> Looking for devs</label><label className="chip"><input checked={form.lookingForDesigners} onChange={(event) => setForm({ ...form, lookingForDesigners: event.target.checked })} type="checkbox" /> Looking for designers</label><label className="chip"><input checked={form.lookingForFunding} onChange={(event) => setForm({ ...form, lookingForFunding: event.target.checked })} type="checkbox" /> Looking for funding</label></div>{error ? <div className="chip" style={{ color: "#fecaca" }}>{error}</div> : null}<div className="row"><button className="button" disabled={!canAdvance || loading} type="submit">{loading ? <><LoaderCircle size={16} /> Publishing...</> : "Publish into feed"}</button></div></form> : null}{step === 4 && published ? <div className="wizard-step"><div className="panel" style={{ background: "rgba(16, 185, 129, 0.08)" }}><div className="row" style={{ marginBottom: "0.75rem" }}><CheckCircle2 size={18} /><strong>App published through Supabase</strong></div><p className="muted">The app was written through a security-constrained backend function instead of a raw open insert.</p></div><div className="sidebar-card"><div className="split"><strong>{published.title}</strong><span className="chip">{published.intentLabel}</span></div><p className="muted">{published.hook}</p><div className="row">{published.tags.map((tag) => <span className="tag" key={tag}>#{tag}</span>)}</div><div className="row"><Link className="button" to="/feed">View feed</Link><Link className="ghost-button" to={`/apps/${published.slug}`}>Open app</Link></div></div></div> : null}</div>;
}
