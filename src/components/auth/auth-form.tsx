import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmail, signUpWithEmail } from "@/lib/auth";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({ username: "", displayName: "", email: "", password: "" });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "login") {
        await signInWithEmail({ email: form.email, password: form.password });
        navigate("/create");
      } else {
        await signUpWithEmail({ email: form.email, password: form.password, username: form.username, displayName: form.displayName || form.username });
        setMessage("Account created. If email confirmation is enabled in Supabase, confirm your email before signing in.");
        navigate("/create");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return <form className="wizard-step" onSubmit={handleSubmit}>{mode === "register" ? <><label className="label">Username<input className="input" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} /></label><label className="label">Display name<input className="input" value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} /></label></> : null}<label className="label">Email<input className="input" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label className="label">Password<input className="input" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>{error ? <div className="chip" style={{ color: "#fecaca" }}>{error}</div> : null}{message ? <div className="chip" style={{ color: "#d1fae5" }}>{message}</div> : null}<button className="button" disabled={loading} type="submit">{loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}</button></form>;
}
