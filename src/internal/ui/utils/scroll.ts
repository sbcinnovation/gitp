export const VISIBLE_LINES = 20;

export const HALF_PAGE = Math.max(1, Math.floor(VISIBLE_LINES / 2));

export function clampOffset(
  offset: number,
  total: number,
  visibleLines: number = VISIBLE_LINES,
): number {
  const maxStart = Math.max(0, total - visibleLines);
  return Math.max(0, Math.min(offset, maxStart));
}

export function computeWindow(
  offset: number,
  total: number,
  visibleLines: number = VISIBLE_LINES,
): { start: number; end: number } {
  const start = clampOffset(offset, total, visibleLines);
  const end = Math.min(start + visibleLines, total);
  return { start, end };
}
