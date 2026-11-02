import { sql } from 'drizzle-orm';
import {
  check,
  foreignKey,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

export const collections = sqliteTable('collections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  shortLabel: text('short_label'),
  icon: text('icon').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const terms = sqliteTable(
  'terms',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    collectionId: integer('collection_id')
      .notNull()
      .references(() => collections.id, { onDelete: 'cascade' }),
    original: text('original').notNull(),
    translation: text('translation').notNull(),
    notes: text('notes').notNull().default(''),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => [
    uniqueIndex('terms_collection_id_id').on(t.collectionId, t.id),
    index('terms_collection_id').on(t.collectionId),
  ],
);

export const categories = sqliteTable(
  'categories',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    collectionId: integer('collection_id')
      .notNull()
      .references(() => collections.id, { onDelete: 'cascade' }),
    kind: text('kind', { enum: ['grammatical', 'thematic'] }).notNull(),
    name: text('name').notNull(),
  },
  (t) => [
    uniqueIndex('categories_collection_id_id').on(t.collectionId, t.id),
    index('categories_collection_id').on(t.collectionId),
    check('categories_kind', sql`${t.kind} IN ('grammatical', 'thematic')`),
  ],
);

export const termCategories = sqliteTable(
  'term_categories',
  {
    collectionId: integer('collection_id').notNull(),
    termId: integer('term_id').notNull(),
    categoryId: integer('category_id').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.termId, t.categoryId] }),
    foreignKey({
      columns: [t.collectionId, t.termId],
      foreignColumns: [terms.collectionId, terms.id],
    }).onDelete('cascade'),
    foreignKey({
      columns: [t.collectionId, t.categoryId],
      foreignColumns: [categories.collectionId, categories.id],
    }).onDelete('cascade'),
    index('term_categories_category').on(t.collectionId, t.categoryId),
  ],
);

export const savedFilters = sqliteTable(
  'saved_filters',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    collectionId: integer('collection_id')
      .notNull()
      .references(() => collections.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    icon: text('icon').notNull(),
    search: text('search').notNull().default(''),
  },
  (t) => [
    uniqueIndex('saved_filters_collection_id_id').on(t.collectionId, t.id),
    index('saved_filters_collection_id').on(t.collectionId),
  ],
);

export const savedFilterCategories = sqliteTable(
  'saved_filter_categories',
  {
    collectionId: integer('collection_id').notNull(),
    filterId: integer('filter_id').notNull(),
    categoryId: integer('category_id').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.filterId, t.categoryId] }),
    foreignKey({
      columns: [t.collectionId, t.filterId],
      foreignColumns: [savedFilters.collectionId, savedFilters.id],
    }).onDelete('cascade'),
    foreignKey({
      columns: [t.collectionId, t.categoryId],
      foreignColumns: [categories.collectionId, categories.id],
    }).onDelete('cascade'),
    index('saved_filter_categories_category').on(t.collectionId, t.categoryId),
  ],
);

export const dailyPicks = sqliteTable(
  'daily_picks',
  {
    collectionId: integer('collection_id').notNull(),
    localDate: text('local_date').notNull(),
    termId: integer('term_id').notNull(),
    selectedAt: text('selected_at').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.collectionId, t.localDate] }),
    foreignKey({
      columns: [t.collectionId, t.termId],
      foreignColumns: [terms.collectionId, terms.id],
    }).onDelete('cascade'),
    index('daily_picks_term').on(t.collectionId, t.termId),
  ],
);

export const preferences = sqliteTable(
  'preferences',
  {
    id: integer('id').primaryKey().notNull().default(1),
    selectedCollectionId: integer('selected_collection_id').references(() => collections.id, {
      onDelete: 'set null',
    }),
    locale: text('locale', { enum: ['system', 'en', 'es'] })
      .notNull()
      .default('system'),
    appearance: text('appearance', { enum: ['system', 'light', 'dark'] })
      .notNull()
      .default('system'),
    onboardingComplete: integer('onboarding_complete', { mode: 'boolean' })
      .notNull()
      .default(false),
    onboardingStep: integer('onboarding_step').notNull().default(0),
    termView: text('term_view', { enum: ['compact', 'detailed'] })
      .notNull()
      .default('compact'),
    sortField: text('sort_field', { enum: ['original', 'translation', 'updated'] })
      .notNull()
      .default('original'),
    sortDirection: text('sort_direction', { enum: ['asc', 'desc'] })
      .notNull()
      .default('asc'),
  },
  (t) => [
    check('preferences_singleton', sql`${t.id} = 1`),
    check('preferences_locale', sql`${t.locale} IN ('system', 'en', 'es')`),
    check('preferences_appearance', sql`${t.appearance} IN ('system', 'light', 'dark')`),
    check('preferences_view', sql`${t.termView} IN ('compact', 'detailed')`),
    check('preferences_sort_field', sql`${t.sortField} IN ('original', 'translation', 'updated')`),
    check('preferences_sort_direction', sql`${t.sortDirection} IN ('asc', 'desc')`),
  ],
);

export type Collection = typeof collections.$inferSelect;
export type Term = typeof terms.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type SavedFilter = typeof savedFilters.$inferSelect;
export type DailyPick = typeof dailyPicks.$inferSelect;
export type Preferences = typeof preferences.$inferSelect;
