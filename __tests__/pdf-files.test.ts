import {
  capturePdfSnapshot,
  prepareVocabularyPdf,
  sharePreparedVocabularyPdf,
} from '../src/platform/pdf-files';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

jest.mock('expo-file-system', () => ({
  Paths: { cache: 'file:///cache' },
  File: class {
    uri: string;
    constructor(...parts: string[]) {
      this.uri = parts.join('/');
    }
    move() {}
  },
}));
jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn().mockResolvedValue({ uri: 'file:///cache/result.pdf' }),
}));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

const snapshot = () => ({
  collection: { id: 1, name: 'French', shortLabel: 'FR', icon: '📚', createdAt: '', updatedAt: '' },
  terms: [
    {
      id: 1,
      collectionId: 1,
      original: 'café',
      translation: 'coffee',
      notes: 'note',
      categoryIds: [1],
      createdAt: '',
      updatedAt: '',
    },
  ],
  categories: [{ id: 1, collectionId: 1, name: 'Food', kind: 'thematic' as const }],
  language: 'en',
  layout: 'compact' as const,
});

test('captured scope remains stable and sharing reuses the generated file', async () => {
  const current = snapshot();
  const captured = capturePdfSnapshot(current);
  current.terms[0].original = 'changed';
  current.terms[0].categoryIds.push(2);
  const file = await prepareVocabularyPdf(captured);
  expect(file.snapshot.terms[0].original).toBe('café');
  expect(file.snapshot.terms[0].categoryIds).toEqual([1]);
  expect(file.filename).toMatch(/^vocabulaire-\d+\.pdf$/);
  expect(file.uri).toContain(file.filename);
  await sharePreparedVocabularyPdf(file);
  await sharePreparedVocabularyPdf(file);
  expect(Print.printToFileAsync).toHaveBeenCalledTimes(1);
  expect(Sharing.shareAsync).toHaveBeenCalledTimes(2);
});
