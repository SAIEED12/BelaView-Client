'use client'
import { useEffect, useRef, useState } from "react";
import { Link } from "@heroui/react";
import { useSession, authClient } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import { getDashboardPathByRole } from "@/lib/dashboard-nav";
import { getCategories } from "@/lib/actions/categories";
import Image from "next/image";
import { CartDrawer } from "./cart/Drawer";

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  // Derived from the pathname so navigating away closes the menu without an effect.
  const [menuOpenAt, setMenuOpenAt] = useState(null);
  const [openCategory, setOpenCategory] = useState(null);
  // Loaded on first open so the shared navbar doesn't fetch on every page.
  const [categories, setCategories] = useState(null);
  const categoryMenuRef = useRef(null);
  const {data: session} = useSession();
  const user = session?.user;
  const dashboardHref = getDashboardPathByRole(user?.role);

  const pathname = usePathname();
  const isCategoryMenuOpen = menuOpenAt === pathname;
  const hasCategories = Array.isArray(categories) && categories.length > 0;

  const loadCategories = async () => {
    if (categories) return;
    const { categories: list } = await getCategories();
    setCategories(Array.isArray(list) ? list : []);
  };

  const handleToggleCategoryMenu = () => {
    const nextOpen = menuOpenAt !== pathname;
    setMenuOpenAt(nextOpen ? pathname : null);
    if (nextOpen) loadCategories();
  };

  const handleToggleMobileMenu = () => {
    const nextOpen = !isMenuOpen;
    setIsMenuOpen(nextOpen);
    if (nextOpen) loadCategories();
  };

  useEffect(() => {
    if (!isCategoryMenuOpen) return;
    const handlePointerDown = (event) => {
      if (!categoryMenuRef.current?.contains(event.target)) {
        setMenuOpenAt(null);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpenAt(null);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCategoryMenuOpen]);

  if(pathname.includes("dashboard")) {
    return null;
  }

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            setIsMenuOpen(false);
            router.push("/");
            router.refresh();
          },
        },
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-line bg-white/85 backdrop-blur-md shadow-sm shadow-black/5">
      <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button
            className="md:hidden"
            onClick={handleToggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span className="sr-only">Menu</span>
            <svg className="h-6 w-6 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <Link href="/" className="text-lg font-bold tracking-[0.15em] text-ink no-underline">
            <Image src="/logo.png" alt="BelaView Logo" width={70} height={70} className="rounded-full bg-white object-contain"></Image>
          </Link>
        </div>

        <ul className="hidden items-center gap-10 md:flex">
          <li>
            <Link href="/" className="text-xs font-semibold tracking-[0.15em] text-ink no-underline hover:text-brand">
              HOME
            </Link>
          </li>
          <li>
            <Link href="/products" className="text-xs font-semibold tracking-[0.15em] text-ink no-underline hover:text-brand">
              ALL PRODUCTS
            </Link>
          </li>
          <li className="relative" ref={categoryMenuRef}>
            <button
              type="button"
              onClick={handleToggleCategoryMenu}
              aria-expanded={isCategoryMenuOpen}
              aria-haspopup={hasCategories}
              className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold tracking-[0.15em] text-ink hover:text-brand"
            >
              CATEGORIES
              {hasCategories ? (
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  aria-hidden="true"
                  className={`transition-transform ${isCategoryMenuOpen ? "rotate-180" : ""}`}
                >
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : null}
            </button>

            {isCategoryMenuOpen && hasCategories ? (
              <div className="absolute left-1/2 top-full z-50 mt-3 w-80 -translate-x-1/2 rounded-2xl border border-line bg-white p-2 shadow-xl shadow-black/10">
                <ul className="max-h-96 overflow-y-auto">
                  {categories.map((category) => {
                    const href = `/categories/${category.slug}`;
                    const subs = Array.isArray(category.subcategories) ? category.subcategories : [];
                    const isOpen = openCategory === category.slug;
                    return (
                      <li key={category.slug} className="border-b border-line last:border-b-0">
                        <div className="flex items-center">
                          <Link
                            href={href}
                            className="flex-1 px-3 py-2.5 text-xs font-semibold tracking-[0.1em] text-ink no-underline hover:bg-mist hover:text-brand"
                          >
                            {String(category.name).toUpperCase()}
                            <span className="ml-2 font-normal text-fog">
                              ({category.productCount ?? 0})
                            </span>
                          </Link>
                          {subs.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => setOpenCategory(isOpen ? null : category.slug)}
                              aria-expanded={isOpen}
                              aria-label={`Toggle sub-categories of ${category.name}`}
                              className="cursor-pointer px-3 py-2.5 text-fog hover:text-brand"
                            >
                              <svg
                                width="10"
                                height="6"
                                viewBox="0 0 10 6"
                                fill="none"
                                aria-hidden="true"
                                className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                              >
                                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            </button>
                          ) : null}
                        </div>
                        {isOpen && subs.length > 0 ? (
                          <ul className="pb-2 pl-3">
                            {subs.map((sub) => (
                              <li key={sub.slug}>
                                <Link
                                  href={`/categories/${category.slug}/${sub.slug}`}
                                  className="block px-3 py-1.5 text-xs text-smoke no-underline hover:text-brand"
                                >
                                  {sub.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
                <Link
                  href="/categories"
                  className="mt-1 block rounded-xl bg-mist px-3 py-2 text-center text-xs font-semibold tracking-[0.12em] text-ink no-underline hover:text-brand"
                >
                  VIEW ALL CATEGORIES
                </Link>
              </div>
            ) : null}
          </li>
          {user && (
            <li>
              <Link href={dashboardHref} className="text-xs font-semibold tracking-[0.15em] text-ink no-underline hover:text-brand">
                DASHBOARD
              </Link>
            </li>
          )}
        </ul>

        <div className="hidden items-center gap-3 md:flex">

          {/* Login link*/}
          {user ? (
            <Link
              href={dashboardHref}
              className="text-xs font-semibold tracking-[0.15em] text-ink no-underline hover:text-brand"
            >
              WELCOME, {user.name}!
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-xs font-semibold tracking-[0.15em] text-ink no-underline hover:text-brand"
            >
              LOGIN
            </Link>
          )

        }
          {/* Sign Up / Sign Out */}
          {user ? (
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="cursor-pointer rounded-full bg-ink px-4 py-2 text-xs font-semibold tracking-[0.15em] text-white no-underline hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSigningOut ? "SIGNING OUT..." : "SIGN OUT"}
            </button>
          ) : (
            <Link
              href="/signup"
              className="rounded-full bg-ink px-4 py-2 text-xs font-semibold tracking-[0.15em] text-white no-underline hover:bg-brand"
            >
              SIGN UP
            </Link>
          )}

        {/* Cart Drawer */}
        <CartDrawer />
        
        </div>

        <div className="md:hidden">
          <CartDrawer compact />
        </div>
      </header>

      {isMenuOpen && (
        <div className="border-t border-line md:hidden">
          <ul className="flex flex-col gap-2 p-4">
            <li>
              <Link href="/" className="block py-2 text-sm tracking-widest text-ink no-underline">
                HOME
              </Link>
            </li>
            <li>
              <Link href="/products" className="block py-2 text-sm tracking-widest text-ink no-underline">
                ALL PRODUCTS
              </Link>
            </li>
            <li>
              <Link
                href="/categories"
                className="block py-2 text-sm tracking-widest text-ink no-underline"
                onClick={() => setIsMenuOpen(false)}
              >
                CATEGORIES
              </Link>
              {hasCategories ? (
                <ul className="mb-1 ml-3 border-l border-line pl-4">
                  {categories.map((category) => {
                    const isOpen = openCategory === category.slug;
                    const subs = Array.isArray(category.subcategories) ? category.subcategories : [];
                    return (
                      <li key={category.slug} className="py-1">
                        <div className="flex items-center">
                          <Link
                            href={`/categories/${category.slug}`}
                            className="flex-1 py-1.5 text-xs tracking-widest text-ink no-underline"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {String(category.name).toUpperCase()}
                          </Link>
                          {subs.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => setOpenCategory(isOpen ? null : category.slug)}
                              aria-expanded={isOpen}
                              aria-label={`Toggle sub-categories of ${category.name}`}
                              className="cursor-pointer px-2 py-1.5 text-fog"
                            >
                              <svg
                                width="10"
                                height="6"
                                viewBox="0 0 10 6"
                                fill="none"
                                aria-hidden="true"
                                className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                              >
                                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            </button>
                          ) : null}
                        </div>
                        {isOpen ? (
                          <ul>
                            {subs.map((sub) => (
                              <li key={sub.slug}>
                                <Link
                                  href={`/categories/${category.slug}/${sub.slug}`}
                                  className="block py-1.5 text-xs text-smoke no-underline"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  {sub.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
            {user && (
              <li>
                <Link href={dashboardHref} className="block py-2 text-sm tracking-widest text-ink no-underline">
                  DASHBOARD
                </Link>
              </li>
            )}

            <li className="mt-2 border-t border-line pt-3">
              {user ? (
                <Link href={dashboardHref}
                 className="block py-2 text-sm tracking-widest text-ink no-underline">
                  WELCOME, {user.name}!
                </Link>
              ) : (
                <Link href="/login" className="block py-2 text-sm tracking-widest text-ink no-underline">
                  LOGIN
                </Link>
              )}
            </li>
            <li>
              {user ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="block w-full cursor-pointer rounded-full bg-ink px-4 py-2 text-center text-sm font-semibold tracking-widest text-white hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSigningOut ? "SIGNING OUT..." : "SIGN OUT"}
                </button>
              ) : (
                <Link
                  href="/signup"
                  className="block rounded-full bg-ink px-4 py-2 text-center text-sm font-semibold tracking-widest text-white no-underline hover:bg-brand"
                >
                  SIGN UP
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}

    </nav>
  );
}