import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OrdersTable } from "@/components/dashboard/OrdersTable";
import { auth } from "@/lib/auth";
import { getOrders } from "@/lib/actions/orders";
import { ORDER_STATUSES } from "@/lib/order-statuses";

export const metadata = {
  title: "Orders | Admin Dashboard",
  description: "View, filter, and manage customer orders.",
};

const PAGE_SIZE = 10;

const AdminOrdersPage = async ({ searchParams }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "admin") {
    redirect("/dashboard/customer");
  }

  const query = await searchParams;
  const rawPage = Array.isArray(query?.page) ? query.page[0] : query?.page;
  const rawStatus = Array.isArray(query?.status) ? query.status[0] : query?.status;
  const rawQ = Array.isArray(query?.q) ? query.q[0] : query?.q;
  const rawDate = Array.isArray(query?.date) ? query.date[0] : query?.date;
  const parsedPage = Number.parseInt(rawPage, 10);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const statusText = typeof rawStatus === "string" ? rawStatus.trim().toLowerCase() : "";
  const status = statusText === "" || statusText === "all" ? "all" : statusText;
  const q = typeof rawQ === "string" ? rawQ.trim() : "";
  const dateText = typeof rawDate === "string" ? rawDate.trim() : "";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(dateText) ? dateText : "";

  let result = {
    orders: [],
    total: 0,
    page,
    limit: PAGE_SIZE,
    totalPages: 1,
    pendingCount: 0,
    deliveredRevenue: 0,
  };
  let loadError = "";

  try {
    const data = await getOrders({ page, limit: PAGE_SIZE, status, q, date });
    if (data && typeof data === "object" && !Array.isArray(data)) {
      result = data;
    } else {
      result.orders = Array.isArray(data) ? data : [];
      result.total = result.orders.length;
    }
  } catch (err) {
    loadError = err?.message || "Failed to fetch orders";
  }

  const list = Array.isArray(result.orders) ? result.orders : [];

  return (
    <div>
      <div className="my-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="truncate font-serif text-xl text-ink md:text-3xl">
          All Orders
        </h1>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full border border-line bg-white px-3 py-1.5 text-smoke">
            {result.total} total
          </span>
          <span className="rounded-full bg-stone-200 px-3 py-1.5 text-stone-700">
            {result.pendingCount} needs action
          </span>
          <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-800">
            ৳{Number(result.deliveredRevenue ?? 0).toLocaleString()} revenue
          </span>
        </div>
      </div>

      {loadError ? (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}. Please refresh to try again.
        </p>
      ) : null}

      <OrdersTable
        orders={list}
        total={result.total}
        page={result.page}
        limit={result.limit}
        totalPages={result.totalPages}
        initialStatus={ORDER_STATUSES.includes(status) ? status : "all"}
        initialQuery={q}
        initialDate={date}
      />
    </div>
  );
};

export default AdminOrdersPage;
