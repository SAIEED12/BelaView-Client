import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { auth } from "@/lib/auth";
import { adminBasePath } from "@/lib/dashboard-nav";

export const metadata = {
  title: "Admin Dashboard | BelaView",
  description: "Manage orders, products, and customers for BelaView.",
};

export default async function AdminDashboardLayout({ children }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "admin") {
    redirect("/dashboard/customer");
  }
  return (
    <DashboardShell
      variant="admin"
      badge="ADMIN"
      basePath={adminBasePath}
    >
      {children}
    </DashboardShell>
  );
}
