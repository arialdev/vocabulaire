## ADDED Requirements

### Requirement: Semantic light and dark notebook presentation
The application SHALL implement the semantic light/dark colors, typography, spacing and shape roles in the approved `design/vocabulaire/DESIGN.md`. It SHALL resolve System, Light and Dark preferences across screens, application bars, fields, overlays, feedback and native picker presentation. OS-owned document pickers and share sheets SHALL retain Android-native presentation. Functional outlines SHALL be distinct from decorative dividers, with at least 3:1 functional contrast; normal text SHALL meet 4.5:1 contrast and large text at least 3:1.

#### Scenario: Change appearance with a form open
- **WHEN** the resolved system appearance changes while a draft is open under System appearance
- **THEN** its visible surfaces and controls update together and its field values and selections remain intact

#### Scenario: Explicit appearance overrides the device
- **WHEN** Light or Dark is explicitly selected
- **THEN** application-owned content/chrome and the native emoji picker use that selected appearance while OS-owned file/share surfaces retain their native presentation

### Requirement: Local typography and assets
The application SHALL bundle its approved typefaces, required icon assets and their license notices. Startup and all notebook functions SHALL work without remote font, image or icon requests. It SHALL preserve vocabulary text and use platform script fallback where the display typeface lacks glyphs. Font-loading failure SHALL offer a usable fallback/retry without deleting or blocking access to data.

#### Scenario: Cold start without a connection
- **WHEN** a standalone build starts in airplane mode without Metro
- **THEN** the bundled typography/icons and existing notebook become available without a download

#### Scenario: Font loading fails
- **WHEN** a bundled font cannot be loaded
- **THEN** recovery uses readable system typography and actionable controls while stored vocabulary remains intact

### Requirement: Responsive readable mobile controls
The UI SHALL provide touch targets of at least 48 dp, allow vocabulary and labels to wrap, and keep fields, errors and primary actions reachable at widths of 320 dp and larger and font scaling through 200%. It SHALL respect gesture/system insets, reduced motion and keyboard avoidance without covering the final fields or applying conflicting avoidance offsets. Long expressions SHALL NOT be ellipsized to enforce a fixed row height.

#### Scenario: Edit a multilingual term on a narrow screen
- **WHEN** an enlarged-text user edits a long expression and notes at 320 dp width with the keyboard visible
- **THEN** both required fields, category groups, validation and Save remain reachable by scrolling without shrinking text

#### Scenario: A sheet outgrows its compact height
- **WHEN** sheet content cannot fit at the current text scale
- **THEN** it expands or scrolls with its actions clear of the gesture area rather than clipping content

### Requirement: Coherent stack navigation
Collections SHALL be the root, Settings SHALL be reachable from its app bar, and subordinate views SHALL have consistent leading Back/Close controls and Android Back behavior. The UI SHALL avoid duplicate stack/app bars and SHALL preserve ID-based collection/term ownership during navigation. Collection tools SHALL provide daily word, categories, PDF export and collection editing.

#### Scenario: Open and return from a term
- **WHEN** the user opens a collection, then a term, then presses Back
- **THEN** navigation returns to that collection's vocabulary without a duplicated header or another collection's records

### Requirement: Accessible single-overlay lifecycle
Application sheets, contextual menus and dialogs SHALL expose accessible names, selected/disabled states and a contained focus order. Only one application overlay SHALL be visible at a time; parent drafts SHALL survive child-overlay transitions. Android Back SHALL dismiss/cancel the current dismissible overlay before removing its underlying route, and dismissal SHALL restore meaningful focus.

#### Scenario: Cancel an emoji child sheet
- **WHEN** the user opens an emoji picker from Save filter and cancels it
- **THEN** the Save filter draft returns with its previous icon/name and the parent filtering draft remains available

#### Scenario: Dismiss a confirmation with Android Back
- **WHEN** the user presses Back on a destructive confirmation
- **THEN** no deletion occurs and focus returns to the invoking workflow

### Requirement: Actionable validation and feedback
Required-field errors SHALL identify the affected field, preserve drafts, focus the first invalid input and be available to TalkBack. Saving/deleting/preparing/sharing SHALL prevent duplicate operations while busy. Read errors SHALL be distinguishable from genuine empty data. Feedback SHALL describe only a known outcome and SHALL NOT imply that merely opening a share sheet saved a backup.

#### Scenario: Storage rejects a save
- **WHEN** a save fails after valid input
- **THEN** the editor retains the input and selections, presents an actionable error and does not navigate as if the save succeeded

### Requirement: Approved design coverage and precedence
Implementation SHALL cover states 01–53 in both appearances using the current `inventory.json` references and record review results. The user's corrections in `REVISIONS.md` and written interaction contracts SHALL take precedence over incidental generated HTML or obsolete artboards. It SHALL NOT introduce IPA/pronunciation fields, alias inputs, PDF page previews, fake metadata, accounts, AI, audio, synchronization or gamification.

#### Scenario: An older mockup contains an obsolete field
- **WHEN** a generated reference contains a short label, phonetic line or PDF page preview
- **THEN** the implementation follows the revised written contract and omits that element
