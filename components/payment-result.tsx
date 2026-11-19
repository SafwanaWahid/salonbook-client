"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, CheckCircle2, CircleDollarSign, Clock3 } from "lucide-react";
import { apiFetch, ensureAccessToken } from "@/lib/api";

type Booking = { _id: string; stripeSessionId?: string; paymentStatus: string; service?: { serviceName: string } | null };
export function PaymentResult({ cancelled = false }: { cancelled?: boolean }) {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [confirmed, setConfirmed] = useState(false);
  const [serviceName, setServiceName] = useState("your salon appointment");
  useEffect(() => {
    if (cancelled || confirmed) return;
    let alive = true;
    let count = 0;
    async function refresh() {
      try {
        await ensureAccessToken();
        const result = await apiFetch<{ appointments: Booking[] }>("/appointments/mine");
        const item = sessionId ? result.appointments.find((booking) => booking.stripeSessionId === sessionId) : null;
        if (!alive) return;
        if (item?.service?.serviceName) setServiceName(item.service.serviceName);
        if (item?.paymentStatus === "paid") setConfirmed(true);
      } catch { /* The user can still return to the dashboard and check status. */ }
      count += 1;
      if (alive && !confirmed && count < 6) window.setTimeout(refresh, 2500);
    }
    void refresh();
    return () => { alive = false; };
  }, [cancelled, confirmed, sessionId]);
  return <main className="payment-page"><section className={`payment-card ${cancelled ? "cancelled-card" : ""}`}><div className="payment-icon">{cancelled ? <CircleDollarSign size={25}/> : confirmed ? <CheckCircle2 size={27}/> : <Clock3 size={25}/>}</div><span className="eyebrow"><span/> {cancelled ? "NO PAYMENT TAKEN" : confirmed ? "PAYMENT CONFIRMED" : "PAYMENT PROCESSING"}</span><h1>{cancelled ? "Your appointment\nis still waiting." : confirmed ? "Your moment is\nall yours." : "Just confirming\nyour payment."}</h1><p>{cancelled ? "Checkout was cancelled, so no payment was collected. Your confirmed appointment remains in your dashboard if you’d like to try again." : confirmed ? `Your payment for ${serviceName} has been verified. We’ve updated your appointment and saved your receipt.` : "Stripe is confirming your payment securely. Your appointment will show as paid as soon as the verified confirmation reaches SalonBook."}</p><div className="payment-verified-note"><span>✳</span><span>Appointment payment status changes only after Stripe’s verified confirmation.</span></div><div className="payment-actions"><Link href="/dashboard/customer" className="button button-dark">Go to my appointments <ArrowUpRight size={15}/></Link><Link href="/services" className="payment-back">Explore more services</Link></div></section></main>;
}
