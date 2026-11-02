const { DatabaseSync } = require("node:sqlite");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { drizzle } = require("drizzle-orm/expo-sqlite");
const { createRepository } = require("../src/data/repository");
const { queryTerms } = require("../src/domain/term-query");

// Exercise the actual repository and migrations against Node SQLite. Native durability
// remains a separate Android acceptance check.
function setup() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec("PRAGMA foreign_keys = ON");
  for (const file of ["0000_eager_thing.sql", "0001_steady_steel_serpent.sql"]) {
    sqlite.exec(readFileSync(join(__dirname, "..", "drizzle", file), "utf8"));
  }
  const client = {
    prepareSync(sql) {
      const stmt = sqlite.prepare(sql);
      return {
        executeSync(params) {
          const result = stmt.run(...params);
          return {
            changes: Number(result.changes),
            lastInsertRowId: Number(result.lastInsertRowid),
            getAllSync: () => stmt.all(...params),
            getFirstSync: () => stmt.get(...params),
          };
        },
        executeForRawResultSync(params) {
          stmt.setReturnArrays(true);
          return { getAllSync: () => stmt.all(...params) };
        },
      };
    },
  };
  const db = drizzle(client);
  return { sqlite, db, repo: createRepository(db) };
}

test("terms validate, isolate collections, preserve Unicode and update timestamps", () => {
  const { sqlite, repo } = setup();
  try {
    jest.useFakeTimers().setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const one = repo.saveCollection({ name: "日本語", icon: "👩🏽‍💻" });
    const two = repo.saveCollection({ name: "العربية", icon: "🇪🇸" });
    expect(() =>
      repo.saveTerm({
        collectionId: one.id,
        original: "  ",
        translation: "cat",
        notes: "",
        categoryIds: [],
      }),
    ).toThrow();
    const id = repo.saveTerm({
      collectionId: one.id,
      original: "猫",
      translation: "cat",
      notes: "café",
      categoryIds: [],
    });
    const original = repo.listTerms(one.id)[0];
    jest.setSystemTime(new Date("2026-01-02T00:00:00Z"));
    repo.saveTerm({
      id,
      collectionId: one.id,
      original: "猫",
      translation: "gato",
      notes: "café",
      categoryIds: [],
    });
    const edited = repo.listTerms(one.id)[0];
    expect(edited).toMatchObject({
      original: "猫",
      translation: "gato",
      notes: "café",
      createdAt: original.createdAt,
      updatedAt: "2026-01-02T00:00:00.000Z",
    });
    expect(repo.listTerms(two.id)).toEqual([]);
    expect(() =>
      repo.saveTerm({
        id,
        collectionId: two.id,
        original: "x",
        translation: "y",
        notes: "",
        categoryIds: [],
      }),
    ).toThrow();
    repo.deleteTerm(two.id, id);
    expect(repo.listTerms(one.id)).toHaveLength(1);
    repo.deleteTerm(one.id, id);
    expect(repo.listTerms(one.id)).toHaveLength(0);
  } finally {
    jest.useRealTimers();
    sqlite.close();
  }
});

test("saved filters use live criteria and category links survive renames and reconcile deletion", () => {
  const { sqlite, repo } = setup();
  try {
    const one = repo.saveCollection({ name: "One", icon: "📚" });
    const two = repo.saveCollection({ name: "Two", icon: "📚" });
    const category = repo.saveCategory({ collectionId: one.id, kind: "grammatical", name: "Verb" });
    const other = repo.saveCategory({ collectionId: two.id, kind: "thematic", name: "Other" });
    expect(() =>
      repo.saveFilter({
        collectionId: one.id,
        name: "Bad",
        icon: "⭐",
        search: "",
        categoryIds: [other.id],
      }),
    ).toThrow();
    const add = (original) =>
      repo.saveTerm({
        collectionId: one.id,
        original,
        translation: "go",
        notes: "",
        categoryIds: [category.id],
      });
    add("caminar");
    repo.saveFilter({
      collectionId: one.id,
      name: "Go",
      icon: "⭐",
      search: "go",
      categoryIds: [category.id],
    });
    repo.saveCategory({
      id: category.id,
      collectionId: one.id,
      kind: "grammatical",
      name: "Action",
    });
    add("correr");
    const filter = repo.listFilters(one.id)[0];
    const criteria = {
      search: filter.search,
      grammaticalIds: filter.categoryIds,
      thematicIds: [],
      sortField: "original",
      direction: "asc",
    };
    expect(
      queryTerms(repo.listTerms(one.id), repo.listCategories(one.id), criteria).map(
        (term) => term.original,
      ),
    ).toEqual(["caminar", "correr"]);
    expect(repo.listCategories(one.id)[0].name).toBe("Action");
    repo.deleteCategory(one.id, category.id);
    expect(repo.listFilters(one.id)[0]).toMatchObject({
      name: "Go",
      search: "go",
      categoryIds: [],
    });
    expect(repo.listTerms(one.id).every((term) => term.categoryIds.length === 0)).toBe(true);
  } finally {
    sqlite.close();
  }
});

test("daily picks reuse current content, avoid recent dates and remain collection-scoped", async () => {
  const { sqlite, repo } = setup();
  try {
    const one = repo.saveCollection({ name: "One", icon: "📚" });
    const two = repo.saveCollection({ name: "Two", icon: "📚" });
    for (const collectionId of [one.id, two.id]) {
      for (let i = 0; i < 6; i++) {
        repo.saveTerm({
          collectionId,
          original: `word ${i}`,
          translation: "before",
          notes: "",
          categoryIds: [],
        });
      }
    }
    const first = repo.dailyWord(one.id, "2026-01-01", () => 0);
    expect(repo.dailyWord(one.id, "2026-01-01", () => 0.99).id).toBe(first.id);
    const concurrent = await Promise.all([
      Promise.resolve().then(() => repo.dailyWord(one.id, "2026-01-05", () => 0)),
      Promise.resolve().then(() => repo.dailyWord(one.id, "2026-01-05", () => 0.99)),
    ]);
    expect(concurrent[0].id).toBe(concurrent[1].id);
    expect(() =>
      sqlite
        .prepare(
          "INSERT INTO daily_picks (collection_id, local_date, term_id, selected_at) VALUES (?, ?, ?, ?)",
        )
        .run(one.id, "2026-01-01", first.id, "2026-01-01T00:00:00.000Z"),
    ).toThrow();
    repo.saveTerm({
      id: first.id,
      collectionId: one.id,
      original: first.original,
      translation: "after",
      notes: "",
      categoryIds: [],
    });
    expect(repo.dailyWord(one.id, "2026-01-01", () => 0).translation).toBe("after");
    const second = repo.dailyWord(one.id, "2026-01-02", () => 0);
    const third = repo.dailyWord(one.id, "2026-01-03", () => 0);
    const fourth = repo.dailyWord(one.id, "2026-01-04", () => 0);
    expect(new Set([first.id, second.id, third.id, fourth.id]).size).toBe(4);
    expect(repo.dailyWord(two.id, "2026-01-01", () => 0).collectionId).toBe(two.id);
    repo.deleteTerm(one.id, first.id);
    const replacement = repo.dailyWord(one.id, "2026-01-01", () => 0);
    expect(replacement.id).not.toBe(first.id);
    expect(repo.dailyWord(one.id, "2026-01-01", () => 0.99).id).toBe(replacement.id);
  } finally {
    sqlite.close();
  }
});

test("backup round trip preserves the full graph and failed replacement rolls back", () => {
  const { sqlite, repo, db } = setup();
  const { createSnapshot, validateBackup, replaceFromBackup } = require("../src/platform/backup");
  try {
    const collection = repo.saveCollection({ name: "日本語", icon: "👩🏽‍💻" });
    const category = repo.saveCategory({
      collectionId: collection.id,
      kind: "thematic",
      name: "旅",
    });
    for (let i = 0; i < 5; i++)
      repo.saveTerm({
        collectionId: collection.id,
        original: `猫${i}`,
        translation: "cat",
        notes: "café",
        categoryIds: [category.id],
      });
    repo.saveFilter({
      collectionId: collection.id,
      name: "旅",
      icon: "🇪🇸",
      search: "猫",
      categoryIds: [category.id],
    });
    repo.dailyWord(collection.id, "2026-10-31", () => 0);
    repo.updatePreferences({ locale: "es", appearance: "dark", onboardingComplete: true });
    const original = createSnapshot(db);
    const parsed = validateBackup(JSON.parse(JSON.stringify(original)));
    repo.saveCollection({ name: "extra", icon: "📚" });
    sqlite.exec(
      "CREATE TRIGGER reject_restore BEFORE INSERT ON terms BEGIN SELECT RAISE(ABORT, 'intentional'); END",
    );
    expect(() => replaceFromBackup(db, parsed)).toThrow();
    expect(repo.listCollections()).toHaveLength(2);
    sqlite.exec("DROP TRIGGER reject_restore");
    replaceFromBackup(db, parsed);
    expect(createSnapshot(db).data).toEqual(original.data);
  } finally {
    sqlite.close();
  }
});
