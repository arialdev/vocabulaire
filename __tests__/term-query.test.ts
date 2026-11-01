import {
  normalizeSearch,
  queryTerms,
  type TermQuery,
  type TermWithCategories,
} from '../src/domain/term-query';
import type { Category } from '../src/data/schema';

const categories: Category[] = [
  { id: 1, collectionId: 1, kind: 'grammatical', name: 'Verb' },
  { id: 2, collectionId: 1, kind: 'grammatical', name: 'Noun' },
  { id: 3, collectionId: 1, kind: 'thematic', name: 'Travel' },
];
const terms: TermWithCategories[] = [
  {
    id: 1,
    collectionId: 1,
    original: 'Café',
    translation: 'coffee',
    notes: 'viaje',
    categoryIds: [2, 3],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 2,
    collectionId: 1,
    original: 'Caminar',
    translation: 'go',
    notes: '',
    categoryIds: [1, 3],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 3,
    collectionId: 1,
    original: 'Café',
    translation: 'other',
    notes: '',
    categoryIds: [1],
    createdAt: '',
    updatedAt: '',
  },
];
const query: TermQuery = {
  search: '',
  grammaticalIds: [],
  thematicIds: [],
  sortField: 'original',
  direction: 'asc',
};

test('search is case and Latin-accent insensitive across notes and vocabulary', () => {
  expect(queryTerms(terms, categories, { ...query, search: 'CAFE' }).map((t) => t.id)).toEqual([
    1, 3,
  ]);
  expect(queryTerms(terms, categories, { ...query, search: 'VIAJE' }).map((t) => t.id)).toEqual([
    1,
  ]);
  expect(normalizeSearch('が')).toBe('が');
});

test('category kinds combine with AND and selections within a kind with OR', () => {
  expect(
    queryTerms(terms, categories, { ...query, grammaticalIds: [1, 2], thematicIds: [3] }).map(
      (t) => t.id,
    ),
  ).toEqual([1, 2]);
  expect(
    queryTerms(terms, categories, {
      ...query,
      grammaticalIds: [1],
      thematicIds: [3],
      search: 'go',
    }).map((t) => t.id),
  ).toEqual([2]);
});

test('saved criteria match a live query after categories are renamed and terms are added', () => {
  const criteria = { ...query, search: 'go', grammaticalIds: [1], thematicIds: [3] };
  const renamed = categories.map((category) =>
    category.id === 1 ? { ...category, name: 'Action' } : category,
  );
  const newTerm = { ...terms[1], id: 4, original: 'Go again', translation: 'again' };
  const updatedTerms = [...terms, newTerm];
  const liveResult = queryTerms(updatedTerms, renamed, criteria).map((term) => term.id);
  const savedResult = queryTerms(updatedTerms, renamed, { ...criteria }).map((term) => term.id);
  expect(savedResult).toEqual(liveResult);
  expect(savedResult).toEqual([2, 4]);
  expect(
    queryTerms(
      updatedTerms,
      renamed.filter((category) => category.id !== 3),
      criteria,
    ).map((term) => term.id),
  ).toEqual([2, 4]);
});
