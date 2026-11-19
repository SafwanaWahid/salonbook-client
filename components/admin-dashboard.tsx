"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CalendarDays, Check, CreditCard, LayoutDashboard, Plus, Scissors, Settings2, ShieldCheck, Trash2, Users, X, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { apiFetch, ensureAccessToken } from "@/lib/api";

type Service = { _id: string; serviceName: string; category: string; description: string; price: number; duration: number; image: string; status: "active" | "inactive" };
type Booking = { _id: string; appointmentDate: string; timeSlot: string; message?: string; servicePrice: number; status: string; paymentStatus: string; createdAt: string; service?: Service | null; customer?: { id: string; name: string; email: string; phone?: string } | null };
type Customer = { _id: string; name: string; email: string; phone?: string; image?: string; isBlocked?: boolean; createdAt?: string };
type Transaction = { _id: string; amount: number; currency: string; status: string; createdAt: string; stripeSessionId: string; service?: Service | null; customer?: { name: string; email: string } | null; appointment?: Booking | null };
type Counts = { totalCustomers: number; totalServices: number; totalAppointments: number; pendingAppointments: number; confirmedAppointments: number; successfulPayments: number };
const zeroCounts: Counts = { totalCustomers: 0, totalServices: 0, totalAppointments: 0, pendingAppointments: 0, confirmedAppointments: 0, successfulPayments: 0 };
const categories = ["Haircut & Styling", "Hair Coloring", "Hair Treatment", "Facial & Skincare", "Makeup", "Manicure & Pedicure", "Spa & Massage"];
const blankService = { serviceName: "", category: categories[0], description: "", price: "", duration: "", image: "", status: "active" as "active" | "inactive" };

export function AdminDashboard() {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();
  const [tab, setTab] = useState("overview");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState(zeroCounts);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [form, setForm] = useState(blankService);
  const [profile, setProfile] = useState({ name: "", phone: "", image: "" });
  const [editing, setEditing] = useState<string | null>(null);
  useEffect(() => {
    if (isPending) return;
    if (!data) { router.replace("/sign-in"); return; }
    const role = (data.user as typeof data.user & { role?: string }).role;
    if (role !== "admin") { router.replace("/dashboard/customer"); return; }
    void load();
  }, [data, isPending, router]);
  async function load() {
    try {
      await ensureAccessToken();
      const [summary, catalogue, appointments, people, payments] = await Promise.all([
        apiFetch<Counts>("/admin/overview"), apiFetch<{ services: Service[] }>("/admin/services"), apiFetch<{ appointments: Booking[] }>("/admin/appointments"), apiFetch<{ users: Customer[] }>("/admin/users"), apiFetch<{ transactions: Transaction[] }>("/transactions"),
      ]);
      setCounts(summary); setServices(catalogue.services); setBookings(appointments.appointments); setCustomers(people.users); setTransactions(payments.transactions);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not load the admin dashboard."); }
  finally { setLoading(false); }
  }
  async function saveService(event: React.FormEvent) {
    event.preventDefault(); setBusy(true);
    try {
      const path = editing ? `/services/${editing}` : "/services";
      const method = editing ? "PATCH" : "POST";
      const payload = { ...form, price: Number(form.price), duration: Number(form.duration) };
      await apiFetch(path, { method, body: JSON.stringify(payload) });
      toast.success(editing ? "Service updated." : "New service added."); setForm(blankService); setEditing(null); await load();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save this service."); }
    finally { setBusy(false); }
  }
  async function uploadImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 6 * 1024 * 1024) return toast.error("Choose an image under 6 MB.");
    setBusy(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("Could not read image.")); reader.readAsDataURL(file); });
      const uploaded = await apiFetch<{ url: string }>("/uploads", { method: "POST", body: JSON.stringify({ image: base64 }) });
      setForm((previous) => ({ ...previous, image: uploaded.url })); toast.success("Image uploaded.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Image upload failed."); }
    finally { setBusy(false); }
  }
  async function toggleService(service: Service) {
    try { await apiFetch(`/services/${service._id}`, { method: "PATCH", body: JSON.stringify({ status: service.status === "active" ? "inactive" : "active" }) }); toast.success("Service status updated."); await load(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not update status."); }
  }
  async function deleteService(service: Service) {
    if (!window.confirm(`Delete “${service.serviceName}”?`)) return;
    try { await apiFetch(`/services/${service._id}`, { method: "DELETE" }); toast.success("Service deleted."); await load(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not delete service."); }
  }
  async function updateBooking(item: Booking, status: "confirmed" | "cancelled") {
    try { await apiFetch(`/admin/appointments/${item._id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }); toast.success(`Appointment ${status}.`); await load(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not update appointment."); }
  }
  async function blockUser(person: Customer) {
    try { await apiFetch(`/admin/users/${person._id}/block`, { method: "PATCH", body: JSON.stringify({ isBlocked: !person.isBlocked }) }); toast.success(person.isBlocked ? "Customer unblocked." : "Customer blocked."); await load(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not update customer."); }
  }
  async function saveProfile(event: React.FormEvent) {
    event.preventDefault(); setBusy(true);
    try { await apiFetch("/profile", { method: "PATCH", body: JSON.stringify(profile) }); toast.success("Profile updated."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not update your profile."); }
    finally { setBusy(false); }
  }
  function editService(service: Service) { setEditing(service._id); setForm({ ...service, price: String(service.price), duration: String(service.duration) }); setTab("services"); window.scrollTo({ top: 0, behavior: "smooth" }); }
  if (isPending || loading && !data) return <div className="dashboard-loading"><span className="loading-orbit"/>Preparing your dashboard…</div>;
  return <main className="dashboard-page"><div className="dashboard-shell"><aside className="dashboard-sidebar admin-sidebar"><Link href="/" className="dash-brand"><span><Scissors size={16}/></span> salonbook<i>.</i></Link><div className="dash-user"><div className="dash-avatar admin-avatar"><ShieldCheck size={17}/></div><div><strong>{data?.user.name}</strong><span>Salon administrator</span></div></div><div className="dash-nav-label">MANAGE SALON</div><AdminNav tab={tab} setTab={(nextTab) => { if (nextTab === "profile" && data) setProfile({ name: data.user.name || "", phone: (data.user as typeof data.user & { phone?: string }).phone || "", image: data.user.image || "" }); setTab(nextTab); }} count={counts}/><Link className="dash-back-link" href="/services"><Scissors size={15}/> View public site</Link><div className="dash-sidebar-bottom">A little care, thoughtfully managed.</div></aside><section className="dashboard-content"><div className="dashboard-top"><div><span className="eyebrow"><span/> SALONBOOK MANAGEMENT</span><h1>{tab === "overview" ? "Good to see you." : tab === "services" ? "Manage services" : tab === "appointments" ? "Appointment requests" : tab === "customers" ? "Your customers" : tab === "transactions" ? "Payment transactions" : "Admin profile"}</h1></div><div className="dashboard-top-note"><span className="dash-status-dot"/> Salon operations</div></div>{tab === "overview" && <><p className="dashboard-intro">A clear view of what’s happening across SalonBook.</p><div className="stats-grid admin-stats">{[["Customers", counts.totalCustomers, "registered accounts"], ["Active services", counts.totalServices, "available to book"], ["Appointment requests", counts.totalAppointments, "all requests"], ["Pending", counts.pendingAppointments, "need your attention"], ["Confirmed", counts.confirmedAppointments, "appointments set"], ["Successful payments", counts.successfulPayments, "verified transactions"]].map(([label, value, hint]) => <div className="stat-card" key={String(label)}><span>{label}</span><strong>{value}</strong><small>{hint}</small></div>)}</div><div className="dash-section-heading"><div><span className="eyebrow"><span/> NEEDS YOUR ATTENTION</span><h2>Latest requests</h2></div><button className="dash-inline-link" onClick={() => setTab("appointments")}>Manage all <span>→</span></button></div><AdminAppointments bookings={bookings.slice(0, 5)} update={updateBooking}/><div className="admin-quick-actions"><button onClick={() => setTab("services")}><Plus size={16}/> Add a service</button><button onClick={() => setTab("customers")}><Users size={16}/> Manage customers</button><button onClick={() => setTab("transactions")}><CreditCard size={16}/> View payments</button></div></>}{tab === "services" && <><p className="dashboard-intro">Add, update, activate, or remove salon services.</p><form className="service-admin-form" onSubmit={saveService}><div className="form-title-row"><div><span className="eyebrow"><span/> SERVICE DETAILS</span><h2>{editing ? "Update this service" : "Add a new service"}</h2></div>{editing && <button type="button" className="cancel-link" onClick={() => { setEditing(null); setForm(blankService); }}>Cancel edit</button>}</div><div className="admin-form-grid"><label>Service name<input required value={form.serviceName} onChange={(e) => setForm({ ...form, serviceName: e.target.value })} placeholder="e.g. The Signature Cut"/></label><label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label>Price (৳)<input required type="number" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="1800"/></label><label>Duration (minutes)<input required type="number" min="1" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="60"/></label><label className="span-two">Description<textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell customers what to expect..."/></label><label>Image upload<input required={!form.image} type="file" accept="image/*" onChange={(e) => void uploadImage(e.target.files?.[0])}/><small>Image uploads require an ImgBB API key.</small></label><label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}><option value="active">Active</option><option value="inactive">Inactive</option></select></label></div>{form.image && <div className="uploaded-preview"><Image unoptimized width={56} height={42} src={form.image} alt="Service preview"/><span>Image ready</span></div>}<button className="button button-dark" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Add service"}<ArrowUpRight size={15}/></button></form><div className="dash-section-heading table-heading"><div><span className="eyebrow"><span/> SALON CATALOGUE</span><h2>All services <span className="heading-count">{services.length}</span></h2></div></div><div className="service-admin-list">{services.map((service) => <div className="service-admin-row" key={service._id}><div className="admin-service-thumb" style={{ backgroundImage: `url('${service.image}')` }}/><div className="admin-service-main"><strong>{service.serviceName}</strong><span>{service.category} · {service.duration} min</span></div><b>৳{service.price.toLocaleString("en-BD")}</b><span className={`status-pill ${service.status}`}>{service.status}</span><button onClick={() => editService(service)} className="table-action">Edit</button><button onClick={() => void toggleService(service)} className="table-action">{service.status === "active" ? "Deactivate" : "Activate"}</button><button onClick={() => void deleteService(service)} className="icon-action danger" aria-label={`Delete ${service.serviceName}`}><Trash2 size={15}/></button></div>)}</div></>}{tab === "appointments" && <><p className="dashboard-intro">Review customer requests and keep the salon calendar up to date.</p><AdminAppointments bookings={bookings} update={updateBooking}/></>}{tab === "customers" && <><p className="dashboard-intro">Review registered customers and manage account access.</p><div className="table-wrap"><table className="dash-table"><thead><tr><th>Customer</th><th>Email</th><th>Phone</th><th>Joined</th><th>Account</th><th>Action</th></tr></thead><tbody>{customers.map((person) => <tr key={person._id}><td><span className="customer-cell"><span className="customer-initial">{person.name?.slice(0,1)}</span>{person.name}</span></td><td>{person.email}</td><td>{person.phone || "—"}</td><td>{person.createdAt ? new Date(person.createdAt).toLocaleDateString("en-BD") : "—"}</td><td><span className={`status-pill ${person.isBlocked ? "cancelled" : "active"}`}>{person.isBlocked ? "Blocked" : "Active"}</span></td><td><button className="table-action" onClick={() => void blockUser(person)}>{person.isBlocked ? "Unblock" : "Block"}</button></td></tr>)}</tbody></table></div>{!customers.length && <div className="dash-empty"><Users size={25}/><h3>No customers yet</h3><p>New accounts will appear here.</p></div>}</>}{tab === "transactions" && <><p className="dashboard-intro">Payment records update automatically after Stripe verifies a checkout event.</p><div className="table-wrap"><table className="dash-table"><thead><tr><th>Customer</th><th>Service</th><th>Appointment</th><th>Transaction date</th><th>Amount</th><th>Payment</th><th>Stripe reference</th></tr></thead><tbody>{transactions.map((payment) => <tr key={payment._id}><td>{payment.customer?.name || payment.customer?.email || "Customer"}</td><td>{payment.service?.serviceName || "Salon appointment"}</td><td>{payment.appointment?.appointmentDate || "—"}</td><td>{new Date(payment.createdAt).toLocaleDateString("en-BD")}</td><td>৳{payment.amount.toLocaleString("en-BD")} <small>{payment.currency?.toUpperCase()}</small></td><td><span className={`status-pill ${payment.status}`}>{payment.status}</span></td><td>{payment.stripeSessionId?.slice(-12) || "—"}</td></tr>)}</tbody></table></div>{!transactions.length && <div className="dash-empty"><CreditCard size={25}/><h3>No transactions yet</h3><p>Verified Stripe payments will appear here.</p></div>}</>}{tab === "profile" && <><p className="dashboard-intro">Update your contact details and profile image.</p><form className="profile-form" onSubmit={saveProfile}><label>Full name<input required value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}/></label><label>Email address<input disabled value={data?.user.email || ""}/></label><label>Phone number<input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+880 1..."/></label><label>Profile image URL<input type="url" value={profile.image} onChange={(e) => setProfile({ ...profile, image: e.target.value })} placeholder="https://..."/></label><button className="button button-dark" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button></form></>}</section></div></main>;
}

function AdminNav({ tab, setTab, count }: { tab: string; setTab: (tab: string) => void; count: Counts }) {
  const links: [string, string, LucideIcon][] = [["overview", "Overview", LayoutDashboard], ["services", "Manage services", Scissors], ["appointments", "Appointments", CalendarDays], ["customers", "Customers", Users], ["transactions", "Transactions", CreditCard], ["profile", "My profile", Settings2]];
  const pending = count.pendingAppointments;
  return <>{links.map(([key, label, Icon]) => <button key={key} className={tab === key ? "dash-nav active" : "dash-nav"} onClick={() => setTab(key)}><Icon size={16}/>{label}{key === "appointments" && pending > 0 && <span>{pending}</span>}</button>)}</>;
}
function AdminAppointments({ bookings, update }: { bookings: Booking[]; update: (booking: Booking, status: "confirmed" | "cancelled") => void }) {
  if (!bookings.length) return <div className="dash-empty"><CalendarDays size={25}/><h3>No appointment requests</h3><p>Customer bookings will show here.</p></div>;
  return <div className="admin-appointments">{bookings.map((booking) => <article key={booking._id} className="admin-booking-card"><div className="admin-booking-top"><div className="admin-customer-avatar">{booking.customer?.name?.slice(0,1) || "C"}</div><div className="admin-booking-customer"><strong>{booking.customer?.name || "SalonBook customer"}</strong><span>{booking.customer?.email || ""}</span></div><span className={`status-pill ${booking.status}`}>{booking.status}</span><span className={`status-pill ${booking.paymentStatus}`}>{booking.paymentStatus}</span></div><div className="admin-booking-detail"><div><small>SERVICE</small><strong>{booking.service?.serviceName || "Salon service"}</strong></div><div><small>APPOINTMENT</small><strong>{booking.appointmentDate} · {booking.timeSlot}</strong></div><div><small>PRICE</small><strong>৳{booking.servicePrice.toLocaleString("en-BD")}</strong></div><div><small>REQUESTED</small><strong>{new Date(booking.createdAt).toLocaleDateString("en-BD")}</strong></div></div>{booking.message && <p className="admin-message">“{booking.message}”</p>}{booking.status !== "cancelled" && <div className="admin-booking-actions">{booking.status === "pending" && <button className="button button-dark compact" onClick={() => update(booking, "confirmed")}><Check size={14}/> Confirm request</button>}<button className="cancel-link" onClick={() => update(booking, "cancelled")}><X size={14}/> Cancel</button></div>}</article>)}</div>;
}
