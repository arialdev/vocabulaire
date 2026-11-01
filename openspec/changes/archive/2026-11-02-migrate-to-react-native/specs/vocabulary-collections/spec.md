## ADDED Requirements

### Requirement: Arbitrary-language collections
Users SHALL create, list, edit, select, and delete collections representing languages. A collection SHALL have a nonblank name and Unicode icon, with an optional user-defined short label. The application SHALL NOT restrict collection content to the interface languages or require a predefined language code. Duplicate display names SHALL NOT cause records to overwrite each other.

#### Scenario: Create a collection outside the interface languages
- **WHEN** a user creates a collection for Japanese, Arabic, or a custom language name
- **THEN** the collection is saved independently of the English/Spanish interface setting and can be selected for vocabulary entry

#### Scenario: Rename a populated collection
- **WHEN** a user changes a collection's name, label, or icon
- **THEN** its identity, terms, categories, saved filters, and daily-word relationships remain intact

### Requirement: Collection selection and deletion
The application SHALL remember the selected collection across restarts. It SHALL require confirmation before deleting a collection and its associated vocabulary. Deleting the selected collection SHALL select a remaining collection or show the collection creation/selection state when none remain.

#### Scenario: Delete the selected collection
- **WHEN** a user confirms deletion of the currently selected collection
- **THEN** its dependent records are removed atomically and navigation resolves to another collection or the empty state

#### Scenario: Cancel collection deletion
- **WHEN** a user cancels the deletion confirmation
- **THEN** the collection and all dependent records remain unchanged

### Requirement: Collection-scoped term management
Users SHALL create, view, edit, and delete terms within a collection. Each term SHALL contain a nonblank original expression, a nonblank translation, optional notes, stable identity, and creation/update timestamps. Term edits SHALL preserve creation time and update modification time. Deletion SHALL require confirmation. Stored vocabulary SHALL preserve Unicode content and SHALL NOT carry over the old UI's short fixed-length restrictions without a documented need.

#### Scenario: Save a multilingual expression
- **WHEN** a user saves a term containing non-Latin text, accents, or a multiword expression
- **THEN** the original expression, translation, and notes survive editing and application restarts without character loss

#### Scenario: Reject incomplete term entry
- **WHEN** the original expression or translation contains only whitespace
- **THEN** the form reports the field error and no term is committed

#### Scenario: Work in another collection
- **WHEN** a user switches from one collection to another
- **THEN** listing, searching, editing, and deleting terms operate only on the selected collection

### Requirement: Search and sorting
Users SHALL search original expressions, translations, and notes within the selected collection. Search SHALL normalize both the query and candidate text for case-insensitive matching and Latin diacritic-insensitive matching while preserving original stored text. Users SHALL sort by original expression, translation, or modification time in either direction, with stable ordering for ties.

#### Scenario: Find accented text with an unaccented query
- **WHEN** a collection contains a term with `café` and the user searches for `CAFE`
- **THEN** the term appears without changing its stored spelling

#### Scenario: Combine sorting with search results
- **WHEN** the user changes sorting while a search is active
- **THEN** the same result set is ordered by the selected field and direction, using record identity to resolve ties

### Requirement: Compact and detailed term views
Users SHALL switch between compact and detailed term displays without changing vocabulary records or the active query. Long term lists SHALL use virtualized rendering, and the interface SHALL distinguish an empty collection, no matching results, loading, and read failures.

#### Scenario: Expand the term list
- **WHEN** a user switches from compact to detailed view while filtering terms
- **THEN** the same matching terms remain visible with notes and category details available

#### Scenario: Search has no matches
- **WHEN** the current query matches no terms in a nonempty collection
- **THEN** the application identifies the empty result and offers a way to clear the query without suggesting that the saved vocabulary was lost
