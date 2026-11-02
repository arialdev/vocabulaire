## Context

The app is a working Expo/React Native Android vocabulary notebook backed by SQLite/Drizzle. Its domain services already implement collection ownership, Unicode records, combined search/category matching, stable daily picks, atomic restore and local file operations. Most routes currently render default `Button`, `Alert`, basic `TextInput` and a three-color theme. The vocabulary route also owns a large filter form directly.

Approved inputs, in precedence order:

1. The user's four corrections, recorded in `design/vocabulaire/REVISIONS.md`.
2. `design/vocabulaire/DESIGN.md` and `FLOWS.md` for semantic tokens and interactions.
3. `inventory.json` / `screens.json` for the 53 current light/dark pairs and the referenced PNGs for visual hierarchy.
4. Generated HTML as a visual reference only. Its hosted dependencies, incidental metadata, hard-coded dates/counts and fabricated limits are not application requirements.

The completed `migrate-to-react-native` change is unarchived, and `openspec/specs/` has no main specs. This change therefore adds six presentation capabilities. It leaves the migration's artifacts intact. Its approved alias retirement and PDF density behavior supersede the earlier presentation expectations; storage compatibility remains intact. Later spec promotion must retain that distinction rather than restoring an alias input or requiring notes in a compact PDF.

The approved design handoff is tracked in the repository and must remain available as versioned implementation/review input in another checkout. Verify that its inventory and current paired references agree before starting a slice. Application bundles must include only runtime assets, not the gallery, artboard screenshots or generated HTML.

## Goals / Non-Goals

**Goals:**

- Implement every state in `screen-coverage.md`, with consistent light/dark presentation and real collection data.
- Make core actions comfortable with one hand, forms usable with the keyboard, and vocabulary readable at larger text sizes and in different scripts.
- Preserve existing records, identifiers, category ownership, supported backups and offline operation while retiring the alias UI.
- Make staged filters, editor subflows, file handoffs and destructive confirmations predictable and testable.
- Reuse the approved installed stack and record actual Android evidence for the finished UI.

**Non-Goals:**

- A new application framework, UI kit, state store, form framework, backend or dependency upgrade campaign.
- Database resets, dropping `short_label`, changing the backup schema version or importing Ionic backups.
- Pronunciation/IPA fields, audio, AI, sign-in, synchronization, analytics, gamification, iOS/web release acceptance or production signing.
- A PDF page preview, replacement collection description field, artificial character limits, fake timestamps/counts or invented file-format metadata.

## Decisions

### 1. Implement reusable native UI and feature controllers

Retain Expo Router's ID-based route paths. Move presentation and draft state into focused modules beneath `src/features/`; keep route files as composition and parameter-validation boundaries. Extract the large collection route into vocabulary/query, filters and export components. Existing repository/domain/platform modules remain the authoritative data boundaries.

Build a small repository-owned UI layer under `src/ui/`: semantic typography, screen/app bar, icon/action buttons, fields, radio/segmented controls, typed category chips, empty/error states, collection/term rows, sheet/dialog hosts and accessible transient feedback. Use React Native components, StyleSheet, hooks/context and the already-installed gesture libraries. No new UI, form or state-management package is needed.

The 53 designs are states of these components and workflows, rather than a requirement for 53 routes. `screen-coverage.md` maps each state to its owner, implementation task and verification approach. Do not rebuild the generated HTML in a WebView.

**Alternative considered:** styling each route independently is initially faster but repeats navigation, theme, validation and overlay behavior across the entire app. A large third-party UI kit would expand the approved stack and make the notebook visual language harder to control.

### 2. Semantic themes, bundled assets and startup

Expand `Theme` to the light/dark semantic roles in the approved design: canvas, surface, input, text hierarchy, primary/on-primary, selected, grammatical/thematic, destructive/error and distinct decorative/functional outlines. Components consume roles instead of hard-coded colors. Include spacing, radii and typography tokens; retain the stronger functional outline needed for control identification.

Bundle EB Garamond and DM Sans font files with the required weights and license notices using the installed `expo-font`. Use Android script fallback for supported non-Latin text and verify Japanese, Arabic, Hindi and accented Latin samples. Use a bundled icon-font subset/file with a typed icon-name map and license notices; avoid adding an icon runtime dependency or downloading fonts at runtime. Decorative line illustrations can be small bundled assets or native primitives. Emoji stays Unicode, rendered by the platform.

Coordinate existing database/preferences initialization and local font loading before exposing the main stack. Hold the native splash while initializing; then show the resolved stored appearance without an intermediate unthemed app screen. Startup errors use a readable system-themed recovery surface and never clear data. Font failure offers a usable system-font fallback/retry instead of blocking access to vocabulary.

Propagate the resolved appearance to application chrome, status/root background, sheets, dialogs and the native picker. System appearance changes update visible UI without resetting drafts. The selected Settings appearance corresponds to the rendered mode; preview tiles retain their own light/dark examples.

Android owns the external document picker/share sheet and its appearance; adapt the app-owned surroundings and do not promise to recolor another system activity.

**Alternative considered:** remote web fonts or screenshot-derived assets break offline startup. Treating all borders as subtle dividers would miss functional control contrast.

### 3. Navigation, overlays and accessibility form one shared contract

Use one app bar per screen; disable the redundant generic stack header when a feature supplies its designed app bar. Collections is the root, with Settings in its bar. Collection tools expose daily word, categories, PDF and collection editing. Keep a single primary action near the bottom, clear of system/gesture insets and the IME.

Use one active application overlay at a time, with explicit sheet/dialog states owned by the invoking feature. A filter-to-save-filter-to-emoji transition retains its parent drafts while replacing the visible sheet. Confirmations retain their invocation target and do not infer a destructive record from the currently selected row after a refresh.

Sheets use native `Modal` presentation, a scrollable body, a safe footer, dismissal and expanded-height behavior. Dialogs and the existing unsaved guard share themed confirmation content. Android Back dismisses the current overlay before affecting the route; a dirty route exit preserves the attempted navigation and resumes it only after confirmed discard. Dismissing a child picker/editor does not discard its parent form.

Provide accessible names and selected/disabled states, modal focus containment, focus restoration to the invoking action, error announcements and first-invalid-field focus. Use 48 dp touch targets, readable line heights and logical start/end spacing. At 320 dp width or 200% font scaling, allow wrapping and scrolling or use a full-height sheet; do not shrink text, truncate expressions or cover controls. Test the interaction between keyboard insets and fixed footers to avoid applying avoidance twice. Respect reduced-motion preferences.

**Alternative considered:** keeping unrelated native alerts and separate ad hoc modals would preserve inconsistent appearance and make Back/focus behavior unpredictable.

### 4. Preserve data while simplifying collection UI

Remove alias inputs, their form state/dirty checks, and alias/subtitle rendering from collection rows and overlay backgrounds. A collection editor exposes only name and emoji. Keep `collections.shortLabel` and the supported JSON representation. When editing an existing collection, pass its existing hidden `shortLabel` through to the current repository API; that API otherwise normalizes an omitted label to null. New collections use null. Name/icon changes must preserve any imported alias and all related records.

Add a focused `listCollectionSummaries` repository query using an aggregate count/join rather than loading all terms or issuing one term query per row. Keep the existing `listCollections` shape for other callers and backup creation. Refresh counts through the existing revision mechanism after writes and restore. Use genuine empty, loading and failure states rather than zero counts on failed reads.

**Alternative considered:** dropping the column or changing schema version adds destructive migration work without improving the proposed UI. Silently overwriting an old alias during a name-only edit would violate the data-preservation goal.

### 5. Four-step onboarding uses explicit transition semantics

Reuse persisted `onboardingStep` and `onboardingComplete`. Implement one step transition function shared by Next/Back and a gesture on the content region: a leftward swipe advances and a rightward swipe returns, bounded at the first/last page. This direction supersedes the earlier rightward-advance handoff at the user's request. Keep native edge Back and vertical scrolling available; do not capture swipes starting on controls. Persist only completed transitions, not partial drags.

Steps cover collections, entries, filters and backups. Early Get started opens create/restore/skip choices. Create or Skip completes onboarding; canceling first creation returns to the empty home without creating a record. Restore opens Backups while retaining the current introduction step if canceled. Successful explicit restoration completes onboarding as a separate UI action and returns to Collections, while using the restored locale, appearance and display preferences. This does not change the backup format or raw `replaceFromBackup` round-trip behavior.

Buttons remain an equally capable accessible path.

Onboarding content enters with a short directional slide and fade on first presentation and page changes. Controls and persisted progress update immediately, and a new transition interrupts any motion still in progress. With reduced motion enabled, or while the system preference is unresolved, content stays still and fully visible.

### 6. Editor drafts and native emoji selection remain local

Retain controlled collection/term forms. Required-field validation is per field, trims for validation and preserves the typed values. Saving commits once and returns to the invoking list/details screen; failure keeps the draft and offers retry. Do not add pronunciation or hidden metadata inputs. Notes remains arbitrary text.

Keep the term editor mounted when it pushes collection category management, so returning preserves expression, translation, notes and selection. Do not key/remount the editor on a repository revision. Reconcile selected category IDs against the refreshed category list after edits/deletion. Creation/editing of categories uses the existing collection-scoped repository; type is selectable on creation and read-only on editing.

Wrap the existing Jetpack picker with a pending emoji state. Native selection updates only that pending value; Apply updates the invoking draft, while Cancel/Back restores its previous icon. Preserve the complete Unicode sequence. Recreate/theme the native view on resolved appearance/locale changes without losing the pending value. Reuse native category/variant browsing. The current wrapper exposes no emoji-search API, so omit the mockup's unsupported search field rather than ship a nonfunctional control or introduce a new emoji catalogue/search dependency. This adaptation does not remove vocabulary search.

**Alternative considered:** immediately updating the invoking form on every picker selection cannot implement the proposed Apply/Cancel contract. A new JavaScript picker/search catalogue would duplicate the already-approved native integration.

### 7. Separate applied query, sheet draft and saved intent

Create a collection-scoped query/filter controller. Keep applied search/category criteria separate from a sheet draft containing category IDs and display choices. Initialize the draft on sheet entry, retain it while switching tabs/child sheets, and calculate its result count with the existing `queryTerms` function. Apply commits draft categories and display preferences; Close/Back discards them. A failed preference write keeps the sheet and draft available without partially applying a different display state.

Read/write `termView`, `sortField` and `sortDirection` in the existing preferences table. These display preferences are app-wide, survive collection changes/restarts and are not saved-filter criteria. Search/category state and the applied-filter identity are collection-local and reset when changing collections. Text sort labels use A–Z/Z–A; time sort labels use Oldest/Newest.

Clear category filters changes only draft categories. The no-results Clear search & filters action clears applied search/categories while retaining display choices. Removing an applied chip or changing search detaches the saved-filter badge without updating the stored filter. A display-only change retains the badge.

Save selection captures current search and the pending category selection displayed in its read-only summary. It saves criteria, name and emoji, then returns to the parent sheet with that draft intact; saving does not silently apply pending choices. Canceling the child form also preserves the parent draft. Applying a saved filter immediately installs its search/categories, retains committed display preferences, discards any uncommitted display draft and closes the sheet. Deleting an applied saved filter removes its badge but retains the current query and vocabulary. Prune deleted categories from applied/draft selections and refresh saved-filter summaries.

Preserve OR within each category type, AND between types, Latin-only diacritic normalization, stable sorting ties and collection ownership. Do not replace `queryTerms` with screen-specific matching logic.

**Alternative considered:** immediate mutation inside the filter sheet makes Close/Cancel misleading and entangles display preferences with saved query intent.

### 8. Reading surfaces and daily word reuse existing domain behavior

Keep a virtualized vocabulary list. Compact rows contain complete expression and translation; detailed rows additionally show a bounded note preview and category chips. Details shows full notes and grouped categories. Provide separate empty-collection, no-results, loading and read-error states. Overflow opens edit/delete actions; confirmation is required before deletion. The compact footer contains the localized entry count only, with no page number or storage reminder.

Word of the Day uses the existing stable collection/local-date selection service and minimum-five rule. It shows stored text/categories/notes and opens the existing term details route. The insufficient state derives the missing count. No new daily algorithm, shuffle, IPA row, streak or reward is introduced.

### 9. Model file flows explicitly and keep the current backup format

Refactor platform helpers so file preparation and native sharing are separate operations. Return typed prepared-file descriptors (`uri`, display name and summary) rather than immediately opening a share sheet. These are temporary runtime objects, not new persisted records. Guard preparation/sharing against repeated taps and invalidate stale completions after dismissal/navigation.

PDF flow: `scope → preparing → ready → sharing`, with recoverable preparation/share errors. Freeze a snapshot of the applied result set, order, display density, collection/filter title and UI language when preparing. Export every matching term, not just mounted rows. Extend the renderer with a typed layout option: compact contains originals/translations; detailed adds existing optional notes/categories. The existing no-option renderer behavior remains detailed for callers/tests that depend on it. Keep escaping and offline document resources. The scope sheet contains no page preview/thumbnail. Ready shows filename/count and Share or save PDF; it does not regenerate on every share attempt.

Backup export similarly prepares one consistent existing `createSnapshot` payload, then presents Backup ready and native sharing. Native share completion does not prove that a user saved a file, so do not invent a successful-save timestamp or promise a safely stored copy. Temporary files stay in app-controlled cache; clean up abandoned/replaced files best-effort without touching user destinations.

Extend backup selection to return the selected filename along with the validated payload. Preserve the 25 MB limit and current complete graph validation. Cancellation keeps the previous screen without an error. A newly selected invalid file clears its eligibility for confirmation and shows plain-language recovery; retain enough filename information for truthful feedback without inventing a format number or failure cause.

Restore flow: `idle → selecting → validated preview → confirmation → restoring → success/failure`. Preview shows the real export date and four counts. Export current data first is optional and returns to the retained restore candidate after its own export flow. Final confirmation names the file and says replacement, never merge. Render the busy state before invoking the synchronous existing transaction; no fake percentage or cancellation promise after replacement starts. Synchronous SQLite may pause animation during the transaction; preserve atomicity rather than inventing an unsupported asynchronous transaction.

After successful replacement, invalidate old query/draft state, apply restored preferences, complete the user-initiated onboarding transition if necessary and replace the navigation stack with a valid home. Distinguish a transaction failure (old data kept) from a post-commit refresh/navigation failure (data restored; recover/restart guidance). Retry cannot accidentally report a completed restore as rolled back. Preparation, invalid-file and share errors never modify notebook records.

**Alternative considered:** the current combined generate-and-share functions cannot show honest Ready states or retry sharing an existing file. A backup schema migration is unnecessary for filenames, counts and these UI states.

### 10. Verify behavior and visual coverage with the existing tools

Update English/Spanish resources together, including pluralization, dates, direction labels, accessible names and errors. Store vocabulary untouched; interface language is independent. Use stable semantic accessibility labels/test IDs instead of relying on incidental coordinates or obsolete button copy in Maestro.

Extend Jest/component tests around changed contracts: hidden-alias preservation, Apply/Cancel and preference persistence, saved-filter detachment, emoji pending state, draft survival through category management, confirmations, file outcome distinctions, compact/detailed PDF content and operation concurrency. Keep existing domain/backup rollback tests; do not replace them with visual snapshots or write assertions for every spacing token.

Use deterministic test fixtures for native visual review, never seed example collections in the production first-run path. Record every state 01–53 in both appearances, using stable IDs from `inventory.json`; the original 390 dp artboard is the reference, with documented platform adaptations. Review all screens for English/Spanish text, and exercise the highest-risk flows at 320 dp/200% font scaling, with keyboard and TalkBack. Validate system-following appearance changes and native picker/file handoffs on Android.

Recovery-only visuals can use a controlled development/test harness with disposable data and injected failures. Keep that harness unreachable in the shipping application and label its evidence separately from real native I/O; do not claim that a fault screenshot proves transactional rollback.

Run project lint, format, type and Jest checks, then a local standalone Android build and affected Maestro flows. Final airplane-mode checks must run without Metro, covering cold start/fonts, both themes, collection/term/category/filter use, daily word, backup export/restore/rejection and PDF generation/sharing. Record screenshots and actual results/limits in `verification.md`; the old migration's completed checks are baseline evidence, not evidence for the redesigned UI.

## Risks / Trade-offs

- [Generated frames contain inconsistent invented details] → Written revisions/interaction contracts take precedence; omit aliases, IPA, PDF previews, arbitrary length caps and fake metadata even if an older image contains them.
- [Native emoji picker differs from the mockup] → Retain Jetpack browsing/variants, implement pending Apply/Cancel, and document the unsupported-search adaptation during visual review.
- [Large-text sheets and the keyboard compete for space] → Shared inset ownership, full-height fallback, scrolling and native review at narrow width/200% text.
- [Overlay chaining loses an editor/filter draft] → One visible overlay with parent-owned drafts; test Back, Cancel and return from category management.
- [Hidden aliases are accidentally erased] → Preserve the existing value on edits and round-trip a supported backup containing a non-null alias.
- [Prepared export files become stale or native sharing is canceled] → Freeze scope, retain truthful Ready state, check file availability and distinguish OS handoff from confirmed saving.
- [Synchronous restore blocks animated progress] → Paint a truthful busy surface before the transaction, prevent duplicate actions, preserve rollback and avoid fake progress.
- [The old unarchived specs are promoted later] → Preserve storage contracts while reconciling alias presentation and PDF layout with this newer approved change; do not archive unrelated work automatically.

## Migration Plan

1. Retain the canonical design inputs and add shared tokens/assets/components without changing the database or backup schema.
2. Implement screens in coherent slices: onboarding/collections, vocabulary/forms/daily, categories/filters, then preferences/file flows. Keep every route navigable during each slice.
3. Retire alias UI while preserving its hidden storage value. Wire existing display preferences and add typed file/layout options without changing the supported snapshot representation.
4. Update behavior tests and native flow selectors alongside each slice. Complete the paired-state review and standalone/offline acceptance before marking implementation tasks complete.
5. Roll back presentation/component commits if needed; existing records and supported backups remain readable. There is no destructive schema migration to reverse. Preserve backups and avoid restoring fixture data into a user's database.

## Open Questions

No product decision blocks implementation. Exact native picker rendering, font glyph coverage and narrow-screen sheet geometry are implementation acceptance checks with the fallback/adaptation rules above. If they require a new substantive dependency or a feature-scope change, document that evidence and seek a decision rather than silently changing the approved stack.
