import {
  DashboardQueryError,
  OrdersDashboard,
} from "@/components/admin/orders-dashboard";
import { getDashboardData } from "@/lib/admin/orders";

export const metadata = {
  title: "Dashboard Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let dashboardData;

  try {
    dashboardData = await getDashboardData();
  } catch {
    dashboardData = null;
  }

  return (
    <div className="pt-10 sm:pt-14">
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-muted">
        Area kerja
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
        Dashboard Admin
      </h1>
      <p className="mt-4 max-w-2xl text-muted">
        Pantau pesanan, verifikasi pembayaran manual, dan perbarui progres
        produksi dari satu halaman.
      </p>

      <div className="mt-9">
        {dashboardData ? (
          <OrdersDashboard
            initialOrders={dashboardData.orders}
            initialStats={dashboardData.stats}
            key={dashboardData.orders
              .map((order) => `${order.id}:${order.updated_at}`)
              .join("|")}
          />
        ) : (
          <DashboardQueryError />
        )}
      </div>
    </div>
  );
}
