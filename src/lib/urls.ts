const URL_REGEX = /^https?:\/\/.+/i;

export function normalizeUrls(input: string): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];

  for (const line of input.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || !URL_REGEX.test(trimmed)) continue;
    try {
      const parsed = new URL(trimmed);
      const normalized = parsed.toString();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        urls.push(normalized);
      }
    } catch {
      continue;
    }
  }

  return urls;
}
