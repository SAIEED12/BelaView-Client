import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTokenServer } from "@/lib/getTokenServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const extensionOf = (name) => {
  const clean = String(name ?? "").trim().toLowerCase();
  const dot = clean.lastIndexOf(".");
  return dot === -1 ? "" : clean.slice(dot + 1);
};

export async function POST(request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json(
      { error: "Please sign in again." },
      { status: 401 },
    );
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Could not read the uploaded image." },
      { status: 400 },
    );
  }

  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) {
    return NextResponse.json(
      { error: "Image file is required." },
      { status: 400 },
    );
  }
  if (image.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "Image must be at most 5MB." },
      { status: 400 },
    );
  }

  const extension = extensionOf(image.name);
  if (!ALLOWED_TYPES.has(image.type) && !ALLOWED_EXTENSIONS.has(extension)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, or GIF images are allowed." },
      { status: 400 },
    );
  }

  const serverUrl = String(process.env.SERVER_URL || "").trim().replace(/\/+$/, "");
  if (!serverUrl) {
    return NextResponse.json(
      { error: "Upload service is not configured." },
      { status: 500 },
    );
  }

  let token;
  try {
    token = await getTokenServer();
  } catch {
    return NextResponse.json(
      { error: "Your session expired. Please sign in again." },
      { status: 401 },
    );
  }

  const upstream = new FormData();
  upstream.append("image", image, image.name || "image");

  let response;
  try {
    response = await fetch(`${serverUrl}/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: upstream,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the image storage service." },
      { status: 502 },
    );
  }

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    return NextResponse.json(
      { error: result?.error || `Image upload failed: ${response.status}` },
      { status: response.status },
    );
  }
  if (!result?.url) {
    return NextResponse.json(
      { error: "Image storage did not return a URL." },
      { status: 502 },
    );
  }

  return NextResponse.json({ url: result.url }, { status: 201 });
}
