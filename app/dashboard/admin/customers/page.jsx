import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CustomersTable } from "@/components/dashboard/CustomersTable";
import { auth } from "@/lib/auth";
import { getCustomers } from "@/lib/actions/users";
import { toUserMessage } from "@/lib/error-message";

export const metadata = {
  title: "Customers | Admin Dashboard",
  description: "View registered customers.",
};

const AdminCustomersPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard/customer");
  }

  let customers = [];
  let loadError = "";

  try {
    customers = await getCustomers();
  } catch (err) {
    loadError = toUserMessage(err, "Failed to fetch customers");
  }

  const list = Array.isArray(customers) ? customers : [];

  return (
    <div>
      <div className="my-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="truncate font-serif text-xl text-ink md:text-3xl">
          Customers
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

      <CustomersTable customers={list} />
    </div>
  );
};

export default AdminCustomersPage;
