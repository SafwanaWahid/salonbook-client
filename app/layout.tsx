import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "SalonBook — Your time, beautifully booked",
  description: "Discover thoughtful salon services and book your next appointment with SalonBook.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteHeader />{children}<SiteFooter /><Toaster position="top-right" richColors/></body></html>;
}
