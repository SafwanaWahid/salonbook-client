import { notFound } from "next/navigation";
import { getServices } from "@/data/services";
import { ServiceDetailsView } from "@/components/service-details-view";

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
  return <ServiceDetailsView service={service}/>;
}
