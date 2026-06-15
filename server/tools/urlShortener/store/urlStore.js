import Redis from "ioredis";

// ── In-memory fallback ─────────────────────────────────────────────────────────
const mem = new Map(); // slug → entry

let memCleanupStarted = false;

function startMemCleanup() {
  if (memCleanupStarted) return;
  memCleanupStarted = true;
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [slug, entry] of mem) {
      if (entry.expiresAt !== null && entry.expiresAt <= now) {
        mem.delete(slug);
      }
    }
  }, 15 * 60 * 1000);
  timer.unref();
}

// ── Redis client ───────────────────────────────────────────────────────────────
let redis = null;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    connectTimeout: 5_000,
    enableOfflineQueue: false,
    lazyConnect: false,
  });
  redis.on("error", (err) => {
    console.error("[urlStore] Redis error:", err.message);
  });
}

// TTL for "never-expiring" links stored in Redis (10 years)
const REDIS_DEFAULT_TTL_S = 60 * 60 * 24 * 365 * 10;

const rKey = (slug) => `url:${slug}`;

async function redisGet(slug) {
  try {
    const val = await redis.get(rKey(slug));
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

async function redisSet(slug, entry) {
  try {
    const val = JSON.stringify(entry);
    if (entry.expiresAt !== null) {
      const ttl = Math.max(1, Math.ceil((entry.expiresAt - Date.now()) / 1000));
      await redis.set(rKey(slug), val, "EX", ttl);
    } else {
      await redis.set(rKey(slug), val, "EX", REDIS_DEFAULT_TTL_S);
    }
    return true;
  } catch (err) {
    console.error("[urlStore] Redis set failed:", err.message);
    return false;
  }
}

async function redisHas(slug) {
  try {
    return (await redis.exists(rKey(slug))) === 1;
  } catch {
    return false;
  }
}

// ── Public API (all functions are async) ──────────────────────────────────────

export async function urlStoreGet(slug) {
  if (redis) return redisGet(slug);
  return mem.get(slug) ?? null;
}

export async function urlStoreSet(slug, entry) {
  if (redis) {
    const written = await redisSet(slug, entry);
    if (written) return;
    // Redis write failed — fall through to in-memory backup
  }
  startMemCleanup();
  if (mem.size >= 10_000) {
    mem.delete(mem.keys().next().value);
  }
  mem.set(slug, entry);
}

export async function urlStoreHas(slug) {
  if (redis) return redisHas(slug);
  return mem.has(slug);
}

export async function urlStoreSize() {
  if (redis) {
    try {
      return await redis.dbsize();
    } catch {
      return 0;
    }
  }
  return mem.size;
}
