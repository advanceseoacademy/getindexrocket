export function clearAuthClientCache() {
  try {
    sessionStorage.removeItem("gir_user_cache");
  } catch {
    /* ignore */
  }
}
