import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getOrders } from "@/lib/actions/orders";
import { CustomerOrdersTable } from "@/components/dashboard/CustomerOrdersTable";

export const metadata = {
  title: "My Orders | My Account",
  description: "Track your orders.",
};

const CustomerOrdersPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login?redirect=/dashboard/customer/orders");
  }

  let orders = [];
  let loadError = "";

  try {
    orders = await getOrders({ userId: session.user.id });
  } catch (err) {
    loadError = err?.message || "Failed to fetch orders";
  }

  const list = Array.isArray(orders) ? orders : [];

  return (
    <div>
      <div className="my-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="truncate font-serif text-xl text-ink md:text-3xl">
          My Orders
        </h1>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full border border-line bg-white px-3 py-1.5 text-smoke">
            {list.length} total
          </span>
        </div>
      </div>

      {loadError ? (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}. Please refresh to try again.
        </p>
      ) : null}

      {list.length === 0 && !loadError ? (
        <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-center">
          <p className="text-sm text-smoke">
            You haven&apos;t placed any orders yet.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-6 py-2.5 text-xs font-semibold tracking-[0.12em] text-white no-underline transition-colors hover:bg-brand-dark"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <CustomerOrdersTable orders={list} />
      )}
    </div>
  );
};

export default CustomerOrdersPage;
