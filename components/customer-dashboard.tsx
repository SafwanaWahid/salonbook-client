"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CircleUserRound, Clock3, LayoutDashboard, Scissors, CreditCard, X } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { apiFetch, ensureAccessToken } from "@/lib/api";

type Appointment = { _id: string; appointmentDate: string; timeSlot: string; message?: string; servicePrice: number; status: string; paymentStatus: string; createdAt: string; service?: { serviceName: string; category: string; image: string } | null };
type Overview = { totalAppointments: number; pendingAppointments: number; confirmedAppointments: number; cancelledAppointments: number };
type Transaction = { _id: string; amount: number; currency: string; status: string; createdAt: string; stripeSessionId: string; service?: { serviceName: string } | null };
const initialOverview = { totalAppointments: 0, pendingAppointments: 0, confirmedAppointments: 0, cancelledAppointments: 0 };

export function CustomerDashboard() {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();
  const [overview, setOverview] = useState<Overview>(initialOverview);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ name: "", phone: "", image: "" });
  async function load() {
    try {
      await ensureAccessToken();
      const [counts, bookings, payments] = await Promise.all([
        apiFetch<Overview>("/customer/overview"), apiFetch<{ appointments: Appointment[] }>("/appointments/mine"), apiFetch<{ transactions: Transaction[] }>("/transactions"),
      ]);
      setOverview(counts); setAppointments(bookings.appointments); setTransactions(payments.transactions);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not load your dashboard."); }
    finally { setLoading(false); }
  }
  async function cancel(id: string) {
    try { await apiFetch(`/appointments/${id}/cancel`, { method: "PATCH" }); toast.success("Appointment cancelled."); await load(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not cancel this appointment."); }
  }
  async function pay(id: string) {
    try { const result = await apiFetch<{ checkoutUrl: string }>(`/appointments/${id}/checkout`, { method: "POST" }); window.location.assign(result.checkoutUrl); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not start payment."); }
  }
  async function saveProfile(event: React.FormEvent) {
    event.preventDefault(); setSaving(true);
    const payload = { ...profile, name: profile.name || data?.user.name || "", image: profile.image || data?.user.image || "" };
    try { await apiFetch("/profile", { method: "PATCH", body: JSON.stringify(payload) }); toast.success("Profile updated."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not update your profile."); }
    finally { setSaving(false); }
  }
  useEffect(() => {
    if (isPending) return;
    if (!data) { router.replace("/sign-in"); return; }
    const role = (data.user as typeof data.user & { role?: string }).role;
    if (role === "admin") { router.replace("/dashboard/admin"); return; }
    let active = true;
    async function fetchDashboard() {
      try {
        await ensureAccessToken();
        const [counts, bookings, payments] = await Promise.all([
          apiFetch<Overview>("/customer/overview"), apiFetch<{ appointments: Appointment[] }>("/appointments/mine"), apiFetch<{ transactions: Transaction[] }>("/transactions"),
        ]);
        if (active) { setOverview(counts); setAppointments(bookings.appointments); setTransactions(payments.transactions); }
      } catch (error) { if (active) toast.error(error instanceof Error ? error.message : "Could not load your dashboard."); }
      finally { if (active) setLoading(false); }
    }
    void fetchDashboard();
    return () => { active = false; };
  }, [data, isPending, router]);
  if (isPending || loading && !data) return <DashboardLoading/>;
  return <main className="dashboard-page"><div className="dashboard-shell"><aside className="dashboard-sidebar"><Link href="/" className="dash-brand"><span><Scissors size={16}/></span> salonbook<i>.</i></Link><div className="dash-user"><div className="dash-avatar">{data?.user.name?.slice(0,1) || "S"}</div><div><strong>{data?.user.name}</strong><span>Customer account</span></div></div><div className="dash-nav-label">YOUR SPACE</div><button className={tab === "overview" ? "dash-nav active" : "dash-nav"} onClick={() => setTab("overview")}><LayoutDashboard size={16}/> Overview</button><button className={tab === "appointments" ? "dash-nav active" : "dash-nav"} onClick={() => setTab("appointments")}><CalendarDays size={16}/> My appointments <span>{overview.totalAppointments}</span></button><button className={tab === "profile" ? "dash-nav active" : "dash-nav"} onClick={() => { setProfile({ name: data?.user.name || "", phone: (data?.user as { phone?: string } | undefined)?.phone || "", image: data?.user.image || "" }); setTab("profile"); }}><CircleUserRound size={16}/> My profile</button><button className={tab === "payments" ? "dash-nav active" : "dash-nav"} onClick={() => setTab("payments")}><CreditCard size={16}/> Payments</button><Link className="dash-back-link" href="/services"><Scissors size={15}/> Explore services</Link><div className="dash-sidebar-bottom">A little time, just for you.</div></aside><section className="dashboard-content"><div className="dashboard-top"><div><span className="eyebrow"><span/> YOUR SALONBOOK</span><h1>{tab === "overview" ? `Hello, ${data?.user.name?.split(" ")[0] || "there"}.` : tab === "appointments" ? "My appointments" : tab === "profile" ? "My profile" : "Payment history"}</h1></div><div className="dashboard-top-note"><span className="dash-status-dot"/> All your moments, in one place</div></div>{tab === "overview" && <><p className="dashboard-intro">Here’s a little overview of your self-care plans.</p><div className="stats-grid">{[["Total requests", overview.totalAppointments, "all your appointments"], ["Pending", overview.pendingAppointments, "waiting for confirmation"], ["Confirmed", overview.confirmedAppointments, "ready when you are"], ["Cancelled", overview.cancelledAppointments, "past requests"]].map(([label, value, hint]) => <div className="stat-card" key={String(label)}><span>{label}</span><strong>{value}</strong><small>{hint}</small></div>)}</div><div className="dash-section-heading"><div><span className="eyebrow"><span/> YOUR NEXT LITTLE RESET</span><h2>Recent appointments</h2></div><button className="dash-inline-link" onClick={() => setTab("appointments")}>See all <span>→</span></button></div><AppointmentList appointments={appointments.slice(0, 3)} cancel={cancel} pay={pay}/><div className="dash-discover"><div><span className="eyebrow"><span/> A LITTLE TIME, JUST FOR YOU</span><h2>Ready for your next<br/><em>feel-good moment?</em></h2></div><Link href="/services" className="button button-dark">Explore services <span>↗</span></Link></div></>}{tab === "appointments" && <><p className="dashboard-intro">Your appointment requests and their latest status.</p><AppointmentList appointments={appointments} cancel={cancel} pay={pay}/></>}{tab === "payments" && <><p className="dashboard-intro">Receipts and details for completed appointment payments.</p><TransactionList transactions={transactions}/></>}{tab === "profile" && <><p className="dashboard-intro">Keep your details current so your visits feel easy.</p><form className="profile-form" onSubmit={saveProfile}><label>Full name<input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required/></label><label>Email address<input value={data?.user.email || ""} disabled/></label><label>Phone number<input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+880 1..."/></label><label>Profile image URL<input type="url" value={profile.image} onChange={(e) => setProfile({ ...profile, image: e.target.value })} placeholder="https://..."/></label><button className="button button-dark" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button></form></>}</section></div></main>;
}

function AppointmentList({ appointments, cancel, pay }: { appointments: Appointment[]; cancel: (id: string) => void; pay: (id: string) => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  if (!appointments.length) return <div className="dash-empty"><CalendarDays size={25}/><h3>No appointments yet</h3><p>Your next little reset is just a few clicks away.</p><Link href="/services" className="button button-dark">Explore services</Link></div>;
  return <div className="appointment-list">{appointments.map((item) => <div key={item._id}><article className="appointment-row"><div className="appointment-thumb" style={{ backgroundImage: item.service?.image ? `url('${item.service.image}')` : "none" }}><span>{item.service?.serviceName?.slice(0, 1) || "S"}</span></div><div className="appointment-info"><div className="appointment-title"><h3>{item.service?.serviceName || "Salon service"}</h3><Status status={item.status}/></div><p>{item.service?.category || "Appointment"} · ৳{item.servicePrice.toLocaleString("en-BD")}</p><div className="appointment-meta"><span><CalendarDays size={13}/>{item.appointmentDate}</span><span><Clock3 size={13}/>{item.timeSlot}</span></div></div><div className="appointment-actions">{item.status === "confirmed" && item.paymentStatus === "unpaid" && <button className="button button-dark compact" onClick={() => pay(item._id)}>Pay now</button>}{item.paymentStatus === "paid" && <span className="paid-pill">Paid</span>}{item.status === "pending" && <button className="cancel-link" onClick={() => cancel(item._id)}><X size={14}/> Cancel request</button>}<button className="details-toggle" onClick={() => setExpanded(expanded === item._id ? null : item._id)}>{expanded === item._id ? "Hide details" : "Details"}</button></div></article>{expanded === item._id && <div className="appointment-expanded"><span>Payment: <strong>{item.paymentStatus}</strong></span><span>Requested: <strong>{new Date(item.createdAt).toLocaleDateString("en-BD")}</strong></span>{item.message && <span>Note: <strong>{item.message}</strong></span>}</div>}</div>)}</div>;
}
function Status({ status }: { status: string }) { return <span className={`status-pill ${status}`}>{status}</span>; }
function TransactionList({ transactions }: { transactions: Transaction[] }) {
  if (!transactions.length) return <div className="dash-empty"><CreditCard size={25}/><h3>No payments to show</h3><p>Completed payments will appear here.</p></div>;
  return <div className="table-wrap"><table className="dash-table"><thead><tr><th>Service</th><th>Date</th><th>Amount</th><th>Status</th><th>Reference</th></tr></thead><tbody>{transactions.map((item) => <tr key={item._id}><td>{item.service?.serviceName || "Appointment"}</td><td>{new Date(item.createdAt).toLocaleDateString("en-BD")}</td><td>৳{item.amount.toLocaleString("en-BD")}</td><td><Status status={item.status}/></td><td>{item.stripeSessionId?.slice(-10) || "—"}</td></tr>)}</tbody></table></div>;
}
function DashboardLoading() { return <main className="dashboard-page"><div className="dashboard-loading"><span className="loading-orbit"/>Preparing your space…</div></main>; }
