import {
  Heart,
  Home,
  LayoutDashboard,
  Package,
  ShoppingBag,
  ShoppingCart,
  Store,
  Tags,
  User,
  Users,
} from "lucide-react";

export const adminBasePath = "/dashboard/admin";
export const customerBasePath = "/dashboard/customer";

export function getDashboardPathByRole(role) {
  return role === "admin" ? adminBasePath : customerBasePath;
}

export const adminNavSections = [
  {
    title: "Main",
    items: [
      { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard, exact: true },
      { label: "Orders", href: "/dashboard/admin/orders", icon: ShoppingBag },
      { label: "Products", href: "/dashboard/admin/products", icon: Package },
      { label: "Categories", href: "/dashboard/admin/categories", icon: Tags },
      { label: "Customers", href: "/dashboard/admin/customers", icon: Users },
    ],
  },
  {
    title: "General",
    items: [
      { label: "Home", href: "/", icon: Home },
      { label: "All Products", href: "/products", icon: Store },
      { label: "Categories", href: "/categories", icon: Tags },
    ],
  },
];

export const customerNavSections = [
  {
    title: "Main",
    items: [
      { label: "Overview", href: "/dashboard/customer", icon: LayoutDashboard, exact: true },
      { label: "My Orders", href: "/dashboard/customer/orders", icon: ShoppingBag },
      { label: "My Cart", href: "/checkout?mode=cart", icon: ShoppingCart },
      { label: "Wishlist", href: "/dashboard/customer/wishlist", icon: Heart },
    ],
  },
  {
    title: "General",
    items: [
      { label: "Home", href: "/", icon: User },
      { label: "All Products", href: "/products", icon: Store },
      { label: "Categories", href: "/categories", icon: Tags },
    ],
  },
];

export function getPageTitle(pathname) {
  const allItems = [...adminNavSections, ...customerNavSections].flatMap(
    (section) => section.items
  );
  // Longest-prefix match so nested paths resolve correctly
  const match = allItems
    .filter((item) =>
      item.exact ? pathname === item.href : pathname?.startsWith(item.href)
    )
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match?.label ?? "Overview";
}
