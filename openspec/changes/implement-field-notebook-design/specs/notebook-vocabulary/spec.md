## ADDED Requirements

### Requirement: Readable compact and detailed vocabulary
The vocabulary screen SHALL identify its collection, provide prominent search, Filters & display, collection tools and Add term, and render a virtualized list. Compact rows SHALL show the complete original expression and translation without notes/categories; detailed rows SHALL additionally show optional note previews and type-distinguished category chips. The compact footer SHALL contain only the localized entry count, without a page number or storage reminder.

#### Scenario: Read a long compact translation
- **WHEN** an expression or translation exceeds one line
- **THEN** it wraps without ellipsis and row actions remain independently reachable

#### Scenario: Switch density while searching
- **WHEN** the user applies Detailed instead of Compact while a query is active
- **THEN** the same results/order remain, with the additional note/category presentation and an updated display summary

### Requirement: Search and explicit result states
Vocabulary search SHALL use the existing case/Latin-diacritic-insensitive matching over original, translation and notes, combined with the active categories. The UI SHALL distinguish a zero-term collection, no matches in a nonempty collection, loading and read error. No-results UI SHALL retain the query/active selections and provide Clear search & filters plus access to editing filters.

#### Scenario: Clear a no-results query
- **WHEN** the user chooses Clear search & filters after a nonmatching search/category combination
- **THEN** the search and category restrictions clear, stored terms remain and the chosen density/sort are retained

#### Scenario: Open a collection with no terms
- **WHEN** a valid collection has no vocabulary
- **THEN** the screen offers Add your first term without fabricated example records

### Requirement: Term details and contextual actions
Term details SHALL present the expression, translation, complete optional notes and assigned categories identified by grammatical/thematic type. Empty optional sections SHALL be omitted. Edit SHALL be prominent, and deletion SHALL be reached through contextual actions from details or a list row. Pronunciation playback follows the add-term-pronunciation-audio change. The UI SHALL NOT invent IPA or phonetic metadata.

#### Scenario: Open a term without notes or categories
- **WHEN** the selected term has only an expression and translation
- **THEN** both are readable and absent optional sections do not create empty cards or pronunciation placeholders

### Requirement: Comfortable term editing and validation
Term editors SHALL require original expression and translation, support optional multiline notes and multiple categories grouped into grammatical/thematic types, and expose collection category management. Whitespace-only required values SHALL produce separate field errors, preserve all other input/selections and prevent writes. Storage failure SHALL keep the draft and expose recovery. Saving SHALL commit once and return to the invoking screen.

#### Scenario: Validate both required fields
- **WHEN** Save is attempted with a blank expression and translation but populated notes/categories
- **THEN** each required field has a clear error, the first invalid field receives focus and notes/categories remain intact

#### Scenario: Save arbitrary-language content
- **WHEN** the user saves accented, non-Latin or multiline vocabulary
- **THEN** text and category assignments retain their content and collection ownership across editing and restart

### Requirement: Term drafts survive category subflows
Opening category management from a term editor SHALL preserve the editor's unsaved values without committing a term. Returning SHALL refresh category names/choices and reconcile deleted selections using stable IDs. Category operations SHALL NOT remount/reset the term draft merely because the repository revision changed.

#### Scenario: Add a category while drafting a term
- **WHEN** the user enters an expression, translation and notes, creates a category in the subflow, and returns
- **THEN** the original draft remains and the new category is available for selection

#### Scenario: Delete a selected category in the subflow
- **WHEN** a selected category is deleted during category management
- **THEN** the editor retains its text and other selections and no longer references the deleted category

### Requirement: Term discard and deletion guards
Dirty term exits SHALL offer Keep editing/Discard changes, while term deletion SHALL require a named destructive confirmation. Canceling either action SHALL keep the term/draft. A failed confirmed deletion SHALL keep the details available with actionable feedback; successful deletion SHALL return to a valid owning collection view.

#### Scenario: Cancel a dirty exit
- **WHEN** the user leaves a modified term and chooses Keep editing
- **THEN** all typed values and category selections remain without a write

#### Scenario: Deletion fails
- **WHEN** the repository rejects a confirmed term deletion
- **THEN** the details stay open and the UI does not announce successful deletion or navigate to a missing record

### Requirement: Focused daily discovery
Word of the Day SHALL use the existing collection/local-date stable pick and minimum-five-terms rule. It SHALL show the expression, translation and optional notes/categories, with Open term navigating to the same record. Below five terms it SHALL explain the threshold and offer adding the actual missing number. It SHALL NOT add reshuffling, pronunciation metadata, streaks, scores or rewards.

#### Scenario: Open the same daily word after restart
- **WHEN** a qualifying collection's daily screen is reopened on the same local day without invalidating the selected term
- **THEN** the same stored pick appears and Open term reaches its details

#### Scenario: Three terms are available
- **WHEN** a collection contains three terms
- **THEN** the insufficient state explains that five are required and offers adding two more terms
