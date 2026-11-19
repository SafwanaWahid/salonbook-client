"use client";

import Link from "next/link";
import { RefreshCw, Scissors } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="route-message"><div className="route-message-icon"><Scissors size={20}/></div><span className="eyebrow"><span/> A SMALL PAUSE</span><h1>We couldn’t load<br/><em>that page.</em></h1><p>Something interrupted this visit. Try again, or head back to the services that are ready for you.</p><div className="route-message-actions"><button className="button button-dark" onClick={() => reset()}>Try again <RefreshCw size={14}/></button><Link className="button button-outline" href="/services">Browse services</Link></div></main>;
}
