import * as DocumentPicker from 'expo-document-picker';
import { BackupSelectionError, selectBackup } from '../src/platform/backup-files';

let mockText = '{}';
let mockSize = 0;
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));
jest.mock('expo-file-system', () => ({
  File: class {
    get size() {
      return mockSize;
    }
    async text() {
      return mockText;
    }
  },
  Paths: { cache: 'file:///cache' },
}));

afterEach(() => {
  jest.clearAllMocks();
  mockText = '{}';
  mockSize = 0;
});
test('picker cancellation leaves the previous selection to its caller', async () => {
  jest
    .mocked(DocumentPicker.getDocumentAsync)
    .mockResolvedValueOnce({ canceled: true, assets: null });
  expect(await selectBackup()).toBeUndefined();
});
test('oversized and invalid files retain the selected filename in their error', async () => {
  jest.mocked(DocumentPicker.getDocumentAsync).mockResolvedValue({
    canceled: false,
    assets: [
      { name: 'selected.json', uri: 'file:///cache/selected.json', size: 1, lastModified: 0 },
    ],
  });
  mockSize = 26 * 1024 * 1024;
  await expect(selectBackup()).rejects.toMatchObject({
    reason: 'oversized',
    filename: 'selected.json',
  });
  mockSize = 1;
  mockText = '{';
  await expect(selectBackup()).rejects.toEqual(
    new BackupSelectionError('invalid', 'selected.json'),
  );
});
