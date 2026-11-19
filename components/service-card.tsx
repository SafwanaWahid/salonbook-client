import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import type { Service } from "@/data/services";

export function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) {
  return <article className="service-card" style={{ animationDelay: `${index * 70}ms` }}>
    <Link className="service-image" href={`/services/${service._id}`} style={{ backgroundImage: `url('${service.image}')` }} aria-label={`View ${service.serviceName}`}><span className="image-arrow"><ArrowUpRight size={17}/></span></Link>
    <div className="service-card-content"><div className="service-category">{service.category}</div><div className="service-title-row"><h3><Link href={`/services/${service._id}`}>{service.serviceName}</Link></h3><span className="service-price">৳{service.price.toLocaleString("en-BD")}</span></div><p>{service.shortDescription}</p><div className="service-card-bottom"><span><Clock3 size={14}/>{service.duration} min</span><Link href={`/services/${service._id}`} className="text-link">View details <ArrowUpRight size={14}/></Link></div></div>
  </article>;
}
