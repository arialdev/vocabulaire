import {
  categories,
  collections,
  dailyPicks,
  preferences,
  savedFilterCategories,
  savedFilters,
  termCategories,
  terms,
} from '../data/schema';
import type { Database } from '../data/database';

type Data = {
  collections: (typeof collections.$inferSelect)[];
  terms: (typeof terms.$inferSelect)[];
  categories: (typeof categories.$inferSelect)[];
  termCategories: (typeof termCategories.$inferSelect)[];
  savedFilters: (typeof savedFilters.$inferSelect)[];
  savedFilterCategories: (typeof savedFilterCategories.$inferSelect)[];
  dailyPicks: (typeof dailyPicks.$inferSelect)[];
  preferences: (typeof preferences.$inferSelect)[];
};
export type Backup = { format: 'vocabulaire'; schemaVersion: 1; exportedAt: string; data: Data };

export function createSnapshot(db: Database): Backup {
  return db.transaction((tx) => ({
    format: 'vocabulaire',
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    data: {
      collections: tx.select().from(collections).all(),
      terms: tx.select().from(terms).all(),
      categories: tx.select().from(categories).all(),
      termCategories: tx.select().from(termCategories).all(),
      savedFilters: tx.select().from(savedFilters).all(),
      savedFilterCategories: tx.select().from(savedFilterCategories).all(),
      dailyPicks: tx.select().from(dailyPicks).all(),
      preferences: tx.select().from(preferences).all(),
    },
  }));
}

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function id(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}
function string(value: unknown): value is string {
  return typeof value === 'string';
}
function nonempty(value: unknown): boolean {
  return string(value) && value.trim().length > 0;
}
function timestamp(value: unknown): boolean {
  return (
    string(value) &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString() === value
  );
}
function date(value: unknown): boolean {
  if (!string(value) || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value;
}
function allowed(value: unknown, choices: readonly string[]): boolean {
  return string(value) && choices.includes(value);
}
function records(value: unknown, name: string): Record<string, unknown>[] {
  if (!Array.isArray(value) || !value.every(object)) throw new Error(`Invalid ${name}`);
  return value;
}
function unique(
  rows: Record<string, unknown>[],
  key: (row: Record<string, unknown>) => string,
): void {
  const keys = rows.map(key);
  if (new Set(keys).size !== keys.length) throw new Error('Duplicate records');
}

/** Validates the entire graph before the caller can perform any writes. */
export function validateBackup(input: unknown): Backup {
  if (!object(input) || input.format !== 'vocabulaire' || input.schemaVersion !== 1)
    throw new Error('Unsupported backup format or version. Legacy backups are not supported.');
  if (!timestamp(input.exportedAt) || !object(input.data)) throw new Error('Invalid backup header');
  const d = input.data;
  const cs = records(d.collections, 'collections');
  const ts = records(d.terms, 'terms');
  const cats = records(d.categories, 'categories');
  const tc = records(d.termCategories, 'term categories');
  const fs = records(d.savedFilters, 'saved filters');
  const fc = records(d.savedFilterCategories, 'filter categories');
  const dp = records(d.dailyPicks, 'daily picks');
  const ps = records(d.preferences, 'preferences');
  for (const rows of [cs, ts, cats, fs]) {
    if (rows.some((r) => !id(r.id))) throw new Error('Invalid record ID');
    unique(rows, (r) => String(r.id));
  }
  const owners = new Set(cs.map((r) => r.id));
  if (
    cs.some(
      (r) =>
        !nonempty(r.name) ||
        !nonempty(r.icon) ||
        !(r.shortLabel === null || string(r.shortLabel)) ||
        !timestamp(r.createdAt) ||
        !timestamp(r.updatedAt),
    )
  )
    throw new Error('Invalid collection');
  if (
    ts.some(
      (r) =>
        !owners.has(r.collectionId) ||
        !nonempty(r.original) ||
        !nonempty(r.translation) ||
        !string(r.notes) ||
        !timestamp(r.createdAt) ||
        !timestamp(r.updatedAt),
    )
  )
    throw new Error('Invalid term');
  if (
    cats.some(
      (r) =>
        !owners.has(r.collectionId) ||
        !nonempty(r.name) ||
        !allowed(r.kind, ['grammatical', 'thematic']),
    )
  )
    throw new Error('Invalid category');
  if (
    fs.some(
      (r) =>
        !owners.has(r.collectionId) || !nonempty(r.name) || !nonempty(r.icon) || !string(r.search),
    )
  )
    throw new Error('Invalid saved filter');
  const termMap = new Map(ts.map((r) => [r.id, r.collectionId]));
  const catMap = new Map(cats.map((r) => [r.id, r.collectionId]));
  const filterMap = new Map(fs.map((r) => [r.id, r.collectionId]));
  if (
    tc.some(
      (r) =>
        !id(r.collectionId) ||
        termMap.get(r.termId) !== r.collectionId ||
        catMap.get(r.categoryId) !== r.collectionId,
    )
  )
    throw new Error('Invalid term-category ownership');
  if (
    fc.some(
      (r) =>
        !id(r.collectionId) ||
        filterMap.get(r.filterId) !== r.collectionId ||
        catMap.get(r.categoryId) !== r.collectionId,
    )
  )
    throw new Error('Invalid filter-category ownership');
  if (
    dp.some(
      (r) =>
        !id(r.collectionId) ||
        termMap.get(r.termId) !== r.collectionId ||
        !date(r.localDate) ||
        !timestamp(r.selectedAt),
    )
  )
    throw new Error('Invalid daily pick');
  unique(tc, (r) => `${r.termId}:${r.categoryId}`);
  unique(fc, (r) => `${r.filterId}:${r.categoryId}`);
  unique(dp, (r) => `${r.collectionId}:${r.localDate}`);
  if (
    ps.length > 1 ||
    ps.some(
      (r) =>
        r.id !== 1 ||
        !(r.selectedCollectionId === null || owners.has(r.selectedCollectionId)) ||
        !allowed(r.locale, ['system', 'en', 'es']) ||
        !allowed(r.appearance, ['system', 'light', 'dark']) ||
        typeof r.onboardingComplete !== 'boolean' ||
        !Number.isInteger(r.onboardingStep) ||
        typeof r.onboardingStep !== 'number' ||
        r.onboardingStep < 0 ||
        r.onboardingStep > 3 ||
        !allowed(r.termView, ['compact', 'detailed']) ||
        !allowed(r.sortField, ['original', 'translation', 'updated']) ||
        !allowed(r.sortDirection, ['asc', 'desc']),
    )
  )
    throw new Error('Invalid preferences');
  return input as Backup;
}

export function replaceFromBackup(db: Database, backup: Backup): void {
  const validated = validateBackup(backup);
  const d = validated.data;
  db.transaction((tx) => {
    tx.delete(preferences).run();
    tx.delete(collections).run();
    if (d.collections.length) tx.insert(collections).values(d.collections).run();
    if (d.terms.length) tx.insert(terms).values(d.terms).run();
    if (d.categories.length) tx.insert(categories).values(d.categories).run();
    if (d.termCategories.length) tx.insert(termCategories).values(d.termCategories).run();
    if (d.savedFilters.length) tx.insert(savedFilters).values(d.savedFilters).run();
    if (d.savedFilterCategories.length)
      tx.insert(savedFilterCategories).values(d.savedFilterCategories).run();
    if (d.dailyPicks.length) tx.insert(dailyPicks).values(d.dailyPicks).run();
    if (d.preferences.length) tx.insert(preferences).values(d.preferences).run();
  });
}
