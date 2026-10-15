'use client'
import { Suspense, useEffect, useRef, useState } from "react";
import { Link } from "@heroui/react";
import { useSession, authClient } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import { getDashboardPathByRole } from "@/lib/dashboard-nav";
import { getCategories } from "@/lib/actions/categories";
import Image from "next/image";
import { CartDrawer } from "./cart/Drawer";
import { ProductSearchInput } from "./products/ProductSearchInput";

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  // Derived from the pathname so navigating away closes the menu without an effect.
  const [menuOpenAt, setMenuOpenAt] = useState(null);
  const [openCategory, setOpenCategory] = useState(null);
  // Mobile categories drawer uses its own expanded state so it never
  // fights the desktop CATEGORIES dropdown above.
  const [openMobileCategory, setOpenMobileCategory] = useState(null);
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

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isMenuOpen]);

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
    <>
    <nav className="sticky top-0 z-40 w-full bg-[#FBF7F4] backdrop-blur-md shadow-sm shadow-black/5">
      <header className="relative mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex shrink-0 items-center gap-4">
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-mist active:bg-mist md:hidden"
            onClick={handleToggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span className="sr-only">Menu</span>
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

          <Link
            href="/"
            className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2 text-ink no-underline md:static md:translate-x-0 md:gap-3"
          >
            <Image
              src="/logo.png"
              alt="BelaView Logo"
              width={70}
              height={70}
              className="h-11 w-11 rounded-full bg-white object-contain md:h-17.5 md:w-17.5"
            />
            <span className="text-base font-bold tracking-[0.15em] md:text-lg">
              BelaView
            </span>
          </Link>

        <div className="hidden min-w-0 flex-1 px-8 md:block">
          <Suspense>
            <div className="mx-auto w-full max-w-xl">
              <ProductSearchInput className="mb-0" />
            </div>
          </Suspense>
        </div>

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

      {/* Desktop links row — below header */}
      <div className="hidden border-t border-line/70 md:block">
        <ul className="mx-auto flex max-w-6xl items-center justify-center gap-10 px-6 py-2.5">
          <li>
            <Link href="/" className="text-xs font-semibold tracking-[0.15em] text-ink no-underline hover:text-brand">
              HOME
            </Link>
          </li>
          <li>
            <Link href="/products" className="text-xs font-semibold tracking-[0.15em] text-ink no-underline hover:text-brand">
              PRODUCTS
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
                            className="flex-1 px-3 py-2.5 text-xs font-semibold tracking-widest text-ink no-underline hover:bg-mist hover:text-brand"
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
          {user?.role !== "admin" && (
            <li>
              <Link href="/about" className="text-xs font-semibold tracking-[0.15em] text-ink no-underline hover:text-brand">
                ABOUT US
              </Link>
            </li>
          )}
          {user && (
            <li>
              <Link href={dashboardHref} className="text-xs font-semibold tracking-[0.15em] text-ink no-underline hover:text-brand">
                DASHBOARD
              </Link>
            </li>
          )}
        </ul>
      </div>

      {/* Mobile search — below header */}
      <div className="border-t border-line/70 px-4 py-2 md:hidden">
        <Suspense>
          <ProductSearchInput
            compact
            placeholder="Search products..."
            className="mb-0 w-full max-w-sm mx-auto"
          />
        </Suspense>
      </div>

      {/* Mobile quick links — below search */}
      <div className="overflow-x-auto border-t border-line/70 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
        <ul className="mx-auto flex w-max items-center gap-6 px-4 py-2.5 whitespace-nowrap sm:gap-8">
          <li>
            <Link href="/" className="text-[11px] font-semibold tracking-[0.12em] text-ink no-underline hover:text-brand">
              HOME
            </Link>
          </li>
          <li>
            <Link href="/products" className="text-[11px] font-semibold tracking-[0.12em] text-ink no-underline hover:text-brand">
              PRODUCTS
            </Link>
          </li>
          <li>
            <Link href="/categories" className="text-[11px] font-semibold tracking-[0.12em] text-ink no-underline hover:text-brand">
              CATEGORIES
            </Link>
          </li>
          {user?.role !== "admin" && (
            <li>
              <Link href="/about" className="text-[11px] font-semibold tracking-[0.12em] text-ink no-underline hover:text-brand">
                ABOUT US
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>

      {isMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 md:hidden"
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close menu"
            onClick={() => setIsMenuOpen(false)}
            className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-xs font-semibold tracking-[0.2em] text-ink">
                MENU
              </h2>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-smoke transition-colors hover:bg-mist hover:text-ink"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Account section */}
            <div className="border-b border-line px-5 py-4">
              {user ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href={dashboardHref}
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 text-xs font-semibold tracking-[0.15em] text-ink no-underline hover:text-brand"
                  >
                    WELCOME, {user.name}!
                  </Link>
                  <Link
                    href={dashboardHref}
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 text-xs font-semibold tracking-[0.15em] text-ink no-underline hover:text-brand"
                  >
                    DASHBOARD
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="mt-1 w-full cursor-pointer rounded-full bg-ink px-4 py-2 text-center text-xs font-semibold tracking-[0.12em] text-white hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSigningOut ? "SIGNING OUT..." : "SIGN OUT"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 text-xs font-semibold tracking-[0.15em] text-ink no-underline hover:text-brand"
                  >
                    LOGIN
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-full bg-ink px-4 py-2 text-center text-xs font-semibold tracking-[0.12em] text-white no-underline hover:bg-brand"
                  >
                    SIGN UP
                  </Link>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-3">
              <h3 className="px-2 pt-1 pb-2 text-[11px] font-semibold tracking-[0.2em] text-smoke">
                CATEGORIES
              </h3>
              {!categories ? (
                <ul aria-label="Loading categories" className="flex flex-col gap-2">
                  {[0, 1, 2, 3, 4].map((key) => (
                    <li key={key} className="h-11 animate-pulse rounded-xl bg-mist" />
                  ))}
                </ul>
              ) : !hasCategories ? (
                <p className="px-2 py-6 text-center text-sm text-smoke">
                  No categories yet.
                </p>
              ) : (
                <ul>
                  {categories.map((category) => {
                    const isOpen = openMobileCategory === category.slug;
                    const subs = Array.isArray(category.subcategories) ? category.subcategories : [];
                    return (
                      <li key={category.slug} className="border-b border-line last:border-b-0">
                        <div className="flex items-center">
                          <Link
                            href={`/categories/${category.slug}`}
                            className="flex-1 px-2 py-3 text-xs font-semibold tracking-widest text-ink no-underline hover:text-brand"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {String(category.name).toUpperCase()}
                            <span className="ml-2 font-normal text-fog">
                              ({category.productCount ?? 0})
                            </span>
                          </Link>
                          {subs.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => setOpenMobileCategory(isOpen ? null : category.slug)}
                              aria-expanded={isOpen}
                              aria-label={`Toggle sub-categories of ${category.name}`}
                              className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center text-fog hover:text-brand"
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
                          <ul className="pb-2 pl-2">
                            {subs.map((sub) => (
                              <li key={sub.slug}>
                                <Link
                                  href={`/categories/${category.slug}/${sub.slug}`}
                                  className="block px-2 py-2 text-xs text-smoke no-underline hover:text-brand"
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
              )}
            </div>
            <div className="border-t border-line px-5 py-4">
              <Link
                href="/categories"
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-xl bg-ink px-4 py-2.5 text-center text-xs font-semibold tracking-[0.12em] text-white no-underline hover:bg-brand"
              >
                VIEW ALL CATEGORIES
              </Link>
            </div>
          </div>
        </div>
      )}

    </>
  );
}