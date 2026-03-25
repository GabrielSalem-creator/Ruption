import { Link } from "react-router-dom";
import { AuthForm } from "@/components/auth/auth-form";
export function RegisterPage() { return <main><div className="panel" style={{ maxWidth: 560, margin: "0 auto" }}><h1>Create account</h1><p className="muted">This creates a Supabase-authenticated account for Rupture.</p><AuthForm mode="register" /><div className="row"><Link className="ghost-button" to="/login">Already have an account?</Link></div></div></main>; }
