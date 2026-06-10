/** Local calendar date key (YYYY-MM-DD) — avoids UTC offset dropping today's spend. */
export function localDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export type SpendingPoint = { date: string; credits: number };

export function buildCreditSpending(
  rows: { amount: number; createdAt: Date }[],
  days = 14,
): SpendingPoint[] {
  const map = new Map<string, number>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    map.set(localDateKey(d), 0);
  }

  for (const row of rows) {
    const key = localDateKey(new Date(row.createdAt));
    if (map.has(key)) {
      map.set(key, (map.get(key) ?? 0) + Math.abs(row.amount));
    }
  }

  return Array.from(map.entries()).map(([date, credits]) => ({ date, credits }));
}
