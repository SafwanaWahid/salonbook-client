import Link from "next/link";
import { ArrowLeft, Scissors } from "lucide-react";

export default function NotFound() {
  return <main className="route-message"><div className="route-message-icon"><Scissors size={20}/></div><span className="eyebrow"><span/> THIS PAGE ISN’T HERE</span><h1>Let’s find your<br/><em>feel-good.</em></h1><p>That page may have moved. You can head back to explore our services and find a new favorite.</p><div className="route-message-actions"><Link className="button button-dark" href="/services">Explore services <ArrowLeft size={14}/></Link><Link className="button button-outline" href="/">Go home</Link></div></main>;
}
