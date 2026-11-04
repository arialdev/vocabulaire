## ADDED Requirements

### Requirement: Immediate localized preferences
Settings SHALL offer interface language System/English/Español and appearance System/Light/Dark, visibly identify each selection and persist changes immediately without a Save action. Labels, errors, accessibility text, counts and dates SHALL be localized offline, while stored vocabulary remains unchanged. Settings SHALL provide Backups access without adding accounts or synchronization.

#### Scenario: Select Spanish and system appearance
- **WHEN** the user selects Español and System appearance
- **THEN** visible interface copy changes to Spanish, appearance follows the device and both choices survive restart without rewriting vocabulary

### Requirement: Concise preview-free PDF scope
PDF export SHALL start from a sheet identifying the collection, matching result count, current search/categories and density/order. It SHALL explain that the current result set is exported and provide Create PDF/Cancel. It SHALL NOT contain a page preview, document thumbnail, miniature page, page-format badges or replacement preview control. Empty results SHALL produce an explanation rather than a blank export.

#### Scenario: Inspect a filtered export
- **WHEN** the user opens PDF export with café, Expression and Food & drink selected
- **THEN** the sheet reports those criteria and the real matching count without rendering a sample page

### Requirement: Frozen offline PDF contents
PDF preparation SHALL freeze the applied result set, sort order, density, title/filter identity and interface language, and include every matching term rather than only mounted rows. Compact output SHALL include original expressions/translations; detailed output SHALL additionally include available notes/categories. Markup-like vocabulary SHALL be escaped, supported Unicode text SHALL wrap readably over pages and resources SHALL be local. The renderer's omitted-layout default SHALL retain its previous detailed behavior for existing callers.

#### Scenario: Export compact results in airplane mode
- **WHEN** the user prepares a compact PDF without a connection
- **THEN** all captured matching expressions/translations are present in captured order, notes/categories are omitted and no remote resource is requested

#### Scenario: Vocabulary changes after preparation
- **WHEN** data or the active query changes after the PDF is prepared
- **THEN** sharing the prepared file uses its original disclosed snapshot rather than silently regenerating different contents

### Requirement: Prepared-file sharing and truthful outcomes
PDF and backup export SHALL distinguish preparation, ready, sharing and recoverable errors. Ready SHALL expose the actual filename/summary and Share or save/Done actions. Repeated taps SHALL NOT create concurrent generation/share operations. Share retry SHALL reuse a still-available prepared file; missing/expired temporary files SHALL be recoverable. Native cancellation SHALL NOT be presented as data loss or a failed notebook write, and OS handoff SHALL NOT be claimed as verified successful storage.

#### Scenario: Share fails after successful generation
- **WHEN** a prepared PDF cannot open its native share/save handoff
- **THEN** the ready file and scope remain available with retry/recovery rather than clearing the notebook or claiming the export was saved

### Requirement: Compatible complete backup export
Backup export SHALL prepare a consistent snapshot including all current record types and preferences, and expose the file through the ready/share workflow. The add-term-pronunciation-audio change defines version 2 and version 1 restore compatibility. Hidden stored aliases and Unicode sequences SHALL round-trip without reappearing as collection UI fields. Temporary files SHALL be application-controlled and no network connection SHALL be required.

#### Scenario: Export a hidden alias
- **WHEN** a collection imported with `shortLabel: "FR"` is renamed through the simplified editor and backed up
- **THEN** the backup retains the hidden value alongside the edited name and all related records

### Requirement: Validated named restore preview
Selecting a backup SHALL retain its display filename and validate the current format, version, field/reference ownership and size limit before enabling restore confirmation. A valid preview SHALL show the actual export date and counts of collections, terms, categories and saved filters, clearly state that restoration replaces all current data and offer Choose another file/Cancel restore. Export current data first SHALL be optional and SHALL preserve the pending restore candidate while its export workflow is visited.

#### Scenario: Export current data before replacement
- **WHEN** the user follows Export current data first from a valid preview and then returns
- **THEN** the same validated restore candidate/counts are still available and no replacement has occurred

#### Scenario: Choose an unsupported or malformed file
- **WHEN** a newly selected backup is unsupported, malformed, oversized or has invalid references
- **THEN** no notebook write occurs, confirmation for that candidate is unavailable and plain-language recovery offers choosing another file without inventing a format number or failure cause

#### Scenario: Cancel the native document picker
- **WHEN** the picker is canceled
- **THEN** the previous usable backup state returns without an error message or notebook change

### Requirement: Confirmed atomic restore lifecycle
Only a final named Replace all data confirmation SHALL start replacement. The restoring state SHALL be visible before the transaction begins, guard duplicate actions and avoid fake percentages or a cancellation promise during replacement. Existing transactional rollback SHALL be retained. Success SHALL invalidate stale UI state, honor restored locale/appearance/display preferences, complete the explicit onboarding transition when applicable and replace the stack with a valid home plus accurate feedback.

#### Scenario: Cancel the final confirmation
- **WHEN** the user cancels Replace all data
- **THEN** the current notebook/preferences remain unchanged and the validated preview remains usable

#### Scenario: Successful replacement
- **WHEN** the transaction succeeds
- **THEN** the home shows restored collections/counts, old query/draft identities are cleared and restored preferences are reflected without stale routes

### Requirement: Accurate restore failure recovery
Transaction failure SHALL report that the previous data was kept only when rollback preserved it, retain recovery actions and never announce success. A failure after a completed commit during UI refresh/navigation SHALL instead explain that restoration occurred and provide a safe refresh/restart path. Retry and Choose another file SHALL not confuse those outcomes or create duplicate replacements.

#### Scenario: Transaction fails during writes
- **WHEN** the existing transaction raises a rollback-producing failure
- **THEN** the complete previous dataset remains and the user can retry, choose another file or cancel

#### Scenario: Navigation fails after commit
- **WHEN** replacement succeeds but the screen cannot refresh
- **THEN** the UI reports the completed restore with refresh/restart recovery and does not claim the old notebook was retained
