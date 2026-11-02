import { createVocabularyHtml } from '../src/platform/pdf';

test('escapes vocabulary and includes every supplied result including notes and categories', () => {
  const collection = {
    id: 1,
    name: '<Japanese>',
    shortLabel: null,
    icon: '📚',
    createdAt: '',
    updatedAt: '',
  };
  const terms = Array.from({ length: 30 }, (_, index) => ({
    id: index + 1,
    collectionId: 1,
    original: `<猫 ${index}>`,
    translation: 'cat & kitten',
    notes: 'Line 1\nLine 2',
    categoryIds: [1],
    createdAt: '',
    updatedAt: '',
  }));
  const html = createVocabularyHtml(
    collection,
    terms,
    [{ id: 1, collectionId: 1, name: 'noun & name', kind: 'grammatical' }],
    { translation: 'Translation', notes: 'Notes', categories: 'Categories', empty: 'Empty' },
    { icon: '⭐', name: 'Cats <&>' },
  );
  expect(html).toContain('&lt;Japanese&gt;');
  expect(html).toContain('Cats &lt;&amp;&gt;');
  expect(html).toContain('&lt;猫 29&gt;');
  expect(html).toContain('cat &amp; kitten');
  expect(html).toContain('noun &amp; name');
  expect(html).toContain('Line 1\nLine 2');
  expect(html).not.toContain('<猫');
  expect(html).not.toMatch(/https?:\/\//);
});
