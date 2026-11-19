"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock3, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { apiFetch, ensureAccessToken } from "@/lib/api";

export function BookingForm({ serviceId, price }: { serviceId: string; price: number }) {
  const router = useRouter();
  const { data } = authClient.useSession();
  const role = (data?.user as { role?: string } | undefined)?.role;
  const [appointmentDate, setAppointmentDate] = useState("");
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [timeSlot, setTimeSlot] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkingSlots, setCheckingSlots] = useState(false);

  async function refreshSlots(date: string) {
    setAppointmentDate(date);
    setTimeSlots([]);
    setTimeSlot("");
    if (!date) return;
    setCheckingSlots(true);
    try {
      const result = await apiFetch<{ timeSlots: string[] }>(`/availability?date=${encodeURIComponent(date)}&serviceId=${encodeURIComponent(serviceId)}`);
      setTimeSlots(result.timeSlots);
      setTimeSlot(result.timeSlots[0] || "");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not check available times."); }
    finally { setCheckingSlots(false); }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!appointmentDate) return toast.error("Choose an appointment date.");
    if (!timeSlot) return toast.error("Choose an available time slot.");
    setBusy(true);
    try {
      await ensureAccessToken();
      await apiFetch("/appointments", { method: "POST", body: JSON.stringify({ serviceId, appointmentDate, timeSlot, message }) });
      toast.success("Appointment request sent. We’ll confirm it soon.");
      router.push("/dashboard/customer?tab=appointments");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not submit your request."); }
    finally { setBusy(false); }
  }

  return <aside className="booking-card">
    <div className="booking-card-top"><div><span className="eyebrow"><span/> YOUR APPOINTMENT</span><h2>Make it <em>yours.</em></h2></div><div className="booking-price">৳{price.toLocaleString("en-BD")}<small>per session</small></div></div>
    {!data ? <div className="booking-locked"><LockKeyhole size={18}/><p>Sign in to request your appointment. We’ll keep your details together in one place.</p><a className="button button-dark" href="/sign-in">Sign in to book</a></div> : role === "admin" ? <div className="booking-locked"><LockKeyhole size={18}/><p>Customer accounts can request appointments. Sign in with a customer account to book.</p></div> : <form className="booking-form" onSubmit={submit}>
      <label><span><CalendarDays size={14}/> Choose a date</span><input type="date" required min={new Date().toISOString().slice(0, 10)} value={appointmentDate} onChange={(event) => void refreshSlots(event.target.value)}/></label>
      <label><span><Clock3 size={14}/> Available time</span><select required disabled={checkingSlots || !timeSlots.length} value={timeSlot} onChange={(event) => setTimeSlot(event.target.value)}><option value="">{checkingSlots ? "Checking open times…" : appointmentDate ? timeSlots.length ? "Choose a time" : "No open times for this date" : "Choose a date first"}</option>{timeSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}</select></label>
      <label><span>Anything you’d like us to know? <small>(optional)</small></span><textarea rows={3} maxLength={500} placeholder="Share a note for your stylist..." value={message} onChange={(event) => setMessage(event.target.value)}/></label>
      <button className="button button-dark" disabled={busy || checkingSlots || !timeSlot}>{busy ? "Sending request…" : "Request appointment"}</button>
      <p className="booking-footnote">Your appointment is pending until confirmed by the salon.</p>
    </form>}
  </aside>;
}
