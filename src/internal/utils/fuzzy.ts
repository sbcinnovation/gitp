export interface RankedItem<T> {
  item: T;
  score: number;
  positions: number[];
}

const isWordBoundary = (text: string, index: number): boolean => {
  if (index === 0) return true;
  const prev = text[index - 1];
  const cur = text[index];
  return /[^a-zA-Z0-9_]/.test(prev) && /[a-zA-Z0-9_]/.test(cur);
};

/**
 * Compute a simple fuzzy score by matching query as an ordered subsequence of target.
 * Higher is better. Non-matching targets return null.
 */
export const fuzzyScore = (
  query: string,
  target: string
): RankedItem<string> | null => {
  if (!query) return { item: target, score: 0, positions: [] };
  let qi = 0;
  let score = 0;
  const pos: number[] = [];
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  // Walk target to find sequential matches
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      pos.push(ti);
      qi += 1;
    }
  }
  if (qi !== q.length) return null;

  // Base: prefer shorter gaps and early matches
  for (let i = 0; i < pos.length; i++) {
    const p = pos[i];
    score += 10; // base for each matched char
    if (i > 0) {
      const gap = p - pos[i - 1] - 1;
      score -= Math.min(5, gap); // penalize gaps
    }
    if (p === i) score += 5; // contiguous prefix bonus
    if (isWordBoundary(target, p)) score += 3; // boundary bonus
  }

  // Exact prefix and exact match bonuses
  if (t.startsWith(q)) score += 20;
  if (t === q) score += 50;

  // Prefer shorter targets when otherwise equal
  score -= Math.floor(target.length / 200);

  return { item: target, score, positions: pos };
};

export const rankFuzzyMatches = (
  query: string,
  items: string[],
  limit: number = 50
): RankedItem<string>[] => {
  const results: RankedItem<string>[] = [];
  for (const item of items) {
    const r = fuzzyScore(query, item);
    if (r) results.push(r);
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
};
