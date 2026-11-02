import type { Repository } from '../src/data/repository';

/** Populate only a caller-owned disposable database for design and interaction checks. */
export function createNotebookFixtures(repository: Repository) {
  const empty = repository.saveCollection({ name: 'Empty notebook', icon: '📓' });
  const populated = repository.saveCollection({
    name: 'Field notes',
    icon: '👩🏽‍💻',
    shortLabel: 'FR',
  });
  const grammar = repository.saveCategory({
    collectionId: populated.id,
    kind: 'grammatical',
    name: 'Expression',
  });
  const theme = repository.saveCategory({
    collectionId: populated.id,
    kind: 'thematic',
    name: 'Travel',
  });
  const vocabulary = [
    [
      'flâner dans les rues sans avoir de destination précise',
      'to wander through the streets without a particular destination',
    ],
    [
      '日本語の長い表現をここに書きます',
      'Una expresión larga para comprobar que el texto se ajusta correctamente',
    ],
    ['مرحبا بالعالم', 'नमस्ते दुनिया'],
    ['café', 'coffee'],
    ['à bientôt', 'see you soon'],
  ];
  for (const [original, translation] of vocabulary) {
    repository.saveTerm({
      collectionId: populated.id,
      original,
      translation,
      notes: 'Notes: café, 日本語, العربية, हिन्दी',
      categoryIds: [grammar.id, theme.id],
    });
  }
  const filter = repository.saveFilter({
    collectionId: populated.id,
    name: 'Travel expressions',
    icon: '🧭',
    search: 'café',
    categoryIds: [grammar.id, theme.id],
  });
  return { empty, populated, grammar, theme, filter };
}
