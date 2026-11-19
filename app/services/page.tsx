import { Suspense } from "react";
import { getServices } from "@/data/services";
import { ServicesBrowser } from "@/components/services-browser";
import Link from "next/link";

export default async function ServicesPage() {
  const services = await getServices();
  return <main className="services-page"><section className="services-hero"><div className="eyebrow"><span/> A LITTLE CARE, RIGHT THIS WAY</div><h1>Find your <em>feel-good.</em></h1><p>Thoughtful services, lovely people, and a little time set aside just for you.</p><div className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>Services</span></div></section><Suspense><ServicesBrowser services={services}/></Suspense></main>;
}
