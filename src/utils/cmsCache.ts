export interface CMSCacheEntry<T> {
  data: T;
  updatedAt: number;
}

export interface CMSCacheOptions {
  forceRefresh?: boolean;
  freshTtlMs?: number;
  staleTtlMs?: number;
}

export const DEFAULT_FRESH_TTL_MS = 5 * 60 * 1000; // 5 minutes fresh window
export const DEFAULT_STALE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours stale-while-revalidate window
const STORAGE_PREFIX = 'portfolio_cms_cache_v1:';

const memoryCache = new Map<string, CMSCacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();
let testCacheOverride = false;

function isTestRuntime(): boolean {
  if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) return true;
  if (typeof import.meta !== 'undefined' && Boolean((import.meta as { vitest?: unknown }).vitest)) {
    return true;
  }
  return typeof process !== 'undefined' && Boolean(process.env?.VITEST);
}

function isCacheDisabled(): boolean {
  return isTestRuntime() && !testCacheOverride;
}

/**
 * Enables or disables the client SWR cache when running inside Vitest/JSDOM.
 * Resets in-memory and storage entries on toggle to keep test suites isolated.
 */
export function setCMSCacheTestMode(enabled: boolean): void {
  testCacheOverride = enabled;
  memoryCache.clear();
  inFlightRequests.clear();
}

function readStorageEntry<T>(key: string): CMSCacheEntry<T> | null {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CMSCacheEntry<T>;
    if (!parsed || typeof parsed.updatedAt !== 'number' || !('data' in parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeStorageEntry<T>(key: string, entry: CMSCacheEntry<T>): void {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return;
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(entry));
  } catch {
    // Ignore storage quota or private browsing errors
  }
}

function removeStorageEntries(prefixOrKey?: string): void {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const storageKey = window.localStorage.key(i);
      if (!storageKey || !storageKey.startsWith(STORAGE_PREFIX)) continue;
      const cacheKey = storageKey.slice(STORAGE_PREFIX.length);
      if (!prefixOrKey || cacheKey === prefixOrKey || cacheKey.startsWith(prefixOrKey)) {
        keysToRemove.push(storageKey);
      }
    }
    for (const key of keysToRemove) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage access errors
  }
}

/**
 * Synchronously reads a cached CMS payload from memory or localStorage if it falls within `staleTtlMs`.
 */
export function peekCMSCache<T>(
  key: string,
  options: Pick<CMSCacheOptions, 'freshTtlMs' | 'staleTtlMs'> = {},
): { data: T; isFresh: boolean } | null {
  if (isCacheDisabled()) return null;

  const freshTtlMs = options.freshTtlMs ?? DEFAULT_FRESH_TTL_MS;
  const staleTtlMs = options.staleTtlMs ?? DEFAULT_STALE_TTL_MS;
  const now = Date.now();

  let entry = memoryCache.get(key) as CMSCacheEntry<T> | undefined;
  if (!entry) {
    const stored = readStorageEntry<T>(key);
    if (stored) {
      entry = stored;
      memoryCache.set(key, stored);
    }
  }

  if (!entry) return null;

  const age = now - entry.updatedAt;
  if (age > staleTtlMs) {
    memoryCache.delete(key);
    removeStorageEntries(key);
    return null;
  }

  return {
    data: entry.data,
    isFresh: age <= freshTtlMs,
  };
}

/**
 * Writes a CMS payload into both the in-memory map and persistent localStorage cache.
 */
export function setCMSCache<T>(key: string, data: T): void {
  if (isCacheDisabled()) return;

  const entry: CMSCacheEntry<T> = {
    data,
    updatedAt: Date.now(),
  };
  memoryCache.set(key, entry);
  writeStorageEntry(key, entry);
}

function executeDeduplicatedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const existing = inFlightRequests.get(key) as Promise<T> | undefined;
  if (existing) {
    return existing;
  }

  const request = fetcher()
    .then((result) => {
      setCMSCache(key, result);
      return result;
    })
    .finally(() => {
      inFlightRequests.delete(key);
    });

  inFlightRequests.set(key, request);
  return request;
}

/**
 * Fetches CMS data using a two-tier Stale-While-Revalidate cache with in-flight request deduplication.
 * Fresh hits resolve immediately; stale hits resolve immediately and revalidate silently in the background.
 */
export async function fetchWithCMSCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CMSCacheOptions = {},
): Promise<T> {
  if (isCacheDisabled()) {
    return fetcher();
  }

  if (!options.forceRefresh) {
    const cached = peekCMSCache<T>(key, options);
    if (cached) {
      if (!cached.isFresh) {
        // Trigger background revalidation without blocking the immediate cached response
        void executeDeduplicatedFetch(key, fetcher).catch(() => undefined);
      }
      return cached.data;
    }
  }

  try {
    return await executeDeduplicatedFetch(key, fetcher);
  } catch (error) {
    const fallback = peekCMSCache<T>(key, {
      ...options,
      staleTtlMs: Number.POSITIVE_INFINITY,
    });
    if (fallback) {
      return fallback.data;
    }
    throw error;
  }
}

/**
 * Invalidates cached CMS entries matching a prefix or exact key (or all entries if omitted).
 */
export function invalidateCMSCache(prefixOrKey?: string): void {
  for (const key of Array.from(memoryCache.keys())) {
    if (!prefixOrKey || key === prefixOrKey || key.startsWith(prefixOrKey)) {
      memoryCache.delete(key);
    }
  }
  for (const key of Array.from(inFlightRequests.keys())) {
    if (!prefixOrKey || key === prefixOrKey || key.startsWith(prefixOrKey)) {
      inFlightRequests.delete(key);
    }
  }
  removeStorageEntries(prefixOrKey);
}
