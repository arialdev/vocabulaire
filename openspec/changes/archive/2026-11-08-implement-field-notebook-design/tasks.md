## 1. Retain the approved inputs and establish the foundation

- [x] 1.1 Verify the tracked design contracts, revisions, inventory and paired reference images; ensure `screen-coverage.md` resolves all 53 current states and excludes superseded Stitch frames from acceptance.
- [x] 1.2 Record the current source-check baseline and create disposable test fixtures containing empty/populated collections, long multilingual vocabulary, all category/filter types and a non-null hidden alias. Do not seed production first-run data or reopen the completed migration checklist.
- [x] 1.3 Implement the semantic light/dark theme, spacing, radii and typography tokens in `src/ui/`, with separate decorative and functional outlines; replace the existing three-color assumptions without changing persistence.
- [x] 1.4 Bundle approved font weights, required icon assets and license notices, implement typed icon/typography components and script fallback, and verify no runtime asset download is required.
- [x] 1.5 Coordinate fonts, database/preferences readiness and splash/chrome appearance in the existing root/bootstrap path; provide safe startup/font-failure recovery without resetting data or flashing unthemed application content.

## 2. Build the shared native interaction layer

- [x] 2.1 Implement themed action/icon buttons, persistent-label fields, radio/segmented controls, typed category chips and accessible empty/error/feedback components, including disabled/busy and first-invalid-field behavior.
- [x] 2.2 Implement screen/app-bar/scroll-footer layout primitives with one header, safe-area/gesture/keyboard inset ownership, logical spacing and full-height/scrolling fallback for narrow screens and enlarged text.
- [x] 2.3 Implement the shared sheet/dialog lifecycle and integrate the unsaved guard: one visible overlay, parent-owned drafts, Android Back ordering, modal focus containment/restoration and confirmed continuation of the attempted route exit.
- [x] 2.4 Refactor `EmojiControl` around pending selection and Apply/Cancel, retaining Jetpack categories/variants, full Unicode strings, locale/theme updates and parent drafts. Omit the unsupported mockup search control and document this native adaptation.
- [x] 2.5 Add focused component coverage for overlay cancellation/focus, duplicate-action prevention, validation announcements and pending emoji Apply/Cancel; adapt existing native-picker/theme tests to the new boundaries.

## 3. Implement the four-page introduction

- [x] 3.1 Implement the four themed/localizable onboarding pages and progress using supported vocabulary fields only, with no phonetic metadata.
- [x] 3.2 Add one bounded transition controller for leftward-next/rightward-back swipes and equivalent buttons, persist completed steps and preserve native edge Back/vertical scrolling and reduced-motion behavior.
- [x] 3.3 Implement Get started choices, final-page create/restore/skip actions and coherent cancel/restart/restore-completion navigation without placeholder records.
- [x] 3.4 Cover gesture direction, bounds, canceled drags, resumed progress and shortcut/canceled-first-form paths with focused interaction tests and update the relevant first-run Maestro flow.

## 4. Implement collection home and editors

- [x] 4.1 Add a grouped collection-summary count query and build populated, empty, loading and read-error home states with Settings/Create actions and real count refresh after term writes/restore.
- [x] 4.2 Build the name/emoji-only collection create/edit/validation form; remove alias inputs/state/dirty checks and all displayed collection subtitles while passing existing hidden alias values through on edits and using null on creation.
- [x] 4.3 Implement collection contextual actions and the named deletion confirmation; retain existing atomic cascade, selected-collection reconciliation and recoverable failure behavior.
- [x] 4.4 Integrate Keep editing/Discard with collection edits and picker transitions; cover clean exits, save success/failure and draft preservation.
- [x] 4.5 Extend collection/repository/backup tests for accurate counts and preservation of a non-null hidden alias through rename/icon editing and supported export/restore, and update collection Maestro selectors/actions.

## 5. Implement vocabulary reading, terms and daily discovery

- [x] 5.1 Extract vocabulary feature composition from `src/app/collection/[id].tsx` and implement virtualized compact/detailed rows, complete wrapping, independent row overflow and the count-only compact footer.
- [x] 5.2 Implement prominent search, visible query/display summaries and separate empty-collection/no-results/loading/read-error states with explicit Clear search & filters behavior using the existing query semantics.
- [x] 5.3 Implement collection tools and navigation to categories, daily word, collection editing and the PDF scope flow while retaining the bottom Add term action.
- [x] 5.4 Implement full term details, contextual edit/delete actions, named deletion confirmation and failure retention, hiding empty optional sections and all invented pronunciation metadata.
- [x] 5.5 Implement comfortable add/edit term forms with separate required-field errors, optional notes and both category groups; commit once and retain drafts on storage failure.
- [x] 5.6 Preserve term drafts while visiting category management, reconcile changed/deleted category IDs on return, and integrate dirty Back/Close confirmations without remounting on repository refresh.
- [x] 5.7 Implement the daily-word and insufficient-terms views using the existing stable local-day service, real missing-term count and Open term navigation.
- [x] 5.8 Extend component/native flows for validation, complete text wrapping, collection isolation, contextual deletion/cancel/failure, category subflow draft return, no-results reset and daily reuse/threshold presentation.

## 6. Implement category and filter workflows

- [x] 6.1 Build collection-scoped category lists grouped into Grammatical/Thematic with typed icons and the dedicated empty state.
- [x] 6.2 Build category create/edit/validation sheets with type selection only on creation, preserved parent drafts and existing ownership/rename semantics.
- [x] 6.3 Implement category deletion confirmation, failure feedback and reconciliation of term/filter/applied/draft references while retaining terms and saved-filter records.
- [x] 6.4 Implement a collection-scoped controller separating applied search/categories/filter identity from pending sheet categories/display, with live result counts from `queryTerms` and Apply/Cancel semantics.
- [x] 6.5 Implement Categories/Display/Saved tabs, category-only clearing, all sort fields/directions and density controls; wire committed app-wide display choices to existing preferences and retain the sheet/draft on failed writes.
- [x] 6.6 Implement saved-filter populated/empty states with criterion summaries, applied identity and immediate saved-filter application that retains committed display choices and discards unrelated pending display edits.
- [x] 6.7 Implement Save filter naming/validation and shared emoji subflow; save the displayed search/pending categories only, return to the retained parent draft and avoid implicitly applying it.
- [x] 6.8 Implement saved-filter deletion confirmation, query-preserving deletion of the active filter, badge detachment on criterion edits and collection-switch resets without resetting global display preferences.
- [x] 6.9 Extend behavior tests and categories/filters Maestro flows for staged cancellation, cross-tab/child draft survival, preference restart persistence, saved intent versus display, and deleted-category/filter reconciliation.

## 7. Implement settings and interface localization

- [x] 7.1 Build Settings with immediate System/English/Español and System/Light/Dark choices, truthful selected-state previews and Backups navigation; preserve vocabulary content and follow subsequent system-appearance changes.
- [x] 7.2 Complete English/Spanish copy, accessibility labels, plural counts, date formatting, direction labels and plain-language errors across the new features; extend resource-parity and preference integration checks.

## 8. Implement preview-free PDF preparation and sharing

- [x] 8.1 Split local PDF preparation from native sharing, define prepared-file/snapshot types, add compact/detailed renderer options with detailed default, and retain complete-result selection, escaping and offline resource behavior.
- [x] 8.2 Implement the scope sheet without any page preview/thumbnail, preparation/busy, ready/share/save/done and recoverable failure states, freezing query/order/density/title/locale and preventing concurrent operations.
- [x] 8.3 Implement prepared-file availability/cleanup, share retry and dismissal handling without claiming verified destination storage or regenerating a different result set silently.
- [x] 8.4 Extend renderer/file-flow tests for compact/detailed content, all matching rows, captured-scope stability, escaping, generation/share failures and duplicate taps; update the real Android PDF handoff check and inspect generated multi-page output.

## 9. Implement backups and restore presentation

- [x] 9.1 Split snapshot-file creation from sharing and build backup home/export-ready states with real filename/counts, guarded actions, truthful handoff feedback and supported version-1 payloads unchanged.
- [x] 9.2 Extend selection results/errors with selected-file metadata and build validated preview plus invalid/unsupported/oversized/read-error recovery, preserving picker-cancel behavior and optional Export current data first with the pending restore candidate retained.
- [x] 9.3 Implement the final named replacement confirmation and a painted restoring state before the existing synchronous transaction, guarding Back/repeat actions without promising cancellation or numeric progress after writes begin.
- [x] 9.4 Implement success navigation/query reset/restored preferences and explicit onboarding completion, and distinguish rollback failure from post-commit refresh failure with accurate retry/choose-another/cancel or refresh/restart recovery.
- [x] 9.5 Extend backup/file/interaction tests and existing Maestro restore/export/rejection flows for cancellation, filename/count preview, hidden-alias round trip, rollback, optional pre-restore export, duplicate operations and restored preference/route refresh.

## 10. Complete native acceptance and handoff

- [x] 10.1 Update affected Maestro flows to stable semantic labels/test IDs and deterministic disposable fixtures; provide controlled test-only fault states for recovery visual review without exposing them in the shipping app or modifying real user data.
- [x] 10.2 Run lint, format check, typecheck and the Jest suite; resolve regressions introduced by the changed theme, confirmation, route, query and platform boundaries.
- [x] 10.3 Build a fresh standalone Android artifact using the repository's pinned toolchain and record the artifact/build result; do not claim a hosted CI or physical-device result from local emulator checks.
- [x] 10.4 Review/capture onboarding, collection home/actions/editors and picker states against both appearances; record states 01–13 and 53 and resolve substantive visual/interaction differences.
- [x] 10.5 Review/capture vocabulary, term and daily states against both appearances; record states 14–18, 28–35 and 42–43, including wrapping and no alias/IPA/storage-copy regressions.
- [x] 10.6 Review/capture category/filter/save-filter states against both appearances; record states 21–27, 36–41 and native picker adaptations, including pending-selection and cancellation behavior.
- [x] 10.7 Review/capture Settings, PDF and backup states against both appearances; record states 19–20 and 44–52, distinguishing real I/O from controlled fault-state evidence and retaining the preview-free PDF design.
- [x] 10.8 Skipped by priority: spoken TalkBack announcement review is deferred; focus navigation and UI-tree checks are documented in `verification.md`.
- [x] 10.9 Run affected standalone Maestro flows and airplane-mode cold-start/restart acceptance without Metro for typography, picker, collection/term/category/filter use, daily reuse, backup export/restore/rejection and PDF sharing; keep all fixture operations isolated from user data.
- [x] 10.10 Write `verification.md` with command/device results, paired-state evidence, implemented native adaptations and any genuine remaining limits; check every row in `screen-coverage.md`, update runtime/setup documentation as needed and mark tasks complete only with corresponding implementation/evidence.
