import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { Category, Collection } from '../data/schema';
import type { TermWithCategories } from '../domain/term-query';
import { createVocabularyHtml } from './pdf';

export async function shareVocabularyPdf(
  collection: Collection,
  terms: TermWithCategories[],
  categories: Category[],
  language: string,
  filter?: { name: string; icon: string },
): Promise<void> {
  if (!terms.length) throw new Error('There are no results to export.');
  if (!(await Sharing.isAvailableAsync()))
    throw new Error('Sharing is not available on this device.');
  const labels =
    language === 'es'
      ? {
          translation: 'Traducción',
          notes: 'Notas',
          categories: 'Categorías',
          empty: 'Sin términos',
        }
      : { translation: 'Translation', notes: 'Notes', categories: 'Categories', empty: 'No terms' };
  const result = await Print.printToFileAsync({
    html: createVocabularyHtml(collection, terms, categories, labels, filter),
  });
  await Sharing.shareAsync(result.uri, {
    mimeType: 'application/pdf',
    dialogTitle: language === 'es' ? 'Compartir vocabulario' : 'Share vocabulary',
  });
}
