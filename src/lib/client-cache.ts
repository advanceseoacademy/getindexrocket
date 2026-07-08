type CacheEntry = { data: unknown; at: number };

const store = new Map<string, CacheEntry>();

const SESSION_PREFIX = "gir_cache:";

function readSession<T>(url: string): T | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${SESSION_PREFIX}${url}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: T; at: number };
    return parsed.data;
  } catch {
    return null;
  }
}

function writeSession(url: string, data: unknown) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(`${SESSION_PREFIX}${url}`, JSON.stringify({ data, at: Date.now() }));
  } catch {
    /* quota */
  }
}

export async function fetchCached<T>(url: string, ttlMs = 60_000): Promise<T> {
  const hit = store.get(url);
  if (hit && Date.now() - hit.at < ttlMs) {
    return hit.data as T;
  }

  const res = await fetch(url, { credentials: "same-origin" });
  if (!res.ok) throw new Error(`Request failed: ${url}`);
  const data = (await res.json()) as T;
  store.set(url, { data, at: Date.now() });
  writeSession(url, data);
  return data;
}

/** Return memory or session cache instantly (no network). */
export function peekCached<T>(url: string, ttlMs = 120_000): T | null {
  const hit = store.get(url);
  if (hit && Date.now() - hit.at < ttlMs) return hit.data as T;

  const session = readSession<T>(url);
  if (session) {
    store.set(url, { data: session, at: Date.now() });
    return session;
  }
  return null;
}

export function seedCache(url: string, data: unknown) {
  store.set(url, { data, at: Date.now() });
  writeSession(url, data);
}

export function prefetch(url: string) {
  void fetchCached(url).catch(() => {});
}

export function invalidateCache(url?: string) {
  if (url) {
    store.delete(url);
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(`${SESSION_PREFIX}${url}`);
    }
  } else {
    store.clear();
    if (typeof sessionStorage !== "undefined") {
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key?.startsWith(SESSION_PREFIX)) sessionStorage.removeItem(key);
      }
    }
  }
}

export function invalidateDashboardCache() {
  invalidateCache("/api/dashboard");
  invalidateCache("/api/dashboard?skipSync=1");
}
