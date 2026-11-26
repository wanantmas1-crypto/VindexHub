import { getAllServices } from "@/lib/data";
import { ServicesManager } from "./services-manager";

export default async function AdminServicesPage() {
  const services = await getAllServices();
  return <ServicesManager initialServices={services} />;
}
