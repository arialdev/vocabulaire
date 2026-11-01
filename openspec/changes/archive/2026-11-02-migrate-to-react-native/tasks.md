## 1. Resolve versions and establish the native foundation

- [x] 1.1 Recheck current stable releases and resolve the latest compatible Node/pnpm/Expo/React Native/React/TypeScript/Jest/native-toolchain matrix; record exact versions, peer constraints, and evidence. Validate TypeScript 7 and React/renderer patch pairing rather than blindly copying template defaults. Ask the user before a substantive stack change, prerelease, or unresolved compatibility compromise.
- [x] 1.2 Establish a single root TypeScript Expo application with Expo Router and a development client, preserving `dev.arial.vocabulaire` and the app's identity. Stage the source transition so legacy behavior remains available for reference until final cleanup, without committing a permanent second app or overwriting unrelated user changes.
- [x] 1.3 Configure project-local mise tools, the pinned pnpm packageManager/engine policy, strict TypeScript, explicit approved dependencies, and a reproducible `pnpm-lock.yaml`; prove a frozen installation works with the selected dependency layout.
- [x] 1.4 Configure Oxlint's applicable TypeScript/React/hooks checks and Oxfmt, with consistent `lint`, `format`, `format:check`, and `typecheck` scripts; remove inherited ESLint/second-formatter setup from the new scaffold.
- [x] 1.5 Configure matching Jest, jest-expo, React Native Testing Library, Test Renderer, and React Native test preset versions; pass a real component interaction and Router navigation smoke test before expanding the test suite.
- [x] 1.6 Generate and build the initial Android app locally, verify its native toolchain and framework dependency checks, and document the exact successful commands before feature work.

## 2. Introduce normalized offline persistence

- [x] 2.1 Define typed records and the Drizzle schema for collections, terms, categories, category assignments, saved filters/criteria, daily picks, and preferences, including stable IDs, timestamps, indexes, and collection-ownership constraints.
- [x] 2.2 Generate and check in the initial Drizzle Kit migrations, integrate SQL bundling with Expo's Babel configuration, and initialize a distinctly named database with foreign keys enabled.
- [x] 2.3 Implement serialized database initialization and migration readiness/error handling; ensure initialization never reads/deletes legacy storage or clears a failed database.
- [x] 2.4 Implement focused collection/term repositories with transactional mutations, stable timestamp behavior, selected-collection persistence, and safe dependent-record deletion.
- [x] 2.5 Implement category, saved-filter, daily-pick, and preference persistence with cross-collection reference checks and a small query-refresh/service context boundary.
- [x] 2.6 Verify schema migrations, ownership constraints, transactional rollback, and restart durability against Android SQLite; add meaningful automated tests for domain/persistence boundary behavior that do not mistake mocks for native durability checks.

## 3. Build collection and term workflows

- [x] 3.1 Implement collection list/create/edit/select/delete screens with arbitrary-language names, optional short labels, Unicode icon values, and first/last-collection empty-state handling.
- [x] 3.2 Implement term list/detail/create/edit/delete screens with original expression, translation, notes, category assignments, validation, and stable record-based routes.
- [x] 3.3 Implement one shared text-normalization/filter/sort policy, searching both vocabulary fields and notes, with deterministic sort ties and collection isolation.
- [x] 3.4 Add virtualized compact/detailed term views, loading/no-results/read-error states, and query-preserving view/sort changes; check representative large collections without adding an unapproved list/search library.
- [x] 3.5 Test Unicode content, whitespace-only validation, collection isolation, edit timestamps, confirmed/canceled deletion, missing-record routes, and list/query interactions.

## 4. Retain categories and saved filters

- [x] 4.1 Implement grammatical/thematic category creation, renaming, deletion, and term assignment interfaces using normalized references.
- [x] 4.2 Implement category selection combined with search: OR within a category kind, AND between nonempty kinds, and no restriction for empty kinds.
- [x] 4.3 Implement named saved filters (tags) with Unicode icons, current-query capture, later application, and deletion; avoid the old layout-driven six-slot restriction.
- [x] 4.4 Reconcile deleted category references and collection switches without orphaned assignments, stale applied filters, or implicit edits to saved criteria.
- [x] 4.5 Test shared list/saved-filter result equivalence, category rename/delete behavior, newly matching terms, and cross-collection rejection.

## 5. Retain daily vocabulary practice

- [x] 5.1 Implement the deterministic-testable daily selection policy using local dates, a five-term minimum, three recent prior picks, eligible-set random indexing, and one persisted pick per collection/date.
- [x] 5.2 Implement the daily-word screen, restart-safe reuse, current term content, deleted-term replacement, and clear insufficient-vocabulary feedback.
- [x] 5.3 Test date rollover, same-day reuse, recent avoidance, competing requests, term edits/deletion, and independent collections; verify persistence through an Android restart.

## 6. Integrate the native emoji picker

- [x] 6.1 Resolve the exact latest compatible stable Jetpack Emoji Picker artifact from Google Maven and implement its local Kotlin Expo module with a typed selection/dismissal interface.
- [x] 6.2 Connect collection and saved-filter icon controls to a reusable native picker sheet/modal, with draft-only selection, Android Back/cancel behavior, readable appearance, and accessible labels.
- [x] 6.3 Verify full Unicode sequences including skin tones, flags, and joined emoji; verify first-launch offline rendering and avoid a required remote font download or legacy PNG fallback catalogue.
- [x] 6.4 Regenerate Android native projects from source and prove the module still links and works; add Maestro selection/dismissal coverage and keep Android-only imports isolated from future platforms.

## 7. Complete English/Spanish mobile UX

- [x] 7.1 Integrate expo-localization and i18next/react-i18next with bundled English/Spanish resources, supported-device-language detection, English fallback, and persistent manual overrides.
- [x] 7.2 Adapt retained translation text and interpolation to the redesigned screens, validation messages, errors, confirmations, and export labels; remove French/Italian interface options/resources.
- [x] 7.3 Implement shared light/dark/system appearance tokens and persistent settings, including native picker appearance.
- [x] 7.4 Implement resumable onboarding and collection creation/restore entry points without repeating the old Swiper implementation or repeatedly blocking completed users.
- [x] 7.5 Verify Android Back and unsaved-form discard behavior, keyboard avoidance, enlarged text, small-screen reachability, accessible icon actions, locale switching, and complete English/Spanish strings.

## 8. Add new-format JSON backups and restore

- [x] 8.1 Define and document the new versioned backup contract, including a format identifier, complete records/preferences, stable IDs, and explicit rejection of legacy Ionic exports.
- [x] 8.2 Implement consistent-snapshot export through Expo FileSystem/Sharing and document selection through Expo DocumentPicker using their current SDK APIs.
- [x] 8.3 Implement full runtime graph validation, including identifiers, ownership, category kinds, dates, references, and preferences; reject malformed/unsupported files before writes.
- [x] 8.4 Implement restore preview, replacement confirmation, current-data backup opportunity, transactional replacement/rollback, ID allocation recovery, and complete query/preference/navigation refresh.
- [x] 8.5 Test round trips with Unicode/compound emoji and all record types, corrupt and old-format inputs, invalid ownership/references, cancellation, and rollback; verify actual Android export, selection, replacement, restart, and error behavior.

## 9. Replace Cordova PDF export

- [x] 9.1 Implement escaped HTML document generation from the same collection/saved-filter queries used by the app, including localized labels, translations, notes, and category names.
- [x] 9.2 Integrate Expo Print/FileSystem/Sharing for local PDF generation and the Android share/save flow, including empty-results, cancellation, and failure handling.
- [x] 9.3 Test document content and markup escaping, ensuring exports include all filtered results rather than only mounted list items and never require remote resources.
- [x] 9.4 Generate and visually inspect Android PDFs with multiple pages, long notes, English/Spanish labels, representative non-Latin text, and decorative emoji; correct wrapping/clipping/font issues and record device results.

## 10. Verify, retire legacy tooling, and document delivery

- [x] 10.1 Configure the latest compatible Maestro CLI and supported Android runtime image; automate first-run collection/term/category/filter flows, native emoji selection/cancellation, navigation/preferences, and restart persistence.
- [x] 10.2 Build a standalone Android artifact with embedded JavaScript and verify first-launch/restart operation in airplane mode, including picker, vocabulary, daily word, backups, and PDF generation.
- [x] 10.3 Update GitHub Actions for pinned tools, frozen pnpm installation, lint/format/type/test checks and native build/smoke verification; reconcile the existing Sonar coverage configuration without introducing new hosted-service requirements.
- [x] 10.4 Review every capability spec against the implementation and recorded Android results; resolve missing behavior and report any verification limits accurately before legacy cleanup.
- [x] 10.5 Remove the old Angular/Ionic/Capacitor/Cordova source/config/dependencies, Karma/Cypress build setup, npm lockfile, emoji scraping utilities, PNG catalogue, and unused assets after the replacement has passed its checks; preserve OpenSpec and unrelated files.
- [x] 10.6 Rewrite README/setup/build/test documentation for pnpm, mise, current Android CLI paths, local Expo development builds, the native picker, English/Spanish support, new backups, fresh-start incompatibility, and the deferred iOS/web/audio/AI scope.
- [x] 10.7 Run final frozen installation, framework dependency checks, TypeScript, Oxlint, Oxfmt, Jest, Android build, and Maestro flows against the cleaned single-app tree; record the final resolved version matrix, artifact location, native/manual results, and any remaining limitations.
