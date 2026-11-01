import type { Category, Term } from '../data/schema';

export type TermWithCategories = Term & { categoryIds: number[] };
export type TermQuery = {
  search: string;
  grammaticalIds: number[];
  thematicIds: number[];
  sortField: 'original' | 'translation' | 'updated';
  direction: 'asc' | 'desc';
};

// Remove diacritics only from Latin base letters; preserve meaningful marks in other scripts.
export function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/(\p{Script=Latin})\p{M}+/gu, '$1')
    .toLocaleLowerCase()
    .normalize('NFC');
}

export function queryTerms(
  terms: TermWithCategories[],
  categories: Category[],
  query: TermQuery,
): TermWithCategories[] {
  const search = normalizeSearch(query.search.trim());
  const allowed = new Map(categories.map((category) => [category.id, category.kind]));
  const grammar = query.grammaticalIds.filter((id) => allowed.get(id) === 'grammatical');
  const themes = query.thematicIds.filter((id) => allowed.get(id) === 'thematic');
  const direction = query.direction === 'asc' ? 1 : -1;
  const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });
  return terms
    .filter((term) => {
      const textMatches =
        !search ||
        [term.original, term.translation, term.notes].some((value) =>
          normalizeSearch(value).includes(search),
        );
      const grammarMatches =
        grammar.length === 0 || grammar.some((id) => term.categoryIds.includes(id));
      const themeMatches =
        themes.length === 0 || themes.some((id) => term.categoryIds.includes(id));
      return textMatches && grammarMatches && themeMatches;
    })
    .sort((a, b) => {
      const comparison =
        query.sortField === 'updated'
          ? a.updatedAt.localeCompare(b.updatedAt)
          : collator.compare(a[query.sortField], b[query.sortField]);
      return direction * comparison || a.id - b.id;
    });
}
