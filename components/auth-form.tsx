"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Eye, EyeOff, Scissors } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { ensureAccessToken } from "@/lib/api";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const isSignup = mode === "sign-up";
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", image: "" });
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSignup && (form.password.length < 6 || !/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password))) return toast.error("Use at least 6 characters with uppercase and lowercase letters.");
    setBusy(true);
    try {
      const result = isSignup
        ? await authClient.signUp.email({ name: form.name.trim(), email: form.email.trim(), password: form.password, image: form.image || undefined })
        : await authClient.signIn.email({ email: form.email.trim(), password: form.password });
      if (result.error) throw new Error(result.error.message || "Could not authenticate.");
      const { user } = await ensureAccessToken();
      toast.success(isSignup ? "Your account is ready." : "Welcome back.");
      router.push(user.role === "admin" ? "/dashboard/admin" : "/dashboard/customer");
      router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Please try again."); }
    finally { setBusy(false); }
  }
  async function google() {
    try {
      const result = await authClient.signIn.social({ provider: "google", callbackURL: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/customer` });
      if (result.error) throw new Error(result.error.message);
    } catch { toast.error("Google sign in is not available right now."); }
  }
  return <main className="auth-page"><div className="auth-photo"><div className="auth-photo-overlay"/><div className="auth-photo-copy"><div className="eyebrow eyebrow-light"><span/> A LITTLE TIME, JUST FOR YOU</div><h1>Leave room<br/>for <em>yourself.</em></h1><p>Thoughtful care, lovely people, and a moment that belongs to you.</p><div className="auth-photo-bottom"><Scissors size={17}/> salonbook.</div></div></div><div className="auth-panel"><div className="auth-box"><div className="auth-mobile-brand"><span><Scissors size={16}/></span> salonbook<i>.</i></div><div className="eyebrow"><span/> {isSignup ? "YOUR MOMENT STARTS HERE" : "IT'S LOVELY TO SEE YOU"}</div><h2>{isSignup ? "Create your account" : "Welcome back."}</h2><p className="auth-subtitle">{isSignup ? "A few details and your next appointment is within reach." : "Sign in to manage your appointments and payments."}</p><button className="google-button" type="button" onClick={google}><span className="google-g">G</span> Continue with Google</button><div className="auth-divider"><span/> or use your email <span/></div>
    <form onSubmit={submit} className="auth-form">{isSignup && <label>Full name<input required autoComplete="name" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/></label>}<label>Email address<input type="email" required autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/></label>{isSignup && <label>Profile image URL <span className="optional">(optional)</span><input type="url" placeholder="https://..." value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}/></label>}<label>Password<div className="password-field"><input type={showPassword ? "text" : "password"} required minLength={6} autoComplete={isSignup ? "new-password" : "current-password"} placeholder="At least 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}/><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div></label>{isSignup && <small className="password-hint">Include one uppercase and one lowercase letter.</small>}<button className="button button-dark auth-submit" disabled={busy}>{busy ? "Please wait…" : isSignup ? "Create account" : "Sign in"}<ArrowUpRight size={16}/></button></form><div className="auth-switch">{isSignup ? "Already have an account?" : "New to SalonBook?"} <Link href={isSignup ? "/sign-in" : "/sign-up"}>{isSignup ? "Sign in" : "Create an account"}</Link></div><p className="auth-terms">By continuing, you agree to SalonBook’s <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.</p></div></div></main>;
}
