import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return <main><div className="panel" style={{ maxWidth: 560, margin: "0 auto" }}><h1>Sign in</h1><p className="muted">Use the seeded demo account or create your own.</p><AuthForm mode="login" /><p className="muted">Demo credentials: mira@ruption.app / demo12345</p><div className="row"><Link className="ghost-button" href="/register">Need an account?</Link></div></div></main>;
}
