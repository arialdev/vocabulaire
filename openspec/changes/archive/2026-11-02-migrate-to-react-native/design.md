## Context

The repository contains an Angular 13 / Ionic 6 / Capacitor 3 application with Cordova storage, PDF, and orientation plugins. Vocabulary is represented by mutable class graphs embedded in a `collections` storage value; mutations commonly deserialize and rewrite the complete graph. Categories are copied into terms and filters, which complicates renaming and ownership checks. The custom emoji picker renders a category's entire PNG grid; 1,239 PNGs and supporting assets occupy approximately 6.3 MB. These observations motivate a redesign rather than a component-by-component translation; they are not runtime profiling results.

Existing behavior includes collections, translated terms and notes, two category types, text/category filtering and sorting, compact/detailed views, saved filters called tags, daily vocabulary, JSON backup/restore, PDF export, onboarding, appearance settings, and interface translations. The user explicitly selected a fresh start for stored data, English/Spanish for the interface, and deferral of recording and AI. Android is mandatory; iOS and web are future opportunities.

The proposal phase changes only OpenSpec artifacts. The version research below is metadata/documentation research, not proof that an application has already built or passed tests.

## Goals / Non-Goals

**Goals:**

- Replace the legacy runtime with a maintainable React Native app that retains the approved user capabilities.
- Keep vocabulary content unrestricted by language and all retained functionality available offline.
- Use the user's approved tools with the newest stable versions that actually work together.
- Normalize persistence, centralize query semantics, and isolate native functionality from domain/UI code.
- Provide a direct Android emoji picker without maintaining an image catalogue.
- Produce a reproducible Android build, meaningful automated checks, and documented native verification.

**Non-Goals:**

- Automatic migration of the old Android database, import of Ionic JSON exports, or backwards compatibility with the legacy backup format.
- Recording, microphone access, speech recognition, pronunciation assessment, AI models, or speculative audio schema/UI.
- Authentication, synchronization, a backend, analytics, advertisements, or mandatory cloud/build services.
- Pixel-for-pixel recreation of the Ionic screens or preservation of implementation bugs, arbitrary short text limits, or the old six-slot tag layout.
- iOS/web release parity, app-store submission, or production signing configuration.

## Decisions

### 1. Approved stack and version policy

The confirmed stack is:

| Area | Decision | Rationale / alternative considered |
| --- | --- | --- |
| Application | React Native, Expo development builds, Expo Router | Familiar React/TypeScript model with native extensions; bare React Native would require more manual integration. |
| Package management | pnpm, one application and lockfile | User requirement; no permanent dual-stack workspace or unnecessary monorepo tooling. |
| Language | Strict TypeScript | User requirement; domain and I/O boundaries use typed values and runtime validation. |
| Lint / format | Oxlint / Oxfmt | User selected both; do not retain ESLint as a second linter or silently add a second formatter. |
| UI / state / forms | React Native components and StyleSheet, React hooks/context, controlled forms and TypeScript validation | User approved the built-in approach; no UI kit, Redux/Zustand, form framework, or schema validation library. |
| Persistence | Expo SQLite, Drizzle ORM, Drizzle Kit, bundled SQL migrations | User selected Drizzle over direct SQL; schema/query types justify the additional tooling. |
| Native picker | Jetpack Emoji Picker through a local Expo module written in Kotlin | User selected direct native picking over keyboard switching or a shared JavaScript picker library. |
| Localization | expo-localization, i18next, react-i18next | User selected this combination; English and Spanish assets ship in the binary. |
| PDF / files | expo-print, expo-file-system, expo-sharing, expo-document-picker | User approved these modules to replace Cordova PDF and browser-based file access. |
| Unit / component tests | Jest, jest-expo, React Native Testing Library, matching Test Renderer | User ultimately selected Jest after considering Vitest community integrations. Do not introduce Vitest or its adapters in this change. |
| Native end-to-end tests | Maestro | User approved critical Android flow automation. |
| Builds / CI | Local Android builds and the existing GitHub Actions service | No EAS dependency or new hosted service. Keep framework-owned Metro/Babel/native build tooling coordinated with Expo. |

At the beginning of implementation, resolve versions from official release information and package metadata again. "Latest compatible" means stable releases, no unsatisfied nonoptional peer requirements, framework-compatible React/renderer versions, correct native toolchain support, and passing quality/native build checks. A package's `latest` tag alone is not sufficient proof. Direct package versions and pnpm are pinned; `pnpm-lock.yaml` fixes the dependency graph. Use project-local mise configuration for reproducible Node/JDK selection, without changing global personal defaults.

Research snapshot on **2026-10-28**:

| Tool / package | Current stable candidate or coordinated baseline |
| --- | --- |
| Node.js | 26.12.1 (current latest stable/LTS; installed 24.16.0 also meets the framework floor) |
| pnpm | 12.16.1 |
| Expo / Expo default template | 58.0.21 / 58.0.30 |
| React Native | 0.88.1 |
| React / React types | Template-coordinated React 19.3.0 and @types/react 19.3.0; independently published React is 19.3.1, so verify the native renderer's exact requirement before changing the template's pairing |
| TypeScript | 7.0.2; Expo's template still requests ~6.0.3, so explicitly validate 7 rather than assuming the template version is the newest compatible release |
| Oxlint / Oxfmt | 1.90.0 / 0.75.0 |
| Expo Router / development client | 58.0.28 / 58.0.17 |
| Expo SQLite | 58.0.14 |
| Drizzle ORM / Kit | 0.45.4 / 0.31.11 (stable tags; do not copy the documentation's v1 release-candidate install commands blindly) |
| SQL bundling helper | babel-plugin-inline-import 3.0.0, integrated with Expo's existing Babel configuration |
| Expo Print / FileSystem | 58.0.8 / 58.0.13 |
| Expo Sharing / DocumentPicker | 58.0.21 / 58.0.4 |
| Expo Localization | 58.0.5 |
| i18next / react-i18next | 26.5.11 / 17.1.9 |
| Jest / jest-expo | 30.5.2 / 58.0.13 |
| React Native Testing Library / Test Renderer | 14.1.0 / 1.3.1; confirm the renderer's React minor compatibility |
| React Native test preset | @react-native/jest-preset 0.88.1 as required by jest-expo |
| Maestro CLI | 2.12.0 |
| Jetpack Emoji2 release family | 1.7.0; verify the exact emoji picker artifact/version against Google Maven before pinning |
| Android compile / target SDK | Expo 58 documents compile SDK 37 / target SDK 36; these are different from the emulator's runtime API |
| Gradle / AGP / Kotlin / JDK | Resolve against Expo's generated native template. Use the newest stable compatible JDK/build-tool combination; the previously configured JDK 17 is an available fallback baseline, not a reason to skip checking newer compatible JDKs. Do not independently upgrade the Gradle wrapper past framework/plugin support. |

TypeScript 7 support, React/renderer patch pairing, Drizzle's stable adapter with Expo 58, and the native toolchain must be checked in the foundation stage before feature work. Keep `tsc --noEmit` separate from Oxlint; type-aware Oxlint tooling was not selected and is not required. Enable Oxlint's applicable TypeScript and React/hooks rules; DOM-specific accessibility rules cannot replace Android accessibility checks.

Use pnpm for scaffold/dependency/scripts, with Expo's version-aware installer for framework packages. Keep the default pnpm isolated installation unless a real dependency compatibility problem is demonstrated; document and discuss a required installation-strategy change instead of preemptively hoisting everything. Any new substantive stack dependency, substitution, prerelease requirement, or unresolved compatibility compromise goes back to the user.

### 2. One application with feature and platform boundaries

Use a single root Expo application, not a permanent Angular/React Native workspace. Organize by feature, with thin file-based routes and shared typed domain/persistence/platform modules:

```text
src/app/                 Expo Router routes and layouts
src/features/            collection, term, category, filter, daily-word, settings screens
src/domain/              typed records, validation, query/selection policies
src/data/                Drizzle schema, migrations, repositories, initialization
src/platform/            PDF, backup file/share/document integrations
src/i18n/                English/Spanish resources and locale setup
src/ui/                  small reusable native controls, themes, empty/error states
modules/emoji-picker/    local Expo module: Kotlin view + typed TypeScript boundary
drizzle/                 generated SQL migrations bundled in the app
.maestro/                critical Android flows
```

These are ownership boundaries, not a requirement to create generic repositories, dependency-injection frameworks, or one abstraction per function. Plain records and focused functions replace the mutable class graph and Angular services. Route parameters carry IDs, not serialized mutable record objects. Screens hold drafts and view state; repositories own durable writes. React context provides initialized application services/preferences rather than mirroring the complete database in a global state store. Mutations refresh relevant queries; Drizzle live queries can be used where they simplify updates using the already selected driver.

Navigation includes onboarding/empty states, collection selection, the selected collection's term list, term details/editor, category management, saved filters, daily word, and settings. Preserve compact/detailed lists and sort choices, while removing layout-driven caps and fragile router state dependencies. A deleted active collection selects a remaining collection or the empty state after confirmed atomic deletion.

**Alternative:** transplanting the existing services and classes would retain framework assumptions, copied category state, whole-dataset writes, and subscription lifecycles. The new design retains behavior and centralizes invariants instead.

### 3. Normalized SQLite schema and migration lifecycle

Open a new application-specific database filename, separate from Ionic's storage. Enable foreign keys; initialize and apply bundled Drizzle migrations before showing data-dependent routes. A migration error leaves the database intact and opens a retry/error state. Do not clear/recreate a database on a failed query. Use the stable Drizzle Expo adapter and keep transaction callbacks consistent with that driver's supported synchronous/asynchronous behavior.

Proposed relational model:

| Table | Essential fields / constraints |
| --- | --- |
| `collections` | Stable generated integer ID, display name, optional short label, Unicode emoji, creation/update timestamps |
| `terms` | Stable generated integer ID, owning collection ID, original expression, translation, notes, creation/update timestamps |
| `categories` | Stable ID, collection ID, `grammatical` or `thematic` kind, display name |
| `term_categories` | Collection ID, term ID, category ID; unique assignment and ownership constraints |
| `saved_filters` | Stable ID, collection ID, name, Unicode emoji, text-search criterion |
| `saved_filter_categories` | Collection ID, saved-filter ID, category ID; unique criterion and ownership constraints |
| `daily_picks` | Unique collection/local-date pair, referenced term ID, selection timestamp; prior rows supply recent history |
| `preferences` | Typed singleton preference record: interface locale override, appearance, onboarding state, selected collection ID, relevant display preferences |

Use indexed collection foreign keys and stable IDs as tie-breakers. Ownership checks apply at service/import boundaries and through appropriate composite foreign keys/constraints; a category from another collection can never be assigned just because its ID exists. Category names are not copied into term/filter records. Renames update one row, deletions remove join references, and terms retain their other assignments.

Integer IDs suffice for a local single-user application and do not introduce a UUID package; future attachments can reference `terms.id`. Whole-dataset restore preserves backed-up IDs and reseeds allocation appropriately. Cloud synchronization IDs and audio tables are deferred until their actual requirements exist.

Schema evolution uses checked-in Drizzle Kit migrations bundled as local SQL assets. The SQL bundling helper extends, rather than replaces, Expo's Babel setup. Avoid executing desktop migration commands against an imagined on-device database. Keep startup migration readiness observable, serialize competing initialization, and make multi-record writes transactional.

**Alternative:** storing a complete JSON tree in SQLite would use the new storage engine without resolving duplicated references or collection-wide rewrite costs.

### 4. Shared query and daily-word policies

Text/category filtering is defined once and used by list queries, saved filters, and PDF exports. Normalize both sides for case and Latin accent-insensitive matching while preserving stored spellings. Any selected category matches within one kind; nonempty grammatical and thematic groups are ANDed with each other and with text search. No selected categories means no category restriction. Existing boolean/category class plumbing is replaced by selected category IDs; exclusions are not a new feature in this change.

Sort by original expression, translation, or modification time, with reversible direction and stable ID tie-breakers. Use locale-aware text comparison where appropriate; do not rely on SQLite's ASCII-only `NOCASE` as a complete multilingual search implementation. For ordinary local vocabulary sizes, normalized matching outside SQLite is acceptable behind a query boundary. Use `FlatList` for rendering and verify representative large collections; introduce a different indexing/search engine only after evidence and user discussion.

Daily selection first checks the minimum five terms, then looks up the current collection/local-date record. If a valid pick exists, reuse its ID. Otherwise choose from terms outside the three most recent prior picks when possible; use the eligible set's length for random indexing. Persist under a unique collection/date constraint and reread the winning row if competing requests occur. Store references, not embedded term copies. Deleting today's term permits a replacement if the collection still qualifies. Inject clock/random inputs into the domain policy for meaningful deterministic tests; keep calendar-date interpretation local rather than accidentally deriving the day from UTC.

### 5. Jetpack picker as a local Expo native view

Implement a small Kotlin Expo module that hosts `EmojiPickerView`, exposes selected Unicode strings, and provides dismissal/selection events to a reusable React icon control. Store module source, metadata, and Maven dependencies in the local module, so Expo native generation/autolinking includes it without manual edits to disposable generated files. Use stable Expo Modules APIs, not the SDK 58 Modules 2.0 beta.

Opening the control displays an app-owned native picker, not the selected keyboard's internal emoji panel. Selection updates only the form draft. Android Back and dismissal preserve the current value. Respect appearance and accessibility. Confirm first-launch offline operation, including library font/EmojiCompat behavior; newer emoji availability depends on device rendering support, but basic selection must not require a font download. Preserve compound sequences without `maxLength={1}` or code-unit slicing. The native picker supplies valid selections; no extra emoji-validation dependency is needed.

The shared TypeScript interface isolates Android imports. Non-Android entry points must not try loading an absent Android view. Future iOS/web adapters can implement the interface; their native picker implementations and release verification are not part of this change. Do not add a second picker library now.

**Alternatives:** ordinary keyboard emoji entry needs an extra user-controlled panel switch; a shared Unicode picker would require selecting/maintaining another component/data source. The user chose the Jetpack integration despite the small Android-native maintenance obligation.

### 6. Fresh-start backups with transactional replacement

The new database does not inspect or delete legacy Ionic storage. New exports use a documented format, for example `format: "vocabulaire"`, `schemaVersion: 1`, export time, and explicit records/preferences. The JSON schema is a portable data contract, not a dump of Drizzle internals or class-private fields. No legacy PNG mapping or old database/JSON adapter is included.

Use a consistent read snapshot for export. Validate parsed data as `unknown` with typed functions, including unique IDs, required fields, valid category kinds, dates, references, collection ownership, and supported preference values. Plain JSON syntax validity is insufficient. Unsupported versions and legacy-shaped files fail before writes. Show a preview/count summary, offer a current-data export, explain replacement, and require explicit confirmation. This is restore-by-replacement, not an implicit merge.

Read and validate the file before entering the write transaction. Restore the complete graph in foreign-key-safe order in one transaction; an exception rolls everything back. On success, refresh preferences/query state and reset navigation to a valid destination. Document reasonable import resource limits if needed rather than silently truncating content. File picker/share cancellation is a normal result, not an error. Temporary files use generated safe paths and can be cleaned without touching user-selected source files.

**Alternative:** automatic Android migration would need the old driver/database layout, identity/signing continuity, and real upgrade fixtures. The user explicitly selected a fresh start rather than paying that complexity now. JSON files from this new format remain restorable across future schema versions through deliberate versioned migrations.

### 7. Local PDF, interface localization, and mobile UX

Use Expo Print to generate a local PDF from escaped HTML and Expo Sharing for the Android share/save flow. Export all query results, not only mounted list rows. Document formatting is newly designed for readability: collection/filter heading, bilingual vocabulary fields, categories, notes, wrapping, and sensible pagination. Treat all vocabulary as text; escape markup. Use local/system resources, verify non-Latin script rendering and emoji/font behavior on Android, and always include a text title so a decorative icon is not essential to understanding the document.

Use Expo FileSystem's current API, DocumentPicker, and Sharing for backups, with focused adapters for native results/errors. SDK 58 changes include asynchronous `File.write()`; do not copy older examples without checking the current API.

Bundle English/Spanish resources and initialize i18next before main screens. Resolve supported device language on first launch, fall back to English, and persist explicit overrides independently from collection language. Reuse appropriate existing translation text while adapting obsolete Ionic bindings/interpolation. Remove French/Italian interface resources/options; keep user vocabulary unrestricted. Light/dark/system appearance uses shared tokens and persists in preferences. Onboarding introduces collections, terms, categories/filters, and offline export; it remains resumable and does not require recreating the old Swiper tutorial.

Accessibility, text scaling, keyboard avoidance, Android Back, form discard decisions, and distinct loading/empty/error states are acceptance behavior. They do not require an additional UI library.

### 8. Testing and delivery boundaries

Use Jest 30 with the matching Expo preset, React Native Testing Library 14, matching Test Renderer, and the React Native test preset required by Expo 58. Add only tests that protect behavior: collection ownership, validation, query equivalence, daily selection/date handling, backup graph validation/rollback, PDF text escaping, and important form/navigation interactions. Use native adapters with explicit test doubles; mocks do not verify SQLite durability, Jetpack rendering, or real PDF layout.

Maestro covers first-run creation, term/category/filter flows, restart persistence, native picker interaction/dismissal, and key preference/navigation behavior. Native database migration/restore and PDF generation/sharing additionally receive Android verification with recorded results. Confirm Maestro works with the selected emulator API; if the current API 37 image is not supported, select the newest stable runtime image supported by Maestro without confusing emulator API with compile SDK.

Verify offline behavior with a standalone build containing its JavaScript bundle, rather than concluding it works from a development build that requires Metro. Produce a local Android artifact and record the command/environment. GitHub Actions uses pinned compatible Node/pnpm/JDK, frozen installation, type/lint/format/tests, and native build/smoke coverage as practical. Update existing Sonar configuration/coverage paths if retaining its established check; do not invent new service accounts or secret dependencies. Local development and acceptance must remain possible without EAS or a paid service.

## Risks / Trade-offs

- **Latest template defaults lag current releases** → Validate TypeScript 7, React/renderer patch compatibility, stable Drizzle, and the native toolchain before feature work; record evidence and raise unresolved changes with the user.
- **A direct native picker adds Kotlin maintenance** → Keep the module small, use documented stable APIs, prove clean native regeneration, and verify its Android lifecycle on device.
- **Emoji font behavior varies by Android version** → Verify first-launch offline rendering and compound selections; do not promise every newly introduced emoji on every old device.
- **Fresh start breaks legacy data continuity** → State the boundary in README/onboarding/restore errors; use a separate database and reject unsupported old backups without mutations.
- **Restore is destructive after confirmation** → Offer a current-data backup, validate the entire graph first, replace transactionally, and test failure/cancellation paths.
- **Native mocks can hide real integration failures** → Require standalone Android/offline checks, Maestro flows, persistent database restart checks, and visual PDF inspection.
- **Jest/Expo/React renderer versions are coupled** → Pin a verified set and include a component/navigation smoke test in the foundation stage.
- **Maestro documentation and newest emulator support may diverge** → Test the actual CLI/runtime pair and document a supported image instead of marking an unrun flow as passed.
- **Multilingual search and PDF fonts have script-specific limits** → Preserve original Unicode, test representative Latin/non-Latin samples, and document actual device limitations rather than claiming universal linguistic correctness.
- **Removing legacy tooling early can hide missing features** → Complete an explicit capability checklist and Android verification before final cleanup.

## Migration Plan

1. Resolve and pin the latest compatible toolchain; establish a small Expo Android foundation with quality scripts, Jest/component smoke checks, bundled Drizzle migrations, and the local native module.
2. Implement the normalized data model and vertical collection/term flow, followed by categories, queries, saved filters, and daily-word behavior.
3. Complete the native picker, English/Spanish UX, settings/onboarding, new-format backups, and PDF export.
4. Verify native lifecycle, transaction/restore behavior, Unicode handling, offline standalone operation, and the retained capability checklist. Run meaningful automated checks and native build/Maestro checks.
5. Retire the old source/config/dependencies/assets, refresh root scripts/CI/docs, and rerun checks against the final single-app tree. Preserve OpenSpec and unrelated user changes. Git history is the legacy source reference; no generated app tree needs to be copied into an archive folder.

This change prepares a local build; it does not publish a store release. Code rollback uses version control. New database migrations are forward-versioned; maintain a new-format export before destructive schema changes. A schema/data-format change that requires additional migration design must be handled explicitly rather than reusing the fresh-start exception to clear future user data.

## Open Questions

No product or substantive stack choices remain pending. Exact compatibility/build checks are execution tasks, not a claim of completed implementation: TypeScript 7 and compiler configuration; React/renderer patch pairing; generated Gradle/AGP/Kotlin/JDK versions; stable Drizzle migration bundling; exact Google Maven picker artifact; Maestro/emulator pairing; and Android PDF Unicode rendering. If verification requires a new stack choice, prerelease, or unresolved downgrade, prompt the user before adopting it.

## Research References

Version metadata was queried from the npm registry on 2026-10-28 for the package candidates above. Primary documentation supporting the design:

- [Expo SDK 58 release](https://expo.dev/changelog/sdk-58) and [SDK compatibility reference](https://docs.expo.dev/versions/v58.0.0/).
- [Expo native customization](https://docs.expo.dev/workflow/customizing/) and [pnpm/isolated dependency support](https://docs.expo.dev/guides/monorepos/).
- [Drizzle Expo SQLite adapter and bundled migrations](https://orm.drizzle.team/docs/connect-expo-sqlite); verify examples against the stable release because current documentation includes release-candidate instructions.
- [Expo Jest and Testing Library setup](https://docs.expo.dev/develop/unit-testing/) and [Router testing](https://docs.expo.dev/router/reference/testing/).
- [Jetpack Emoji2 release notes](https://developer.android.com/jetpack/androidx/releases/emoji2).
- [Expo Print](https://docs.expo.dev/versions/latest/sdk/print/), [SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/), and [localization](https://docs.expo.dev/guides/localization/).
- [Oxlint React/TypeScript plugins](https://oxc.rs/docs/guide/usage/linter/plugins) and [Oxfmt](https://oxc.rs/docs/guide/usage/formatter/quickstart.html).
- [Maestro CLI 2.12.0](https://github.com/mobile-dev-inc/Maestro/releases/tag/cli-2.12.0), [Node releases](https://nodejs.org/en/about/previous-releases), and [Gradle Java compatibility](https://docs.gradle.org/current/userguide/compatibility.html).
