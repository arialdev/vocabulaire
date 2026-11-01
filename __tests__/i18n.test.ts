import { getLocales } from 'expo-localization';
import { resolveLanguage, resources } from '../src/i18n';

jest.mock('expo-localization', () => ({ getLocales: jest.fn(() => []) }));

test('selects a supported device language or falls back to English', () => {
  const locales = jest.mocked(getLocales);
  locales.mockReturnValue([{ languageCode: 'fr' }, { languageCode: 'es' }] as unknown as ReturnType<
    typeof getLocales
  >);
  expect(resolveLanguage('system')).toBe('es');
  locales.mockReturnValue([{ languageCode: 'fr' }] as unknown as ReturnType<typeof getLocales>);
  expect(resolveLanguage('system')).toBe('en');
  expect(resolveLanguage('es')).toBe('es');
  expect(resolveLanguage('en')).toBe('en');
});

test('English and Spanish contain the same bundled translation keys', () => {
  expect(Object.keys(resources.es.translation).sort()).toEqual(
    Object.keys(resources.en.translation).sort(),
  );
});
