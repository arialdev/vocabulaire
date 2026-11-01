import { drizzle } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import { openDatabaseSync } from 'expo-sqlite';
import migrations from '../../drizzle/migrations';
import * as schema from './schema';

const databaseName = 'vocabulaire-native.db';
let connection: ReturnType<typeof createDatabase> | undefined;
let initialization: Promise<ReturnType<typeof createDatabase>> | undefined;

function createDatabase() {
  const sqlite = openDatabaseSync(databaseName);
  sqlite.execSync('PRAGMA foreign_keys = ON');
  return drizzle(sqlite, { schema });
}

/** Concurrent callers share one initialization. A failed migration can be retried without deleting data. */
export function initializeDatabase() {
  if (!initialization) {
    initialization = (async () => {
      connection ??= createDatabase();
      await migrate(connection, migrations);
      return connection;
    })().catch((error: unknown) => {
      initialization = undefined;
      throw error;
    });
  }
  return initialization;
}

export type Database = Awaited<ReturnType<typeof initializeDatabase>>;
