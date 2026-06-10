type CacheEntry = { data: unknown; at: number };

const store = new Map<string, CacheEntry>();

export async function fetchCached<T>(url: string, ttlMs = 60_000): Promise<T> {
  const hit = store.get(url);
  if (hit && Date.now() - hit.at < ttlMs) {
    return hit.data as T;
  }

  const res = await fetch(url, { credentials: "same-origin" });
  if (!res.ok) throw new Error(`Request failed: ${url}`);
  const data = (await res.json()) as T;
  store.set(url, { data, at: Date.now() });
  return data;
}

export function prefetch(url: string) {
  void fetchCached(url).catch(() => {});
}

export function invalidateCache(url?: string) {
  if (url) store.delete(url);
  else store.clear();
}
