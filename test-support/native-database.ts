import { drizzle } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import { openDatabaseSync } from 'expo-sqlite';
import migrations from '../drizzle/migrations';
import * as schema from '../src/data/schema';
import { createRepository } from '../src/data/repository';
import { createSnapshot, replaceFromBackup } from '../src/platform/backup';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

/** Android-only acceptance probe. Uses a uniquely named disposable database, never the app database. */
export async function runNativeDatabaseCheck(): Promise<string> {
  const name = `vocabulaire-acceptance-${Date.now()}.db`;
  let sqlite = openDatabaseSync(name);
  sqlite.execSync('PRAGMA foreign_keys = ON');
  let db = drizzle(sqlite, { schema });
  await migrate(db, migrations);
  let repo = createRepository(db);
  const one = repo.saveCollection({ name: 'One', icon: '👩🏽‍💻' });
  const two = repo.saveCollection({ name: 'Two', icon: '🇪🇸' });
  const category = repo.saveCategory({ collectionId: two.id, kind: 'thematic', name: 'Other' });
  let rejected = false;
  try {
    repo.saveTerm({
      collectionId: one.id,
      original: 'bad',
      translation: 'bad',
      notes: '',
      categoryIds: [category.id],
    });
  } catch {
    rejected = true;
  }
  assert(
    rejected && repo.listTerms(one.id).length === 0,
    'Cross-collection assignment was not rejected',
  );
  for (let i = 0; i < 5; i++)
    repo.saveTerm({
      collectionId: one.id,
      original: `word ${i}`,
      translation: `translation ${i}`,
      notes: '',
      categoryIds: [],
    });
  let databaseRejected = false;
  try {
    sqlite.runSync(
      'INSERT INTO term_categories (collection_id, term_id, category_id) VALUES (?, ?, ?)',
      one.id,
      repo.listTerms(one.id)[0].id,
      category.id,
    );
  } catch {
    databaseRejected = true;
  }
  assert(databaseRejected, 'SQLite accepted a cross-collection category');
  const first = repo.dailyWord(one.id, '2026-10-30', () => 0);
  const repeat = repo.dailyWord(one.id, '2026-10-30', () => 0.99);
  assert(first && repeat?.id === first.id, 'Same-day picks differ');
  const second = repo.dailyWord(one.id, '2026-10-31', () => 0);
  assert(second && second.id !== first.id, 'Recent pick not avoided');
  const backup = createSnapshot(db);
  sqlite.execSync(
    "CREATE TRIGGER acceptance_restore_failure BEFORE INSERT ON terms BEGIN SELECT RAISE(ABORT, 'intentional test failure'); END",
  );
  let failed = false;
  try {
    replaceFromBackup(db, backup);
  } catch {
    failed = true;
  }
  assert(
    failed && repo.listTerms(one.id).length === 5 && repo.listCollections().length === 2,
    'Failed restore did not roll back',
  );
  sqlite.execSync('DROP TRIGGER acceptance_restore_failure');
  replaceFromBackup(db, backup);
  sqlite.closeSync();
  sqlite = openDatabaseSync(name);
  sqlite.execSync('PRAGMA foreign_keys = ON');
  db = drizzle(sqlite, { schema });
  await migrate(db, migrations);
  repo = createRepository(db);
  assert(repo.listTerms(one.id).length === 5, 'Terms did not survive reopening');
  assert(
    repo.dailyWord(one.id, '2026-10-30', () => 0.99)?.id === first.id,
    'Daily pick did not survive reopening',
  );
  repo.deleteTerm(one.id, first.id);
  assert(
    repo.dailyWord(one.id, '2026-10-30', () => 0) === undefined,
    'Minimum threshold ignored after deletion',
  );
  repo.saveTerm({
    collectionId: one.id,
    original: 'replacement',
    translation: 'replacement',
    notes: '',
    categoryIds: [],
  });
  assert(
    repo.dailyWord(one.id, '2026-10-30', () => 0)?.id !== first.id,
    'Deleted daily pick was reused',
  );
  sqlite.closeSync();
  return 'PASS: migrations, ownership, rollback, restore, reopen and daily picks';
}
