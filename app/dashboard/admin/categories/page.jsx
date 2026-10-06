import { BulkCategoryAssign } from "@/components/dashboard/BulkCategoryAssign";
import { CategoryManager } from "@/components/dashboard/CategoryManager";
import { getCategories } from "@/lib/actions/categories";

export const metadata = {
  title: "Categories | Admin",
  description: "Manage categories and sub-categories.",
};

const AdminCategoriesPage = async () => {
  const { categories, unassignedCount } = await getCategories();

  return (
    <div>
      <div className="my-5">
        <h1 className="truncate font-serif text-xl text-ink md:text-3xl">Categories</h1>
        <p className="mt-2 text-sm text-smoke">
          Add as many categories and sub-categories as you need. Every one you
          create appears immediately in the storefront menus, category pages and
          product filters.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <CategoryManager categories={categories} unassignedCount={unassignedCount} />
        <BulkCategoryAssign categories={categories} />
      </div>
    </div>
  );
};

export default AdminCategoriesPage;