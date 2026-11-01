# Requested design corrections

These changes revise the proposed UI and its current Stitch artboards. Application source and the existing backup schema are not changed by this design pass.

## 1. Pronunciation

Neither term model has a dedicated pronunciation property. The legacy model contains original term, translated term, notes and two category groups (`.legacy/src/app/classes/term/term.ts:5`). The current schema contains original, translation, notes and category relations (`src/data/schema.ts:22`); the current editor provides the same fields (`src/app/term/edit.tsx:25`). Notes can contain arbitrary user text, but there is no separate pronunciation input or phonetic display contract.

Remove the invented phonetic transcription from onboarding step 2, term action/deletion underlays, and Word of the Day in both appearances. Future design generations must not add a pronunciation row.

## 2. Collection alias / short label

The legacy feature was a required **two-character uppercase prefix**, not a three-word label. The form uses `Validators.minLength(2)` and `Validators.maxLength(2)` (`.legacy/src/app/pages/collections/collection-view/collection-view-page.component.ts:63`). It generated an initial prefix from the first two name characters and allowed editing it. The prefix appeared in collection tiles (`.legacy/src/app/pages/collections/collections.page.html:26`) and beside vocabulary entries (`.legacy/src/app/pages/home/home.page.html:72`). A French / FR pairing therefore matches its original purpose.

The React Native migration replaced that contract with optional, unrestricted `shortLabel`. The repository trims it or stores null (`src/data/repository.ts:39`); its only current display consumer is a parenthetical label on the collection list (`src/app/index.tsx:52`). It does not select a language, determine translations, filter terms, or label PDFs.

Decision: retire the field from the proposed collection UI. Remove it from create/edit/validation/unsaved states and picker underlays. Also remove the invented “Little conversations”, “For the next adventure”, and “Small discoveries” subtitles from populated collection lists and restore underlays. Names and emoji already identify a collection. There is no replacement description field or FR-style code.

Existing stored `shortLabel` values and backup compatibility require no destructive change merely to remove this UI; implementation can preserve them while ceasing to ask for or display them.

## 3. PDF export

Remove the document/page preview entirely. Keep only the collection, result count, current query/categories/display summary, short scope explanation, Create PDF and Cancel. Export-ready still provides the filename and native share/save handoff.

## 4. Compact vocabulary footer

Change “PAGE 1 · 48 ENTRIES STORED LOCALLY” to “48 entries” in both appearances. Preserve complete word/translation wrapping, search, sorting summary, filters and Add term.
