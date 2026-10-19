const BLOCKED_PROTOCOLS = ["javascript:", "data:", "file:", "vbscript:", "blob:"];

const RESERVED_SLUGS = new Set([
  "api", "s", "health", "tools", "admin", "static", "assets",
  "login", "logout", "register", "auth", "dashboard", "www",
]);

const SLUG_RE = /^[a-zA-Z0-9_-]{3,30}$/;
const MAX_URL_LEN = 2048;

// Our own domains: shortening them only creates redirect loops / disguises.
const OWN_DOMAINS = ["tolz.org"];

// Comma-separated env lists, read on every call so a Render env change takes
// effect on the next restart without code changes:
//   BLOCKED_URL_DOMAINS — destinations to refuse (subdomains included), e.g. "evil.com,bad.net"
//   DISABLED_SLUGS      — existing short links to switch off (abuse reports)
const envList = (name) => (process.env[name] || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

const matchesDomain = (host, domain) => host === domain || host.endsWith(`.${domain}`);

function ownHosts() {
  const hosts = [...OWN_DOMAINS];
  try {
    if (process.env.APP_BASE_URL) hosts.push(new URL(process.env.APP_BASE_URL).hostname.toLowerCase());
  } catch { /* ignore a malformed APP_BASE_URL */ }
  return hosts;
}

/** True for loopback, private, link-local, CGNAT and other non-public IPv4 addresses. */
function isPrivateIPv4(host) {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  return a === 0 || a === 10 || a === 127 || a >= 224
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168)
    || (a === 100 && b >= 64 && b <= 127);
}

/** True for IPv6 loopback, unspecified, unique-local, link-local and IPv4-mapped private addresses. */
function isPrivateIPv6(host) {
  if (!host.startsWith("[")) return false;
  const ip = host.slice(1, -1).toLowerCase();
  if (ip === "::" || ip === "::1") return true;
  if (/^f[cd]/.test(ip) || /^fe[89ab]/.test(ip)) return true;
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(ip);
  if (mapped) return isPrivateIPv4(mapped[1]);
  // The URL parser rewrites ::ffff:a.b.c.d as ::ffff:XXXX:XXXX (hex).
  const hex = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(ip);
  if (hex) {
    const n = (parseInt(hex[1], 16) << 16) + parseInt(hex[2], 16);
    return isPrivateIPv4([n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join("."));
  }
  return false;
}

function isInternalHost(host) {
  return host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")
    || host.endsWith(".internal") || host.endsWith(".lan") || host.endsWith(".home.arpa")
    || !host.includes(".") && !host.startsWith("[")
    || isPrivateIPv4(host) || isPrivateIPv6(host);
}

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

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return "Invalid URL format. Make sure it starts with https:// or http://";
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    return "Only http:// and https:// URLs are allowed.";
  }
  // "https://yourbank.com@evil.com" shows a trusted name but goes to evil.com.
  if (parsed.username || parsed.password) {
    return "URLs containing a username or password are not allowed.";
  }
  // The URL parser normalises tricks like http://2130706433 or http://0x7f.1 to 127.0.0.1.
  const host = parsed.hostname.toLowerCase().replace(/\.$/, "");
  if (isInternalHost(host)) {
    return "Links to local or private network addresses are not allowed.";
  }
  if (ownHosts().some((d) => matchesDomain(host, d))) {
    return "Tolz links can't be shortened again.";
  }
  if (envList("BLOCKED_URL_DOMAINS").some((d) => matchesDomain(host, d))) {
    return "This destination is blocked.";
  }
  return null; // valid
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

/** True when an existing short link has been switched off via DISABLED_SLUGS. */
export function isDisabledSlug(slug) {
  return envList("DISABLED_SLUGS").includes(String(slug).toLowerCase());
}
