import { Link } from "react-router-dom";
import { AuthForm } from "@/components/auth/auth-form";
export function LoginPage() { return <main><div className="panel" style={{ maxWidth: 560, margin: "0 auto" }}><h1>Sign in</h1><p className="muted">Use your Supabase email and password.</p><AuthForm mode="login" /><div className="row"><Link className="ghost-button" to="/register">Need an account?</Link></div></div></main>; }
