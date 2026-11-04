import { chooseFlashcard } from '../src/domain/flashcard';

test('selects only eligible term identities', () => {
  expect(chooseFlashcard([], undefined, () => 0)).toBeUndefined();
  expect(chooseFlashcard([1], undefined, () => 0)).toBe(1);
  expect(chooseFlashcard([1], 1, () => 0)).toBeUndefined();
  expect(chooseFlashcard([1, 2, 3], undefined, () => 0)).toBe(1);
  expect(chooseFlashcard([1, 2, 3], undefined, () => 0.999)).toBe(3);
  expect(chooseFlashcard([1, 2, 3], 2, () => 0)).toBe(1);
  expect(chooseFlashcard([1, 2, 3], 2, () => 0.999)).toBe(3);
});

test('permits a different term with the same expression', () => {
  const terms = [
    { id: 1, original: 'same' },
    { id: 2, original: 'same' },
  ];
  expect(
    chooseFlashcard(
      terms.map((term) => term.id),
      1,
      () => 0,
    ),
  ).toBe(2);
});
