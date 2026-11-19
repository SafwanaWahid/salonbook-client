export type Service = { _id: string; serviceName: string; category: string; description: string; shortDescription: string; price: number; duration: number; image: string; status: "active" | "inactive" };

export const serviceSeed: Service[] = [
  { _id: "haircut-signature", serviceName: "The Signature Cut", category: "Haircut & Styling", description: "A considered cut shaped around your features, finished with a soft, effortless style.", shortDescription: "A thoughtful cut, made to feel like you.", price: 1800, duration: 60, image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1000&q=85", status: "active" },
  { _id: "hair-color-gloss", serviceName: "Soft Dimension Color", category: "Hair Coloring", description: "Dimensional, natural-looking color with a glossy finish and a custom consultation.", shortDescription: "Natural dimension with a little extra glow.", price: 6800, duration: 150, image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1000&q=85", status: "active" },
  { _id: "facial-reset", serviceName: "The Skin Reset Facial", category: "Facial & Skincare", description: "A restorative facial tailored to your skin, with gentle exfoliation and a calming mask.", shortDescription: "A fresh start for your skin and your day.", price: 3200, duration: 75, image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=85", status: "active" },
  { _id: "scalp-ritual", serviceName: "Scalp & Repair Ritual", category: "Hair Treatment", description: "A deeply nourishing scalp ritual and repair treatment to restore softness and shine.", shortDescription: "Deep care from the roots to the ends.", price: 2600, duration: 70, image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1000&q=85", status: "active" },
  { _id: "nail-care", serviceName: "Barely There Manicure", category: "Manicure & Pedicure", description: "A clean, unhurried manicure with nail shaping, cuticle care, and a nourishing finish.", shortDescription: "Neat, natural nails and a moment to unwind.", price: 1500, duration: 50, image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1000&q=85", status: "active" },
  { _id: "makeup-soft", serviceName: "Soft Occasion Makeup", category: "Makeup", description: "Polished, lightweight makeup for celebrations, events, and the lovely in-between.", shortDescription: "A little polish for your special plans.", price: 4500, duration: 90, image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1000&q=85", status: "active" },
  { _id: "spa-unwind", serviceName: "The Unwind Massage", category: "Spa & Massage", description: "A soothing full-body massage to ease tension and make room for a slower moment.", shortDescription: "Let the day go, one breath at a time.", price: 5200, duration: 90, image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85", status: "active" },
  { _id: "blowout", serviceName: "The Easy Blowout", category: "Haircut & Styling", description: "A smooth, bouncy blowout finished to suit your plans, from everyday to occasion-ready.", shortDescription: "A soft finish that lasts beyond today.", price: 2000, duration: 45, image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=85", status: "active" },
];

export const categories = ["All services", "Haircut & Styling", "Hair Coloring", "Hair Treatment", "Facial & Skincare", "Makeup", "Manicure & Pedicure", "Spa & Massage"];

export async function getServices(): Promise<Service[]> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (base) {
    try {
      const response = await fetch(`${base}/services?status=active`, { next: { revalidate: 60 } });
      if (response.ok) {
        const result = await response.json();
        const services = result.services ?? result.data ?? result;
        if (Array.isArray(services) && services.length) return services;
      }
    } catch { /* Local preview remains usable before the API is configured. */ }
  }
  return serviceSeed;
}
