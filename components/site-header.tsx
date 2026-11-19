"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ChevronDown, Menu, Scissors, UserRound } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";

export function SiteHeader() {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);
  async function signOut() {
    try {
      await authClient.signOut();
      await apiFetch("/token", { method: "DELETE" });
      setOpen(false);
      toast.success("You have signed out.");
      router.push("/");
      router.refresh();
    } catch { toast.error("Could not sign out. Please try again."); }
  }
  return <header className="site-header"><div className="header-inner">
    <Link className="brand" href="/" aria-label="SalonBook home"><span className="brand-mark"><Scissors size={19} strokeWidth={1.8} /></span><span>salon<span className="brand-light">book</span><i>.</i></span></Link>
    <nav className="desktop-nav" aria-label="Main navigation"><Link href="/">Home</Link><Link href="/services">Services</Link><Link href="/#about">Our story</Link></nav>
    <div className="header-actions">{isPending ? <span className="avatar-placeholder"/> : data ? <div className="header-account"><button className="header-account-trigger" onClick={() => setOpen(!open)} aria-expanded={open}><span className="header-avatar"><UserRound size={15}/></span><span>{data.user.name?.split(" ")[0] || "Account"}</span><ChevronDown size={13}/></button>{open && <div className="header-dropdown"><Link href={(data.user as typeof data.user & { role?: string }).role === "admin" ? "/dashboard/admin" : "/dashboard/customer"} onClick={() => setOpen(false)}>Dashboard</Link><button onClick={signOut}>Sign out</button></div>}</div> : <><Link className="header-login" href="/sign-in">Sign in</Link><Link className="button button-dark header-cta" href="/services">Book an appointment <ArrowUpRight size={15}/></Link></>}</div>
    <button className="mobile-menu" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}><Menu size={22}/></button>
    {open && <div className="mobile-nav"><Link href="/" onClick={() => setOpen(false)}>Home</Link><Link href="/services" onClick={() => setOpen(false)}>Services</Link><Link href="/#about" onClick={() => setOpen(false)}>Our story</Link>{data ? <Link href={(data.user as typeof data.user & { role?: string }).role === "admin" ? "/dashboard/admin" : "/dashboard/customer"} onClick={() => setOpen(false)}>My dashboard</Link> : <Link href="/sign-in" onClick={() => setOpen(false)}>Sign in</Link>}</div>}
  </div></header>;
}
