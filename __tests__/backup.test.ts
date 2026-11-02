import { validateBackup, type Backup } from '../src/platform/backup';

function fixture(): Backup {
  const timestamp = '2026-10-29T12:00:00.000Z';
  return {
    format: 'vocabulaire',
    schemaVersion: 1,
    exportedAt: timestamp,
    data: {
      collections: [
        {
          id: 1,
          name: '日本語',
          shortLabel: null,
          icon: '👩🏽‍💻',
          createdAt: timestamp,
          updatedAt: timestamp,
        },
        {
          id: 2,
          name: 'Español',
          shortLabel: null,
          icon: '🇪🇸',
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
      terms: [
        {
          id: 1,
          collectionId: 1,
          original: '猫',
          translation: 'cat',
          notes: 'café',
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
      categories: [
        { id: 1, collectionId: 1, name: 'Noun', kind: 'grammatical' },
        { id: 2, collectionId: 2, name: 'Other', kind: 'thematic' },
      ],
      termCategories: [{ collectionId: 1, termId: 1, categoryId: 1 }],
      savedFilters: [{ id: 1, collectionId: 1, name: '猫', icon: '🐈', search: 'cat' }],
      savedFilterCategories: [{ collectionId: 1, filterId: 1, categoryId: 1 }],
      dailyPicks: [{ collectionId: 1, localDate: '2026-10-29', termId: 1, selectedAt: timestamp }],
      preferences: [
        {
          id: 1,
          selectedCollectionId: 1,
          locale: 'es',
          appearance: 'system',
          onboardingComplete: true,
          onboardingStep: 3,
          termView: 'compact',
          sortField: 'original',
          sortDirection: 'asc',
        },
      ],
    },
  };
}
test('preserves multilingual text and compound emoji in a JSON round trip', () => {
  const b = fixture();
  expect(validateBackup(JSON.parse(JSON.stringify(b)))).toEqual(b);
});
test('rejects legacy formats and cross-collection references', () => {
  expect(() => validateBackup({ collections: [] })).toThrow(/unsupported/i);
  const b = fixture();
  b.data.termCategories[0].categoryId = 2;
  expect(() => validateBackup(b)).toThrow(/ownership/i);
});
test('rejects duplicate IDs, invalid dates, and missing references', () => {
  const a = fixture();
  a.data.collections.push(a.data.collections[0]);
  expect(() => validateBackup(a)).toThrow(/duplicate/i);
  const b = fixture();
  b.data.dailyPicks[0].localDate = '2026-02-31';
  expect(() => validateBackup(b)).toThrow(/daily/i);
  const c = fixture();
  c.data.savedFilterCategories[0].filterId = 999;
  expect(() => validateBackup(c)).toThrow(/ownership/i);
});

test('rejects invalid preferences, malformed timestamps, and duplicate filter links', () => {
  const invalidPreferences = fixture();
  invalidPreferences.data.preferences[0].selectedCollectionId = 100;
  expect(() => validateBackup(invalidPreferences)).toThrow(/preferences/i);
  const invalidTimestamp = fixture();
  invalidTimestamp.data.terms[0].updatedAt = '2026-02-31T00:00:00.000Z';
  expect(() => validateBackup(invalidTimestamp)).toThrow(/term/i);
  const duplicateLink = fixture();
  duplicateLink.data.savedFilterCategories.push(duplicateLink.data.savedFilterCategories[0]);
  expect(() => validateBackup(duplicateLink)).toThrow(/duplicate/i);
});
