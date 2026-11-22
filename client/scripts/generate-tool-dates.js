#!/usr/bin/env node
// Generates src/data/toolCreationDates.json — the date each tool was first
// added to the tool registry (src/utils/tools.js), keyed by tool path. Used
// by the /our-all-tool-pages-links page to list every tool newest-first.
//
// Runs automatically before every build (see "prebuild" in package.json).
// Run it manually with `npm run tool-dates`.
//
// How a date is found:
//   1. Already in toolCreationDates.json → kept as-is (dates never move).
//   2. Otherwise, from git history: the commit that first added that tool's
//      `path: "..."` line to tools.js (only when full history is available —
//      a shallow clone would give every tool the same wrong date).
//   3. Otherwise (a brand-new tool not committed yet, or no git) → now, so
//      the newest tool lands at the top of the list.
//
// The page itself also puts any tool missing from this file at the top, so
// a new tool is listed correctly even if this script hasn't run yet.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "../src/data/toolCreationDates.json");
const REGISTRY = path.join(__dirname, "../src/utils/tools.js");

const { TOOLS } = await import("../src/utils/tools.js");

const existing = existsSync(OUT_PATH) ? JSON.parse(readFileSync(OUT_PATH, "utf8")) : {};

function git(args) {
  return execFileSync("git", args, { cwd: path.dirname(REGISTRY), encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
}

// path → ISO timestamp of the first commit that added it to tools.js
function datesFromGit() {
  try {
    if (git(["rev-parse", "--is-shallow-repository"]).trim() !== "false") return {};
    const log = git(["log", "--reverse", "--follow", "--format=@@COMMIT %at", "-p", "--no-color", "--", REGISTRY]);
    const found = {};
    let when = null;
    for (const line of log.split("\n")) {
      if (line.startsWith("@@COMMIT ")) { when = new Date(Number(line.slice(9).trim()) * 1000).toISOString(); continue; }
      const m = /^\+\s*path:\s*"([^"]+)"/.exec(line);
      if (m && when && !(m[1] in found)) found[m[1]] = when;
    }
    return found;
  } catch {
    return {};
  }
}

const fromGit = datesFromGit();
const now = new Date().toISOString();
const out = {};
let added = 0;

for (const tool of TOOLS.filter((t) => t.available)) {
  if (out[tool.path]) continue;
  if (existing[tool.path]) { out[tool.path] = existing[tool.path]; continue; }
  out[tool.path] = fromGit[tool.path] || now;
  added++;
}

const json = JSON.stringify(out, null, 2) + "\n";
const before = existsSync(OUT_PATH) ? readFileSync(OUT_PATH, "utf8") : "";
if (json !== before) {
  writeFileSync(OUT_PATH, json);
  console.log(`tool dates: ${Object.keys(out).length} tools (${added} new) → src/data/toolCreationDates.json`);
} else {
  console.log(`tool dates: up to date (${Object.keys(out).length} tools)`);
}
