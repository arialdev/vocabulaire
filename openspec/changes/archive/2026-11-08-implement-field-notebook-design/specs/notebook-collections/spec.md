## ADDED Requirements

### Requirement: Collection home with real counts
The collections home SHALL show each collection's Unicode emoji, full name, term count, opening action and separate contextual actions. It SHALL expose Create collection and Settings and refresh counts after vocabulary mutations or restore. It SHALL NOT render an alias, language code or decorative collection subtitle.

#### Scenario: Return after adding a term
- **WHEN** the user saves a term and returns to Collections
- **THEN** the owning collection's count increases and other collection counts remain correct

### Requirement: Welcoming empty and recoverable read states
A home with no collections SHALL provide a welcoming explanation, Create collection and Restore backup. Loading and read failure SHALL have distinct presentation and retry behavior; failed reads SHALL NOT be presented as a successful empty notebook or fabricated zero counts.

#### Scenario: Delete the final collection
- **WHEN** the final collection is successfully deleted
- **THEN** the home offers creation and restoration without requiring an application reset

#### Scenario: Collection summaries fail to load
- **WHEN** the repository cannot read collection summaries
- **THEN** the user sees a recoverable read error rather than the first-user empty state

### Requirement: Focused collection fields and retained hidden data
Create/edit UI SHALL contain only required Name and Unicode emoji selection. A whitespace-only name SHALL fail inline validation without a write. Existing hidden `shortLabel` values, IDs, timestamps/relationships and backup compatibility SHALL survive a name/icon edit; new collections SHALL have no requested alias value. The UI SHALL NOT reintroduce a label as a description or abbreviation input.

#### Scenario: Rename a collection imported with an alias
- **WHEN** the user edits a collection whose supported backup contained `shortLabel: "FR"`
- **THEN** the form does not show an alias field, the edited name/icon are saved, and the hidden value and dependent records remain intact

#### Scenario: Submit a blank name
- **WHEN** the collection name is whitespace-only on save
- **THEN** the form identifies Name as invalid, keeps the icon/draft and creates no collection

### Requirement: Pending emoji selection
The collection icon control SHALL open the existing native Android picker within an app-owned Apply/Cancel workflow. Selection SHALL update a pending icon only. Apply SHALL copy the complete Unicode sequence to the collection draft without saving it; Cancel/Back SHALL retain its prior value. The picker SHALL remain usable offline with native category/variant browsing, localized labels and resolved appearance; it SHALL NOT present a nonfunctional search field.

#### Scenario: Cancel after selecting another emoji
- **WHEN** the user selects a different emoji and cancels the picker
- **THEN** the collection draft keeps its previous icon and no repository write occurs

#### Scenario: Apply a compound emoji
- **WHEN** the user applies a flag, skin-tone variant or joined emoji and later saves
- **THEN** the full sequence survives navigation, restart and backup round trip

### Requirement: Unsaved collection exit
Leaving a dirty collection editor SHALL offer Keep editing and Discard changes. Keep editing SHALL preserve the draft; Discard SHALL resume the attempted exit without a save. A clean editor exit SHALL NOT show a spurious dirty prompt, and child picker navigation SHALL NOT commit/discard the collection.

#### Scenario: Keep an unsaved rename
- **WHEN** the user changes the name, presses Android Back and chooses Keep editing
- **THEN** the editor remains open with that name and its existing icon

### Requirement: Contextual collection deletion
Collection deletion SHALL be reached through a contextual action and require a confirmation naming the collection and the scope of its dependent data. Cancellation SHALL leave all data intact. Success SHALL use the existing atomic cascade/selection behavior and resolve navigation to a remaining collection or empty home. Failure SHALL retain a usable screen and accurate feedback.

#### Scenario: Cancel the named deletion
- **WHEN** the user opens Delete collection and then cancels
- **THEN** the collection, terms, categories, saved filters and selection are unchanged

#### Scenario: Confirm deletion of the active collection
- **WHEN** the user confirms deletion of the active collection
- **THEN** its dependent records are removed atomically and navigation no longer targets the removed identity
