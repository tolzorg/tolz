import QRCode from "qrcode";
import { generateSlug } from "../utils/slugGen.js";
import { validateUrl, validateSlug } from "../utils/urlValidator.js";
import { urlStoreGet, urlStoreSet, urlStoreHas } from "../store/urlStore.js";

const EXPIRY_DURATIONS = {
  hour: 60 * 60 * 1000,
  day:  24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  never: null,
};

function buildBaseUrl(req) {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL;
  if (process.env.NODE_ENV === "production") {
    throw new Error("APP_BASE_URL must be set in production to prevent Host Header Injection.");
  }
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host  = req.get("host") || "localhost";
  return `${proto}://${host}`;
}

export async function shortenUrl(req, res) {
  const { url, customSlug, expiresIn = "never" } = req.body;

  const urlError = validateUrl(url);
  if (urlError) return res.status(400).json({ success: false, message: urlError });

  if (!(expiresIn in EXPIRY_DURATIONS)) {
    return res.status(400).json({ success: false, message: "Invalid expiration value." });
  }

  let slug;

  if (customSlug && String(customSlug).trim()) {
    const clean = String(customSlug).trim();
    const slugError = validateSlug(clean);
    if (slugError) return res.status(400).json({ success: false, message: slugError });
    if (await urlStoreHas(clean)) {
      return res.status(409).json({ success: false, message: "This custom alias is already taken. Please choose a different one." });
    }
    slug = clean;
  } else {
    let attempts = 0;
    do {
      slug = generateSlug();
      if (++attempts > 20) {
        return res.status(503).json({ success: false, message: "Could not generate a unique link. Please try again." });
      }
    } while (await urlStoreHas(slug));
  }

  const now       = Date.now();
  const expiryMs  = EXPIRY_DURATIONS[expiresIn];
  const expiresAt = expiryMs !== null ? now + expiryMs : null;

  await urlStoreSet(slug, {
    originalUrl: String(url).trim(),
    createdAt:   now,
    expiresAt,
    clicks:      0,
  });

  const shortUrl = `${buildBaseUrl(req)}/s/${slug}`;

  let qrCode = null;
  try {
    qrCode = await QRCode.toDataURL(shortUrl, {
      width: 220,
      margin: 2,
      color: { dark: "#1e293b", light: "#ffffff" },
    });
  } catch {
    // QR generation failure is non-fatal — client handles null gracefully
  }

  return res.status(201).json({
    success:    true,
    slug,
    shortUrl,
    originalUrl: String(url).trim(),
    qrCode,
    expiresAt,
    createdAt:  now,
  });
}

export async function getUrlInfo(req, res) {
  const { slug } = req.params;

  if (!slug || !/^[a-zA-Z0-9_-]{1,30}$/.test(slug)) {
    return res.status(400).json({ success: false, message: "Invalid slug." });
  }

  const entry = await urlStoreGet(slug);
  if (!entry) {
    return res.status(404).json({ success: false, message: "Short URL not found." });
  }
  if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
    return res.status(410).json({ success: false, message: "This short URL has expired." });
  }

  return res.json({ success: true, slug, ...entry });
}
