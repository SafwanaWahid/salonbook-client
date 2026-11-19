import Link from "next/link";
import { Camera, ThumbsUp, ArrowUpRight, Scissors } from "lucide-react";

export function SiteFooter() {
  return <footer className="site-footer"><div className="footer-main">
    <div className="footer-brand"><Link className="brand brand-footer" href="/"><span className="brand-mark"><Scissors size={18}/></span><span>salon<span className="brand-light">book</span><i>.</i></span></Link><p>A little time for yourself can change your whole day. Find your moment with us.</p><div className="socials"><a href="#instagram" aria-label="Instagram"><Camera size={17}/></a><a href="#facebook" aria-label="Facebook"><ThumbsUp size={17}/></a></div></div>
    <div><h3>Explore</h3><Link href="/services">All services</Link><Link href="/#about">About us</Link><Link href="/sign-in">My appointments</Link></div>
    <div><h3>Visit us</h3><p>27 Rosewood Avenue<br/>Dhaka 1212, Bangladesh</p><p>Sat–Thu, 10:00 AM – 8:00 PM<br/>Friday, 2:00 PM – 8:00 PM</p></div>
    <div><h3>Say hello</h3><a href="tel:+8801700000000">+880 1700-000000</a><a href="mailto:hello@salonbook.com">hello@salonbook.com</a><Link className="footer-link" href="/services">Find your service <ArrowUpRight size={14}/></Link></div>
  </div><div className="footer-bottom"><span>© 2026 SalonBook. Made for your moment.</span><span>Thoughtful care, beautifully booked.</span></div></footer>;
}
