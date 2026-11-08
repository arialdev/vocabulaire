/** Swiping left advances; swiping right returns to the previous page. */
export function nextIntroStep(step: number, delta: number) {
  return Math.max(0, Math.min(3, step + delta));
}
export function introSwipeDelta(dx: number, dy: number, startX: number): -1 | 0 | 1 {
  if (startX <= 24 || Math.abs(dx) < 60 || Math.abs(dx) <= Math.abs(dy) * 1.5) return 0;
  return dx < 0 ? 1 : -1;
}
