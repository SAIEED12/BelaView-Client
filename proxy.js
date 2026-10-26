import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDashboardPathByRole } from "@/lib/dashboard-nav";

const SERVER_URL = process.env.SERVER_URL;
const HEX_ID_RE = /^[0-9a-f]{24}$/i;

// Product pages are public. Legacy /products/<hex-id> links get a real 308 to
// the canonical slug URL here, before the page's loading.js Suspense shell is
// flushed (a redirect inside the page would degrade to a meta refresh).
const productRedirect = async (request, pathname) => {
  if (!pathname.startsWith("/products/")) return null;
  const key = pathname.slice("/products/".length).split("/")[0];
  if (!HEX_ID_RE.test(key) || !SERVER_URL) return null;
  try {
    const response = await fetch(
      `${SERVER_URL}/products/${encodeURIComponent(key)}`,
      { cache: "no-store" },
    );
    if (!response.ok) return null;
    const product = await response.json();
    const slug = String(product?.slug ?? "").trim();
    if (!slug || slug === key) return null;
    return NextResponse.redirect(
      new URL(`/products/${encodeURIComponent(slug)}`, request.url),
      308,
    );
  } catch {
    return null;
  }
};

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname === "/products" || pathname.startsWith("/products/")) {
    const redirect = await productRedirect(request, pathname);
    return redirect ?? NextResponse.next();
  }

  let session = null;
  try {
    session = await auth.api.getSession({ headers: request.headers });
  } catch {
    session = null; // fail open → layout guards re-check
  }

  // Not logged in → login
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = session.user.role ?? "customer";

  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL(getDashboardPathByRole(role), request.url));
  }
  if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard/customer", request.url));
  }
  if (pathname.startsWith("/dashboard/customer") && role === "admin") {
    return NextResponse.redirect(new URL("/dashboard/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/products/:path*"],
};