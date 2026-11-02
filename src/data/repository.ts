import { and, eq, inArray } from 'drizzle-orm';
import type { Database } from './database';
import {
  categories,
  collections,
  dailyPicks,
  preferences,
  savedFilterCategories,
  savedFilters,
  termCategories,
  terms,
  type Preferences,
} from './schema';
import { chooseDailyTerm } from '../domain/daily-word';

function required(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${field} is required`);
  return trimmed;
}

export function createRepository(db: Database) {
  function listCollections() {
    return db.select().from(collections).orderBy(collections.id).all();
  }
  function getPreferences() {
    db.insert(preferences).values({ id: 1 }).onConflictDoNothing().run();
    return db.select().from(preferences).where(eq(preferences.id, 1)).get()!;
  }
  function updatePreferences(values: Partial<Omit<Preferences, 'id'>>) {
    if (
      values.selectedCollectionId != null &&
      !db.select().from(collections).where(eq(collections.id, values.selectedCollectionId)).get()
    )
      throw new Error('Collection does not exist');
    getPreferences();
    db.update(preferences).set(values).where(eq(preferences.id, 1)).run();
  }
  function saveCollection(input: {
    id?: number;
    name: string;
    shortLabel?: string | null;
    icon: string;
  }) {
    const name = required(input.name, 'Name');
    const icon = required(input.icon, 'Icon');
    const shortLabel = input.shortLabel?.trim() || null;
    const now = new Date().toISOString();
    return db.transaction((tx) => {
      if (input.id != null) {
        const rows = tx
          .update(collections)
          .set({ name, icon, shortLabel, updatedAt: now })
          .where(eq(collections.id, input.id))
          .returning()
          .all();
        if (!rows.length) throw new Error('Collection does not exist');
        return rows[0];
      }
      const row = tx
        .insert(collections)
        .values({ name, icon, shortLabel, createdAt: now, updatedAt: now })
        .returning()
        .get();
      tx.insert(preferences)
        .values({ id: 1, selectedCollectionId: row.id })
        .onConflictDoUpdate({ target: preferences.id, set: { selectedCollectionId: row.id } })
        .run();
      return row;
    });
  }
  function deleteCollection(id: number) {
    db.transaction((tx) => {
      const selected = tx
        .select()
        .from(preferences)
        .where(eq(preferences.id, 1))
        .get()?.selectedCollectionId;
      tx.delete(collections).where(eq(collections.id, id)).run();
      if (selected === id) {
        const replacement = tx.select().from(collections).orderBy(collections.id).get();
        tx.update(preferences)
          .set({ selectedCollectionId: replacement?.id ?? null })
          .where(eq(preferences.id, 1))
          .run();
      }
    });
  }
  function listCategories(collectionId: number) {
    return db
      .select()
      .from(categories)
      .where(eq(categories.collectionId, collectionId))
      .orderBy(categories.id)
      .all();
  }
  function listTerms(collectionId: number) {
    const rows = db.select().from(terms).where(eq(terms.collectionId, collectionId)).all();
    const assignments = db
      .select()
      .from(termCategories)
      .where(eq(termCategories.collectionId, collectionId))
      .all();
    const byTerm = new Map<number, number[]>();
    for (const assignment of assignments)
      byTerm.set(assignment.termId, [
        ...(byTerm.get(assignment.termId) ?? []),
        assignment.categoryId,
      ]);
    return rows.map((row) => ({ ...row, categoryIds: byTerm.get(row.id) ?? [] }));
  }
  function saveTerm(input: {
    id?: number;
    collectionId: number;
    original: string;
    translation: string;
    notes: string;
    categoryIds: number[];
  }) {
    const original = required(input.original, 'Original');
    const translation = required(input.translation, 'Translation');
    const ids = [...new Set(input.categoryIds)];
    const now = new Date().toISOString();
    return db.transaction((tx) => {
      if (
        ids.length &&
        tx
          .select()
          .from(categories)
          .where(and(eq(categories.collectionId, input.collectionId), inArray(categories.id, ids)))
          .all().length !== ids.length
      )
        throw new Error('Category belongs to another collection or does not exist');
      let id = input.id;
      if (id == null) {
        id = tx
          .insert(terms)
          .values({
            collectionId: input.collectionId,
            original,
            translation,
            notes: input.notes,
            createdAt: now,
            updatedAt: now,
          })
          .returning()
          .get().id;
      } else {
        const updated = tx
          .update(terms)
          .set({ original, translation, notes: input.notes, updatedAt: now })
          .where(and(eq(terms.id, id), eq(terms.collectionId, input.collectionId)))
          .returning()
          .all();
        if (!updated.length) throw new Error('Term does not exist in this collection');
        tx.delete(termCategories)
          .where(
            and(eq(termCategories.termId, id), eq(termCategories.collectionId, input.collectionId)),
          )
          .run();
      }
      for (const categoryId of ids)
        tx.insert(termCategories)
          .values({ collectionId: input.collectionId, termId: id, categoryId })
          .run();
      return id;
    });
  }
  function deleteTerm(collectionId: number, id: number) {
    db.delete(terms)
      .where(and(eq(terms.id, id), eq(terms.collectionId, collectionId)))
      .run();
  }
  function saveCategory(input: {
    id?: number;
    collectionId: number;
    kind: 'grammatical' | 'thematic';
    name: string;
  }) {
    const name = required(input.name, 'Name');
    if (input.id == null)
      return db
        .insert(categories)
        .values({ collectionId: input.collectionId, kind: input.kind, name })
        .returning()
        .get();
    const row = db
      .update(categories)
      .set({ name })
      .where(
        and(
          eq(categories.id, input.id),
          eq(categories.collectionId, input.collectionId),
          eq(categories.kind, input.kind),
        ),
      )
      .returning()
      .get();
    if (!row) throw new Error('Category does not exist in this collection');
    return row;
  }
  function deleteCategory(collectionId: number, id: number) {
    db.delete(categories)
      .where(and(eq(categories.id, id), eq(categories.collectionId, collectionId)))
      .run();
  }
  function listFilters(collectionId: number) {
    const rows = db
      .select()
      .from(savedFilters)
      .where(eq(savedFilters.collectionId, collectionId))
      .all();
    const links = db
      .select()
      .from(savedFilterCategories)
      .where(eq(savedFilterCategories.collectionId, collectionId))
      .all();
    return rows.map((row) => ({
      ...row,
      categoryIds: links.filter((link) => link.filterId === row.id).map((link) => link.categoryId),
    }));
  }
  function saveFilter(input: {
    collectionId: number;
    name: string;
    icon: string;
    search: string;
    categoryIds: number[];
  }) {
    const name = required(input.name, 'Name');
    const icon = required(input.icon, 'Icon');
    const ids = [...new Set(input.categoryIds)];
    return db.transaction((tx) => {
      if (
        ids.length &&
        tx
          .select()
          .from(categories)
          .where(and(eq(categories.collectionId, input.collectionId), inArray(categories.id, ids)))
          .all().length !== ids.length
      )
        throw new Error('Category belongs to another collection or does not exist');
      const filter = tx
        .insert(savedFilters)
        .values({ collectionId: input.collectionId, name, icon, search: input.search })
        .returning()
        .get();
      for (const categoryId of ids)
        tx.insert(savedFilterCategories)
          .values({ collectionId: input.collectionId, filterId: filter.id, categoryId })
          .run();
      return filter;
    });
  }
  function deleteFilter(collectionId: number, id: number) {
    db.delete(savedFilters)
      .where(and(eq(savedFilters.id, id), eq(savedFilters.collectionId, collectionId)))
      .run();
  }
  function dailyWord(collectionId: number, date: string, random: () => number = Math.random) {
    return db.transaction((tx) => {
      const allTerms = tx.select().from(terms).where(eq(terms.collectionId, collectionId)).all();
      if (allTerms.length < 5) return undefined;
      const existing = tx
        .select()
        .from(dailyPicks)
        .where(and(eq(dailyPicks.collectionId, collectionId), eq(dailyPicks.localDate, date)))
        .get();
      if (existing) return allTerms.find((term) => term.id === existing.termId);
      const recent = tx
        .select()
        .from(dailyPicks)
        .where(eq(dailyPicks.collectionId, collectionId))
        .all()
        .filter((pick) => pick.localDate < date)
        .sort((a, b) => b.localDate.localeCompare(a.localDate))
        .slice(0, 3)
        .map((pick) => pick.termId);
      const termId = chooseDailyTerm(
        allTerms.map((term) => term.id),
        recent,
        random,
      )!;
      tx.insert(dailyPicks)
        .values({ collectionId, localDate: date, termId, selectedAt: new Date().toISOString() })
        .onConflictDoNothing()
        .run();
      const winner = tx
        .select()
        .from(dailyPicks)
        .where(and(eq(dailyPicks.collectionId, collectionId), eq(dailyPicks.localDate, date)))
        .get()!;
      return allTerms.find((term) => term.id === winner.termId);
    });
  }
  return {
    listCollections,
    getPreferences,
    updatePreferences,
    saveCollection,
    deleteCollection,
    listTerms,
    saveTerm,
    deleteTerm,
    listCategories,
    saveCategory,
    deleteCategory,
    listFilters,
    saveFilter,
    deleteFilter,
    dailyWord,
  };
}
export type Repository = ReturnType<typeof createRepository>;
