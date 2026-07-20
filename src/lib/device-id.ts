const STORAGE_KEY = "gir_device_id";

/** Stable per-browser device id for signup abuse prevention. */
export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";

  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing && existing.length >= 8) return existing;

    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID().replace(/-/g, "")
        : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

    window.localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return `fallback_${Date.now().toString(36)}`;
  }
}
