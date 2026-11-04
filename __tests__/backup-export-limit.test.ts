import { createSnapshot } from '../src/platform/backup';
import { prepareBackup } from '../src/platform/backup-files';
import type { Database } from '../src/data/database';

jest.mock('../src/platform/backup', () => ({
  BACKUP_SIZE_LIMIT: 25 * 1024 * 1024,
  createSnapshot: jest.fn(),
}));
jest.mock('expo-file-system', () => ({ File: jest.fn(), Paths: { cache: 'cache' } }));
jest.mock('expo-document-picker', () => ({}));
jest.mock('expo-sharing', () => ({}));

test('rejects a complete snapshot exceeding the restore size before writing a file', async () => {
  jest.mocked(createSnapshot).mockReturnValue({
    format: 'vocabulaire',
    schemaVersion: 2,
    exportedAt: '2026-01-01T00:00:00.000Z',
    data: {
      collections: [],
      terms: [],
      categories: [],
      termCategories: [],
      savedFilters: [],
      savedFilterCategories: [],
      dailyPicks: [],
      preferences: [],
      termAudio: [],
      extra: 'é'.repeat(13 * 1024 * 1024),
    },
  } as unknown as ReturnType<typeof createSnapshot>);
  await expect(prepareBackup({} as Database)).rejects.toThrow('Backup too large');
  const { File } = require('expo-file-system');
  expect(File).not.toHaveBeenCalled();
});
