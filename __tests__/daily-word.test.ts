import { chooseDailyTerm, localDate } from '../src/domain/daily-word';

test('requires five terms and chooses from candidates outside the three most recent picks', () => {
  expect(chooseDailyTerm([1, 2, 3, 4], [], () => 0)).toBeUndefined();
  expect(chooseDailyTerm([1, 2, 3, 4, 5], [1, 2, 3, 4], () => 0.99)).toBe(5);
  expect(chooseDailyTerm([1, 2, 3, 4, 5], [1, 2, 3], () => 0)).toBe(4);
});

test('uses the local calendar date', () => {
  expect(localDate(new Date(2026, 0, 2, 0, 1))).toBe('2026-01-02');
  expect(localDate(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-31');
});
