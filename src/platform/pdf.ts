import type { Category, Collection } from '../data/schema';
import type { TermWithCategories } from '../domain/term-query';

export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!,
  );
}
export function createVocabularyHtml(
  collection: Collection,
  terms: TermWithCategories[],
  categories: Category[],
  labels: { translation: string; notes: string; categories: string; empty: string },
  filter?: { name: string; icon: string },
): string {
  const body = terms
    .map((term) => {
      const names = categories
        .filter((category) => term.categoryIds.includes(category.id))
        .map((category) => category.name);
      return `<article><h2>${escapeHtml(term.original)}</h2><p><strong>${escapeHtml(labels.translation)}:</strong> ${escapeHtml(term.translation)}</p>${term.notes ? `<p><strong>${escapeHtml(labels.notes)}:</strong> ${escapeHtml(term.notes)}</p>` : ''}${names.length ? `<p><strong>${escapeHtml(labels.categories)}:</strong> ${names.map(escapeHtml).join(', ')}</p>` : ''}</article>`;
    })
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>@page { margin: 18mm; } body { font-family: sans-serif; color: #111; overflow-wrap: anywhere; } h1 { font-size: 24pt; } h2 { font-size: 15pt; margin: 0 0 4pt; } article { break-inside: avoid; padding: 10pt 0; border-bottom: 1px solid #ccc; } p { margin: 4pt 0; white-space: pre-wrap; }</style></head><body><h1>${escapeHtml(collection.icon)} ${escapeHtml(collection.name)}</h1>${filter ? `<h2>${escapeHtml(filter.icon)} ${escapeHtml(filter.name)}</h2>` : ''}${body || `<p>${escapeHtml(labels.empty)}</p>`}</body></html>`;
}
