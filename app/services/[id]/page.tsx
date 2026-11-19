import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Clock3, Heart, Sparkles } from "lucide-react";
import { getServices } from "@/data/services";
import { BookingForm } from "@/components/booking-form";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = (await getServices()).find((item) => item._id === id && item.status === "active");
  if (!service) return { title: "Service not available | SalonBook" };
  return {
    title: `${service.serviceName} | SalonBook`,
    description: service.shortDescription,
    openGraph: { title: `${service.serviceName} | SalonBook`, description: service.shortDescription, images: [service.image] },
  };
}

export default async function ServiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = (await getServices()).find((item) => item._id === id && item.status === "active");
  if (!service) notFound();
  return <main className="detail-page"><div className="detail-breadcrumb section-wrap"><Link href="/services"><ArrowLeft size={14}/> All services</Link><span>/</span><span>{service.category}</span></div><section className="detail-layout section-wrap"><div className="detail-main"><div className="detail-image" style={{ backgroundImage: `url('${service.image}')` }}><span className="detail-image-label"><Sparkles size={14}/> A SalonBook favorite</span></div><div className="detail-summary"><div className="eyebrow"><span/> {service.category.toUpperCase()}</div><h1>{service.serviceName}</h1><p className="detail-lede">{service.shortDescription}</p><div className="detail-facts"><span><Clock3 size={16}/>{service.duration} minutes</span><span><Heart size={16}/>Personalized for you</span></div></div><div className="detail-description"><h2>A little about this service</h2><p>{service.description}</p><div className="detail-note"><span>✳</span><p>Every appointment begins with a quick conversation, so your visit feels just right from the start.</p></div></div><div className="detail-promise"><div><strong>Thoughtful care</strong><span>Made around you</span></div><div><strong>Clear pricing</strong><span>Know before you book</span></div><div><strong>Easy to manage</strong><span>All in your dashboard</span></div></div></div><BookingForm serviceId={service._id} price={service.price}/></section><section className="detail-bottom section-wrap"><div><span className="eyebrow"><span/> YOUR NEXT MOMENT</span><h2>Good care begins<br/><em>with a little time.</em></h2></div><Link className="button button-outline" href="/services">Explore other services <ArrowUpRight size={15}/></Link></section></main>;
}
