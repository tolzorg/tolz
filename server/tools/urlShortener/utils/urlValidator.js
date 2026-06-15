const BLOCKED_PROTOCOLS = ["javascript:", "data:", "file:", "vbscript:", "blob:"];

const RESERVED_SLUGS = new Set([
  "api", "s", "health", "tools", "admin", "static", "assets",
  "login", "logout", "register", "auth", "dashboard", "www",
]);

const SLUG_RE = /^[a-zA-Z0-9_-]{3,30}$/;
const MAX_URL_LEN = 2048;

export function validateUrl(raw) {
  if (!raw || typeof raw !== "string") return "URL is required.";
  const url = raw.trim();
  if (url.length > MAX_URL_LEN) return "URL exceeds the maximum length of 2048 characters.";

  const lower = url.toLowerCase();
  for (const proto of BLOCKED_PROTOCOLS) {
    if (lower.startsWith(proto)) {
      return `Protocol "${proto.slice(0, -1)}" is not allowed.`;
    }
  }

  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "Only http:// and https:// URLs are allowed.";
    }
    return null; // valid
  } catch {
    return "Invalid URL format. Make sure it starts with https:// or http://";
  }
}

export function validateSlug(slug) {
  if (!SLUG_RE.test(slug)) {
    return "Alias must be 3–30 characters using only letters, numbers, hyphens, or underscores.";
  }
  if (RESERVED_SLUGS.has(slug.toLowerCase())) {
    return "This alias is reserved. Please choose a different one.";
  }
  return null; // valid
}
