const { readFileSync } = require("node:fs");
const { DatabaseSync } = require("node:sqlite");
const { join } = require("node:path");

function createDatabase() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  for (const file of ["0000_eager_thing.sql", "0001_steady_steel_serpent.sql"]) {
    db.exec(readFileSync(join(__dirname, "..", "drizzle", file), "utf8"));
  }
  return db;
}

test("schema rejects cross-collection category references and cascades category deletion", () => {
  const db = createDatabase();
  try {
    db.exec(
      "INSERT INTO collections (id,name,icon,created_at,updated_at) VALUES (1,'One','📚','x','x'),(2,'Two','📚','x','x')",
    );
    db.exec(
      "INSERT INTO terms (id,collection_id,original,translation,created_at,updated_at) VALUES (1,1,'cat','gato','x','x')",
    );
    db.exec(
      "INSERT INTO categories (id,collection_id,kind,name) VALUES (1,1,'grammatical','Noun'),(2,2,'thematic','Other')",
    );
    expect(() => db.exec("INSERT INTO term_categories VALUES (1,1,2)")).toThrow();
    db.exec("INSERT INTO term_categories VALUES (1,1,1)");
    db.exec("DELETE FROM categories WHERE id=1");
    expect(db.prepare("SELECT count(*) AS count FROM term_categories").get().count).toBe(0);
    expect(db.prepare("SELECT count(*) AS count FROM terms").get().count).toBe(1);
  } finally {
    db.close();
  }
});

test("a failed multi-record write rolls back the entire transaction", () => {
  const db = createDatabase();
  try {
    db.exec("BEGIN");
    db.exec(
      "INSERT INTO collections (id,name,icon,created_at,updated_at) VALUES (1,'One','📚','x','x')",
    );
    expect(() =>
      db.exec("INSERT INTO categories (id,collection_id,kind,name) VALUES (1,1,'invalid','Bad')"),
    ).toThrow();
    db.exec("ROLLBACK");
    expect(db.prepare("SELECT count(*) AS count FROM collections").get().count).toBe(0);
  } finally {
    db.close();
  }
});
