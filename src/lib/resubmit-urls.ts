/** Read one-time resubmit URLs from sessionStorage (client only). */
export function consumeResubmitUrls(): string {
  if (typeof window === "undefined") return "";
  const pending = sessionStorage.getItem("gir_resubmit_urls");
  if (!pending) return "";
  sessionStorage.removeItem("gir_resubmit_urls");
  return pending;
}
