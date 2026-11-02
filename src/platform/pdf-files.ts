import * as Print from 'expo-print';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { Category, Collection } from '../data/schema';
import type { TermWithCategories } from '../domain/term-query';
import { createVocabularyHtml } from './pdf';

export type PdfSnapshot = {
  collection: Collection;
  terms: TermWithCategories[];
  categories: Category[];
  language: string;
  layout: 'compact' | 'detailed';
  filter?: { name: string; icon: string };
};
export type PreparedPdf = { uri: string; filename: string; snapshot: PdfSnapshot };

/** Copy the complete query result and its presentation before any asynchronous work. */
export function capturePdfSnapshot(snapshot: PdfSnapshot): PdfSnapshot {
  return {
    ...snapshot,
    collection: { ...snapshot.collection },
    terms: snapshot.terms.map((term) => ({ ...term, categoryIds: [...term.categoryIds] })),
    categories: snapshot.categories.map((category) => ({ ...category })),
    filter: snapshot.filter ? { ...snapshot.filter } : undefined,
  };
}
export async function prepareVocabularyPdf(input: PdfSnapshot): Promise<PreparedPdf> {
  const snapshot = capturePdfSnapshot(input);
  if (!snapshot.terms.length) throw new Error('There are no results to export.');
  const labels =
    snapshot.language === 'es'
      ? {
          translation: 'Traducción',
          notes: 'Notas',
          categories: 'Categorías',
          empty: 'Sin términos',
        }
      : { translation: 'Translation', notes: 'Notes', categories: 'Categories', empty: 'No terms' };
  const result = await Print.printToFileAsync({
    html: createVocabularyHtml(
      snapshot.collection,
      snapshot.terms,
      snapshot.categories,
      labels,
      snapshot.filter,
      snapshot.layout,
    ),
  });
  const filename = `vocabulaire-${Date.now()}.pdf`;
  const generated = new File(result.uri);
  const destination = new File(Paths.cache, filename);
  try {
    generated.move(destination);
  } catch (error) {
    try {
      if (generated.exists) generated.delete();
    } catch {
      /* best effort */
    }
    throw error;
  }
  return { uri: destination.uri, filename, snapshot };
}
export async function sharePreparedVocabularyPdf(file: PreparedPdf): Promise<void> {
  if (!(await Sharing.isAvailableAsync()))
    throw new Error('Sharing is not available on this device.');
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/pdf',
    dialogTitle: file.snapshot.language === 'es' ? 'Compartir vocabulario' : 'Share vocabulary',
  });
}
/** Compatibility for callers that still combine preparation and handoff. */
export async function shareVocabularyPdf(
  collection: Collection,
  terms: TermWithCategories[],
  categories: Category[],
  language: string,
  filter?: { name: string; icon: string },
): Promise<void> {
  const file = await prepareVocabularyPdf({
    collection,
    terms,
    categories,
    language,
    filter,
    layout: 'detailed',
  });
  await sharePreparedVocabularyPdf(file);
}
