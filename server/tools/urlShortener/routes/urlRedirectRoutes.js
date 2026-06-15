import express from "express";
import { urlStoreGet, urlStoreSet } from "../store/urlStore.js";

const router = express.Router();

const SLUG_RE = /^[a-zA-Z0-9_-]{1,30}$/;

function isSafeUrl(url) {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Override CSP to allow inline styles for the simple HTML pages
function setErrorCsp(res) {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'"
  );
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function errorPage(emoji, title, message) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Tolz</title>
</head>
<body style="margin:0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;display:flex;align-items:center;justify-content:center;min-height:100vh">
  <div style="text-align:center;padding:40px 24px;max-width:420px">
    <div style="font-size:56px;margin-bottom:16px">${emoji}</div>
    <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 10px;letter-spacing:-0.025em">${title}</h1>
    <p style="color:#64748b;font-size:15px;margin:0 0 28px;line-height:1.6">${message}</p>
    <a href="/" style="display:inline-block;background:#3b7bfc;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:-0.01em">Go to Tolz</a>
  </div>
</body>
</html>`;
}

function warningPage(destUrl) {
  const safe = escHtml(destUrl);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Leaving Tolz</title>
</head>
<body style="margin:0;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;display:flex;align-items:center;justify-content:center;min-height:100vh">
  <div style="text-align:center;padding:40px 24px;max-width:480px">
    <div style="font-size:48px;margin-bottom:16px">&#x1F517;</div>
    <h1 style="font-size:20px;font-weight:800;color:#0f172a;margin:0 0 10px;letter-spacing:-0.025em">You are leaving Tolz</h1>
    <p style="color:#64748b;font-size:13px;margin:0 0 10px;line-height:1.5">This short link points to an external website:</p>
    <p style="color:#0f172a;font-size:13px;background:#f1f5f9;border-radius:8px;padding:10px 14px;word-break:break-all;margin:0 0 16px;text-align:left;line-height:1.5">${safe}</p>
    <p style="color:#94a3b8;font-size:12px;margin:0 0 28px;line-height:1.6">Tolz is not responsible for the content of external websites.<br>Verify the destination before continuing.</p>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
      <a href="${safe}" rel="noopener noreferrer" style="display:inline-block;background:#3b7bfc;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:15px;font-weight:600">Continue &#x2192;</a>
      <a href="/" style="display:inline-block;background:#f1f5f9;color:#475569;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:15px;font-weight:500">&#x2190; Back to Tolz</a>
    </div>
  </div>
</body>
</html>`;
}

router.get("/:slug", async (req, res) => {
  const { slug } = req.params;

  if (!slug || !SLUG_RE.test(slug)) {
    setErrorCsp(res);
    return res.status(400).send(errorPage("⚠️", "Invalid Link", "This short link appears to be malformed."));
  }

  const entry = await urlStoreGet(slug);

  if (!entry) {
    setErrorCsp(res);
    return res.status(404).send(errorPage("🔗", "Link Not Found", "This short link doesn't exist or may have been deleted."));
  }

  if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
    setErrorCsp(res);
    return res.status(410).send(errorPage("⏰", "Link Expired", "This short link has expired and is no longer available."));
  }

  if (!isSafeUrl(entry.originalUrl)) {
    setErrorCsp(res);
    return res.status(400).send(errorPage("🚫", "Invalid Destination", "This link points to an unsafe URL and has been blocked."));
  }

  // Increment click counter
  await urlStoreSet(slug, { ...entry, clicks: entry.clicks + 1 });

  setErrorCsp(res);
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.send(warningPage(entry.originalUrl));
});

export default router;
