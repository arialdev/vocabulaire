## Why

The vocabulary list shows expressions alongside their translations. Flashcards let users try to recall a translation before seeing it, using terms already in their notebook.

## What Changes

- Add Flashcard practice to the current collection's tools. Practice uses the whole collection, independent of vocabulary search and filters.
- Show the expression first. Tapping the card shows or hides its translation. Next picks a different random term and starts with its translation hidden.
- Show an empty message when the collection has zero terms. With one term, keep the card interactive and disable Next.

## Capabilities

### New Capabilities

- `flashcard-practice` — Offline, collection-scoped practice with translation reveal, random selection, and empty and single-term states.

### Modified Capabilities

## Impact

- Reuse the existing collection tools, Expo Router stack, repository reads, shared UI and themes, and English and Spanish translation resources.
- Add focused term-selection tests and synchronize the affected Stitch screens and Android review handoff.
- Keep practice read-only and screen-local. Dependencies, database schema, migrations, backup format, scores, learning progress, and animation are outside the scope.
