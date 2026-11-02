/** Calendar dates follow the device's local time zone, not UTC. */
export function localDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Returns no pick until five terms exist. The caller persists it under a unique collection/date key. */
export function chooseDailyTerm(
  termIds: number[],
  recentIds: number[],
  random: () => number = Math.random,
): number | undefined {
  if (termIds.length < 5) return undefined;
  const recent = new Set(recentIds.slice(0, 3));
  const candidates = termIds.filter((id) => !recent.has(id));
  const eligible = candidates.length ? candidates : termIds;
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1)
    throw new RangeError('Random value must be in [0, 1)');
  return eligible[Math.floor(value * eligible.length)];
}
