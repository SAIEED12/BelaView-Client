import crypto from "node:crypto";

// Meta Conversions API (server-side) endpoint.
// The neutral path name is intentional — it survives basic adblock blocklists.
const PIXEL_ID =
  process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const GRAPH_API_VERSION = "v21.0";

function hashSHA256(value) {
  return crypto
    .createHash("sha256")
    .update(String(value).trim().toLowerCase())
    .digest("hex");
}

function getClientIP(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "0.0.0.0";
}

export async function POST(request) {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.error(
      "[Meta CAPI] META_PIXEL_ID or META_CAPI_ACCESS_TOKEN is not set"
    );
    return Response.json(
      { error: "Meta CAPI is not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { event_name, event_id, event_time, user_data, custom_data } = body;

    if (!event_name) {
      return Response.json({ error: "event_name is required" }, { status: 400 });
    }

    const client_ip = getClientIP(request);
    const client_user_agent = request.headers.get("user-agent") || "";

    const userData = {};
    if (user_data?.phone) {
      userData.ph = [hashSHA256(user_data.phone)];
    }
    if (user_data?.country) {
      userData.country = [user_data.country];
    }

    const eventPayload = {
      event_name,
      event_time: event_time || Math.floor(Date.now() / 1000),
      event_id: event_id || undefined,
      action_source: "website",
      user_data: {
        client_ip_address: client_ip,
        client_user_agent,
        ...userData,
      },
    };

    if (custom_data && Object.keys(custom_data).length > 0) {
      eventPayload.custom_data = custom_data;
    }

    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [eventPayload] }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("[Meta CAPI] Meta Graph API error:", result);
      return Response.json(
        { error: "Failed to send event to Meta", details: result },
        { status: response.status }
      );
    }

    return Response.json({
      success: true,
      events_received: result.events_received,
    });
  } catch (error) {
    console.error("[Meta CAPI] Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
