const DEFAULT_TTL_MS = 60 * 1000; // 60 seconds in-memory TTL per instance

const serverCache = new Map();

function isTestEnvironment() {
  return Boolean(process.env.VITEST || process.env.NODE_ENV === 'test');
}

/**
 * Retrieves a cached API response payload if present and unexpired.
 * Skipped automatically under test environments unless `forceEnableInTest` is set.
 */
function getCachedResponse(key, options = {}) {
  if (isTestEnvironment() && !options.forceEnableInTest) {
    return null;
  }

  const entry = serverCache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    serverCache.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Stores a response payload in the in-memory server cache with an expiration TTL.
 */
function setCachedResponse(key, data, ttlMs = DEFAULT_TTL_MS, options = {}) {
  if (isTestEnvironment() && !options.forceEnableInTest) {
    return;
  }

  serverCache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

/**
 * Invalidates cached server entries matching a prefix (or clears all entries if omitted).
 */
function invalidateServerCache(prefix) {
  if (!prefix) {
    serverCache.clear();
    return;
  }

  for (const key of serverCache.keys()) {
    if (key === prefix || key.startsWith(prefix)) {
      serverCache.delete(key);
    }
  }
}

/**
 * Applies public edge/browser Stale-While-Revalidate cache headers for unauthenticated GET requests,
 * or private revalidation headers for authenticated CMS requests.
 */
function setPublicCacheHeaders(
  res,
  maxAge = 60,
  sMaxAge = 300,
  staleWhileRevalidate = 600,
  req = null,
) {
  if (!res || typeof res.setHeader !== 'function') return;

  if (req && req.headers && req.headers.authorization) {
    res.setHeader('Cache-Control', 'private, no-cache');
    return;
  }

  res.setHeader(
    'Cache-Control',
    `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
  );
}

/**
 * Executes a Mongoose query with `.lean()` when available (preserving plain object/mock compatibility).
 */
function execLean(query) {
  if (query && typeof query.lean === 'function') {
    return query.lean();
  }
  return query;
}

module.exports = {
  getCachedResponse,
  setCachedResponse,
  invalidateServerCache,
  setPublicCacheHeaders,
  execLean,
};
