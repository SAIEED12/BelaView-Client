import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReviewsTable } from "@/components/dashboard/ReviewsTable";
import { auth } from "@/lib/auth";
import { getAdminReviews } from "@/lib/actions/reviews";
import { toUserMessage } from "@/lib/error-message";

export const metadata = {
  title: "Reviews | Admin Dashboard",
  description: "Moderate customer ratings and reviews.",
};

const PAGE_SIZE = 20;

const AdminReviewsPage = async ({ searchParams }) => {
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
  const rawFilter = Array.isArray(query?.filter) ? query.filter[0] : query?.filter;
  const rawQ = Array.isArray(query?.q) ? query.q[0] : query?.q;
  const parsedPage = Number.parseInt(rawPage, 10);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const filterText = typeof rawFilter === "string" ? rawFilter.trim().toLowerCase() : "";
  const filter = ["all", "visible", "hidden"].includes(filterText)
    ? filterText
    : "all";
  const q = typeof rawQ === "string" ? rawQ.trim() : "";

  let result = {
    reviews: [],
    total: 0,
    hiddenCount: 0,
    page,
    limit: PAGE_SIZE,
    totalPages: 1,
  };
  let loadError = "";

  try {
    const data = await getAdminReviews({ page, limit: PAGE_SIZE, filter, q });
    if (data && typeof data === "object") result = data;
  } catch (err) {
    loadError = toUserMessage(err, "Failed to fetch reviews");
  }

  const list = Array.isArray(result.reviews) ? result.reviews : [];

  return (
    <div>
      <div className="my-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="truncate font-serif text-xl text-ink md:text-3xl">
          Reviews
        </h1>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full border border-line bg-white px-3 py-1.5 text-smoke">
            {Number(result.total ?? 0)} matching
          </span>
          <span className="rounded-full bg-stone-200 px-3 py-1.5 text-stone-700">
            {hiddenCountLabel(result.hiddenCount)}
          </span>
        </div>
      </div>

      {loadError ? (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {loadError}. Please refresh to try again.
        </p>
      ) : null}

      <ReviewsTable
        reviews={list}
        total={result.total}
        hiddenCount={result.hiddenCount}
        page={result.page}
        limit={result.limit}
        totalPages={result.totalPages}
        initialFilter={filter}
        initialQuery={q}
      />
    </div>
  );
};

const hiddenCountLabel = (value) => {
  const count = Number(value ?? 0);
  return `${count} hidden`;
};

export default AdminReviewsPage;
