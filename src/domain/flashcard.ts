export function chooseFlashcard(
  termIds: number[],
  currentId?: number,
  random: () => number = Math.random,
): number | undefined {
  const candidates = termIds.filter((id) => id !== currentId);
  if (!candidates.length) return undefined;
  return candidates[Math.floor(random() * candidates.length)];
}
