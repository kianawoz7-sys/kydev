import {
  ServicesManager,
  ServicesQueryError,
} from "@/components/admin/services-manager";
import { getServices } from "@/lib/admin/services";

export const metadata = {
  title: "Kelola Jasa",
};

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  let services;

  try {
    services = await getServices();
  } catch {
    services = null;
  }

  if (!services) return <ServicesQueryError />;

  return (
    <div className="pt-10 sm:pt-14">
      <ServicesManager
        initialServices={services}
        key={services.map((service) => `${service.id}:${service.updated_at}`).join("|")}
      />
    </div>
  );
}
