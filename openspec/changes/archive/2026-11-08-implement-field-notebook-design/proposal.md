## Why

The React Native app implements the core vocabulary notebook but still presents mostly default native buttons, basic forms and a crowded vocabulary screen. The approved Field Notebook designs now provide a complete, revised Android experience; implementing them will make collecting and revisiting vocabulary clearer, calmer and easier to use with one hand.

## What Changes

- Implement the shared paper/ink light and dark themes, bundled typography and icons, accessible controls, application bars, sheets, dialogs, feedback and adaptive layouts described in `design/vocabulaire/DESIGN.md`.
- Deliver all 53 designed views/states in both appearances, using `design/vocabulaire/inventory.json` and the gallery's current artboards for visual review. Treat `REVISIONS.md` and the written interaction contracts as authoritative over incidental mockup details.
- Replace onboarding with four connected pages, leftward-swipe advancement, accessible Next/Back controls and create/restore/skip shortcuts.
- Redesign collections, vocabulary, term forms/details, categories, Word of the Day, settings and data portability without replacing their working persistence/domain services.
- **BREAKING (UI only):** retire the collection short-label input and its displayed aliases/subtitles. Preserve existing stored values and supported version-1 backups; do not drop columns or erase data.
- Separate category/display drafts from applied filters; provide Categories/Display/Saved tabs, named filter management and visible query/display summaries. Persist supported display preferences already represented in the preferences schema.
- Add a pending emoji selection with Apply/Cancel around the existing Android native picker. Respect its actual browsing capabilities instead of copying an unsupported search control from the mockup.
- Add a concise PDF scope sheet without a page preview, local generation followed by an explicit share/save action, and compact/detailed document layouts matching the approved export scope. Give backups clear preview, confirmation, progress and recovery states.
- Localize new copy into English and Spanish and verify accessibility, system appearance, keyboard behavior and offline Android operation.
- Do not add pronunciation/IPA fields, audio, AI, accounts, synchronization, analytics or gamification. Keep the compact footer to the entry count without storage reminders.

## Capabilities

### New Capabilities

- `notebook-appearance`: shared visual system, bundled assets, accessible overlays/navigation, small-screen and large-text behavior, and appearance parity.
- `notebook-onboarding`: four-step introduction, specified swipe direction, progress persistence and start/restore/skip routes.
- `notebook-collections`: collection home/actions/forms, count-backed rows, retired alias UI and safe draft/deletion behavior.
- `notebook-vocabulary`: compact/detailed reading, search and empty states, term details/editing, category assignment and daily discovery.
- `notebook-categories-filters`: collection category editors, staged filtering/display controls, saved-filter workflows and persistent display preferences.
- `notebook-preferences-portability`: settings, preview-free PDF export, backup export and validated restore/recovery presentation.

### Modified Capabilities

None in `openspec/specs/`: the canonical spec directory is currently empty. These are added presentation/interaction contracts over the completed, unarchived `migrate-to-react-native` implementation; they do not repeat or archive that change. The alias UI retirement and PDF density behavior intentionally refine its earlier requirements, while its storage, query, ownership and backup invariants remain in force.

## Impact

- Main changes: `src/ui/`, `src/features/`, `src/app/`, `src/i18n/`, bundled assets and the existing emoji-picker wrapper. Keep routes ID-based and extract screen logic from the large collection route into focused feature components/hooks.
- Limited integration changes: collection term-count queries, preservation of hidden aliases during saves, preference wiring and PDF generation/share boundaries. No database reset, schema-version change or legacy-backup import.
- Reuse the installed React Native/Expo/Router, StyleSheet, hooks/context, gesture, font and native file stack. No new UI kit, state store, form framework or icon runtime dependency is planned.
- Extend existing Jest/component and Maestro coverage for changed interaction contracts, and perform Android visual/accessibility review against the paired artboards. This proposal creates planning artifacts only; application implementation follows separately.
