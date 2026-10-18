// Production builds replace messages thrown across the server-action /
// server-component boundary with generic technical text (e.g. React error
// #441). Keep that noise out of the UI and fall back to a readable message.
const TECHNICAL_MESSAGE_RE =
  /minified react error|react\.dev\/errors|an error occurred in the server components render|omitted in production|unexpected response was received from the server|failed to find server action|^failed to fetch$|^fetch failed$|^load failed$/i;

export const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";

export const toUserMessage = (error, fallback = DEFAULT_ERROR_MESSAGE) => {
  const raw = typeof error === "string" ? error : error?.message;
  const message = typeof raw === "string" ? raw.trim() : "";
  if (!message || TECHNICAL_MESSAGE_RE.test(message)) return fallback;
  return message;
};
