"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ username: "", displayName: "", email: "", password: "" });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "Authentication failed");
      router.push("/create");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return <form className="wizard-step" onSubmit={handleSubmit}>{mode === "register" ? <><label className="label">Username<input className="input" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} /></label><label className="label">Display name<input className="input" value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} /></label></> : null}<label className="label">Email<input className="input" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label className="label">Password<input className="input" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>{error ? <div className="chip" style={{ color: "#fecaca" }}>{error}</div> : null}<button className="button" disabled={loading} type="submit">{loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}</button></form>;
}
