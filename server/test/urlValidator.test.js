import { test } from "node:test";
import assert from "node:assert/strict";
import { validateUrl, validateSlug } from "../tools/urlShortener/utils/urlValidator.js";

// ── validateUrl ────────────────────────────────────────────────────────────────

test("validateUrl: returns null for valid http/https URLs", () => {
  assert.equal(validateUrl("https://example.com"), null);
  assert.equal(validateUrl("http://sub.example.co.uk/path"), null);
  assert.equal(validateUrl("https://example.com/path?q=1&r=2#anchor"), null);
});

test("validateUrl: rejects blocked protocols", () => {
  assert.ok(validateUrl("javascript:alert(1)"));
  assert.ok(validateUrl("data:text/html,<h1>xss</h1>"));
  assert.ok(validateUrl("file:///etc/passwd"));
  assert.ok(validateUrl("vbscript:msgbox(1)"));
  assert.ok(validateUrl("blob:https://example.com/uuid"));
});

test("validateUrl: rejects non-http/https protocols not in blocklist", () => {
  assert.ok(validateUrl("ftp://example.com"));
  assert.ok(validateUrl("ws://example.com"));
});

test("validateUrl: rejects empty and non-string inputs", () => {
  assert.ok(validateUrl(""));
  assert.ok(validateUrl(null));
  assert.ok(validateUrl(undefined));
});

test("validateUrl: rejects URLs that exceed 2048 characters", () => {
  const longUrl = "https://example.com/" + "a".repeat(2050);
  assert.ok(validateUrl(longUrl));
});

test("validateUrl: rejects malformed URLs", () => {
  assert.ok(validateUrl("not-a-url"));
  assert.ok(validateUrl("//missing-scheme.com"));
});

// ── validateSlug ───────────────────────────────────────────────────────────────

test("validateSlug: returns null for valid slugs", () => {
  assert.equal(validateSlug("abc123"), null);
  assert.equal(validateSlug("my-link"), null);
  assert.equal(validateSlug("link_1"), null);
  assert.equal(validateSlug("ABC"), null);          // minimum 3 chars
  assert.equal(validateSlug("a".repeat(30)), null); // maximum 30 chars
});

test("validateSlug: rejects slugs that are too short or too long", () => {
  assert.ok(validateSlug("ab"));           // 2 chars — too short
  assert.ok(validateSlug("a".repeat(31))); // 31 chars — too long
  assert.ok(validateSlug(""));             // empty
});

test("validateSlug: rejects slugs with invalid characters", () => {
  assert.ok(validateSlug("has space"));
  assert.ok(validateSlug("has.dot"));
  assert.ok(validateSlug("has@at"));
  assert.ok(validateSlug("has/slash"));
});

test("validateSlug: rejects reserved slugs", () => {
  assert.ok(validateSlug("api"));
  assert.ok(validateSlug("health"));
  assert.ok(validateSlug("admin"));
  assert.ok(validateSlug("API"));   // case-insensitive check
  assert.ok(validateSlug("www"));
});

// ── Security hardening ─────────────────────────────────────────────────────────

test("validateUrl: rejects embedded credentials (phishing disguise)", () => {
  assert.ok(validateUrl("https://yourbank.com@evil.com/login"));
  assert.ok(validateUrl("https://user:pass@example.com"));
});

test("validateUrl: rejects local and private network addresses", () => {
  for (const u of [
    "http://localhost", "http://localhost:3000/admin", "http://app.localhost", "http://printer.local",
    "http://db.internal", "http://intranet", "http://127.0.0.1", "http://127.1", "http://2130706433",
    "http://0x7f.0.0.1", "http://0.0.0.0", "http://10.0.0.5", "http://172.16.0.1", "http://172.31.255.255",
    "http://192.168.1.1", "http://169.254.169.254/latest/meta-data", "http://100.64.0.1",
    "http://[::1]", "http://[fc00::1]", "http://[fe80::1]", "http://[::ffff:127.0.0.1]", "http://[::ffff:192.168.0.1]",
  ]) {
    assert.ok(validateUrl(u), `should reject ${u}`);
  }
});

test("validateUrl: still accepts public addresses next to private ranges", () => {
  for (const u of ["http://172.32.0.1", "http://11.0.0.1", "http://192.169.1.1", "http://8.8.8.8", "http://[2606:4700::1111]", "https://example.local.com"]) {
    assert.equal(validateUrl(u), null, `should accept ${u}`);
  }
});

test("validateUrl: rejects Tolz's own links (redirect loops)", () => {
  assert.ok(validateUrl("https://tolz.org/s/abc123"));
  assert.ok(validateUrl("https://www.tolz.org/"));
  process.env.APP_BASE_URL = "https://tolz-api.onrender.com";
  try { assert.ok(validateUrl("https://tolz-api.onrender.com/s/abc")); } finally { delete process.env.APP_BASE_URL; }
  assert.equal(validateUrl("https://nottolz.org"), null);
});

test("validateUrl: BLOCKED_URL_DOMAINS blocks a domain and its subdomains", () => {
  process.env.BLOCKED_URL_DOMAINS = "evil.com, bad.net";
  try {
    assert.ok(validateUrl("https://evil.com/x"));
    assert.ok(validateUrl("https://login.evil.com"));
    assert.ok(validateUrl("http://BAD.NET"));
    assert.equal(validateUrl("https://notevil.com"), null);
  } finally { delete process.env.BLOCKED_URL_DOMAINS; }
});

test("isDisabledSlug: reads DISABLED_SLUGS", async () => {
  const { isDisabledSlug } = await import("../tools/urlShortener/utils/urlValidator.js");
  process.env.DISABLED_SLUGS = "abc123,Spam1";
  try {
    assert.equal(isDisabledSlug("abc123"), true);
    assert.equal(isDisabledSlug("spam1"), true);
    assert.equal(isDisabledSlug("other"), false);
  } finally { delete process.env.DISABLED_SLUGS; }
  assert.equal(isDisabledSlug("abc123"), false);
});
