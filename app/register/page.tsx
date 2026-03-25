import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export default function RegisterPage() {
  return <main><div className="panel" style={{ maxWidth: 560, margin: "0 auto" }}><h1>Create account</h1><p className="muted">Publish real app records into the Rupture feed.</p><AuthForm mode="register" /><div className="row"><Link className="ghost-button" href="/login">Already have an account?</Link></div></div></main>;
}
