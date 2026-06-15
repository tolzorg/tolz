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
