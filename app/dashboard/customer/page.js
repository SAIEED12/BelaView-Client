import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Heart, Package, ShoppingBag } from "lucide-react";
import { auth } from "@/lib/auth";
import { getOrders } from "@/lib/actions/orders";
import { getWishlist } from "@/lib/actions/wishlist";

export const metadata = {
  title: "Overview | My Account",
  description: "Your orders and wishlist at a glance.",
};

const statusStyles = {
  pending: "bg-stone-200 text-stone-700",
  confirmed: "bg-amber-100 text-amber-800",
  shipped: "bg-sky-100 text-sky-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
};

export default async function CustomerDashboardHome() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login?redirect=/dashboard/customer");
  }

  const [ordersResult, wishlistResult] = await Promise.allSettled([
    getOrders({ userId: session.user.id }),
    getWishlist(),
  ]);

  const orders =
    ordersResult.status === "fulfilled" && Array.isArray(ordersResult.value)
      ? ordersResult.value
      : [];
  const wishlistIds =
    wishlistResult.status === "fulfilled" &&
    Array.isArray(wishlistResult.value)
      ? wishlistResult.value
      : [];

  const loadErrors = [
    ordersResult.status === "rejected" ? "orders" : null,
    wishlistResult.status === "rejected" ? "wishlist" : null,
  ].filter(Boolean);

  const deliveredCount = orders.filter(
    (order) => order.orderStatus === "delivered"
  ).length;

  const stats = [
    {
      label: "My orders",
      value: String(orders.length),
      icon: ShoppingBag,
      note: null,
    },
    {
      label: "Delivered",
      value: String(deliveredCount),
      icon: Package,
      note: "all time",
    },
    {
      label: "Wishlist",
      value: String(wishlistIds.length),
      icon: Heart,
      note: "saved items",
      href: "/dashboard/customer/wishlist",
    },
  ];

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] text-brand uppercase">
            My account
          </p>
          <h2 className="mt-1 font-serif text-2xl text-ink md:text-3xl">
            Welcome back{session.user.name ? `, ${session.user.name}` : ""}.
          </h2>
        </div>
        <div className="flex gap-2">
          <Link
            href="/products"
            className="rounded-full bg-brand px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white no-underline transition-colors hover:bg-brand-dark"
          >
            SHOP NOW
          </Link>
          <Link
            href="/dashboard/customer/orders"
            className="rounded-full border border-ink px-4 py-2 text-xs font-semibold tracking-[0.12em] text-ink no-underline transition-colors hover:bg-[#1A1A1A] hover:text-white"
          >
            TRACK ORDER
          </Link>
        </div>
      </div>

      {loadErrors.length > 0 ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          Couldn&apos;t load {loadErrors.join(", ")}. Showing available data —
          please refresh to try again.
        </p>
      ) : null}

      {/* Stat cards */}
      <section
        aria-label="Account summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          const card = (
            <div className="rounded-2xl border border-[#E5E5E5] bg-white p-5 shadow-sm shadow-black/5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white">
                <Icon size={18} strokeWidth={1.75} />
              </span>
              <p className="mt-4 font-serif text-3xl text-[#1A1A1A]">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-[#525252]">
                {stat.label}
              </p>
            </div>
          );
          return stat.href ? (
            <Link
              key={stat.label}
              href={stat.href}
              className="no-underline transition-transform hover:-translate-y-0.5"
            >
              {card}
            </Link>
          ) : (
            <div key={stat.label}>{card}</div>
          );
        })}
      </section>

      {/* My recent orders — full width */}
      <section
        aria-label="My recent orders"
        className="w-full overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white shadow-sm shadow-black/5"
      >
        <div className="flex items-center justify-between border-b border-[#E5E5E5] px-5 py-4">
          <h3 className="font-serif text-lg text-[#1A1A1A]">
            My recent orders
          </h3>
          <Link
            href="/dashboard/customer/orders"
            className="text-xs font-semibold tracking-[0.12em] text-brand no-underline hover:underline"
          >
            VIEW ALL
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-xs tracking-[0.1em] text-[#8A8A8A] uppercase">
                <th className="px-5 py-3 font-semibold">Order</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Total</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const id = String(order._id);
                return (
                  <tr
                    key={id}
                    className="border-t border-[#E5E5E5] transition-colors hover:bg-[#FAFAFA]"
                  >
                    <td className="px-5 py-3 font-semibold text-[#1A1A1A]">
                      #{id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-5 py-3 text-[#525252]">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-5 py-3 font-medium text-[#1A1A1A]">
                      ৳{Number(order.totalAmount ?? 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[order.orderStatus] ?? statusStyles.pending}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {recentOrders.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-[#525252]">
              You haven&apos;t placed any orders yet.{" "}
              <Link
                href="/products"
                className="font-semibold text-brand no-underline hover:underline"
              >
                Start shopping
              </Link>
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
