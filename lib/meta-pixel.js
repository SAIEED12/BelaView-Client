// Client-side Meta Pixel helpers. Used by client components only.

const FBQ_RETRY_DELAY_MS = 200;
const FBQ_MAX_RETRIES = 10; // ~2s window to cover the afterInteractive script race
const CAPI_TIMEOUT_MS = 1500;

function generateEventId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function withTimeout(promise, ms = CAPI_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(undefined), ms)),
  ]);
}

// Meta's base snippet (app/layout.js, strategy="afterInteractive") defines
// window.fbq shortly after hydration, so events fired on first mount can race
// it. Retry briefly instead of dropping the event.
// Note: never create a window.fbq stub here — the official snippet bails out
// with `if (f.fbq) return`, so fbevents.js would never load.
function callFbq(args, attempt = 0) {
  if (typeof window === "undefined") return;
  if (typeof window.fbq === "function") {
    window.fbq(...args);
    return;
  }
  if (attempt >= FBQ_MAX_RETRIES) return;
  setTimeout(() => callFbq(args, attempt + 1), FBQ_RETRY_DELAY_MS);
}

// Browser-pixel-only tracking (used for PageView on client navigations).
export function trackMetaEvent(eventName, customData = {}) {
  callFbq(["track", eventName, { ...customData }]);
}

// Browser pixel + server Conversions API with a shared event_id so Meta
// deduplicates the pair. Never throws and never blocks the UI.
export async function sendMetaEvent(eventName, customData = {}, userData = {}) {
  const eventId = generateEventId();

  callFbq(["track", eventName, { ...customData }, { eventID: eventId }]);

  try {
    await withTimeout(
      fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          event_name: eventName,
          event_id: eventId,
          event_time: Math.floor(Date.now() / 1000),
          user_data: {
            phone: userData.phone || undefined,
            country: userData.country || "BD",
          },
          custom_data: customData,
        }),
      })
    );
  } catch (error) {
    console.error("[Meta CAPI] Failed to send event:", eventName, error);
  }

  return eventId;
}
