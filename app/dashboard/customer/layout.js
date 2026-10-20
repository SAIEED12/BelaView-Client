import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { auth } from "@/lib/auth";
import { customerBasePath } from "@/lib/dashboard-nav";

export const metadata = {
  title: "My Account | BelaView",
  description: "Track your orders and manage your BelaView account.",
};

export default async function CustomerDashboardLayout({ children }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/login?redirect=/dashboard/customer");
  }
  return (
    <DashboardShell
      variant="customer"
      badge="ACCOUNT"
      basePath={customerBasePath}
    >
      {children}
    </DashboardShell>
  );
}
