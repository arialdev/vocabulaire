## ADDED Requirements

### Requirement: Grouped collection category management
Category management SHALL show collection-owned Grammatical and Thematic groups, distinguish types with names/icons as well as color, and provide create/edit/delete actions and a useful empty state. Create SHALL require a name and type; edit SHALL allow renaming while displaying the existing type as read-only. Invalid input SHALL retain the draft and produce inline validation.

#### Scenario: Edit an existing thematic category
- **WHEN** the user edits Food & drink
- **THEN** its name can change, its type remains Thematic and existing assignments keep their stable identity

#### Scenario: Add the first category
- **WHEN** the collection has no categories and the user saves a named/type-selected category
- **THEN** it appears in the corresponding group and becomes available to the collection's term/filter controls

### Requirement: Category deletion preserves vocabulary
Category deletion SHALL require confirmation explaining that assignments/filter references are removed while terms remain. Success SHALL use the existing collection-scoped repository operation and refresh affected selections/summaries. Cancellation/failure SHALL preserve data and expose the appropriate outcome.

#### Scenario: Delete an assigned category
- **WHEN** the user confirms deleting Travel used by terms and saved filters
- **THEN** terms and saved-filter records remain, Travel references disappear and visible applied/draft selections contain no stale ID

### Requirement: Staged filter and display tabs
Filters & display SHALL provide Categories, Display and Saved tabs in one sheet workflow. Categories/display edits SHALL affect a pending draft and preview count until Apply. Tab changes and child forms SHALL preserve that draft. Close/Back SHALL discard pending edits without changing applied results or committed display preferences.

#### Scenario: Cancel pending categories and density
- **WHEN** the user changes category selection and density, switches tabs, and closes the sheet without Apply
- **THEN** the list retains its original criteria/density and reopening starts from the committed state

#### Scenario: Apply a previewed draft
- **WHEN** the user chooses Apply after changing categories/display
- **THEN** the list uses the previewed selection and display choices and the sheet closes only after required preference writes succeed

### Requirement: Explicit category matching and clearing
Category filtering SHALL reuse `queryTerms`: OR within each type, AND between types, combined with search, and no restriction from an empty group. The sheet SHALL explain that rule concisely and allow clearing category selections without clearing search or display choices.

#### Scenario: Clear categories while searching
- **WHEN** the user clears category filters in the sheet and applies while searching café
- **THEN** café remains the search and results use no category restriction with the same display/sort

### Requirement: Persistent independent display choices
Display controls SHALL offer original expression, translation and last updated sorting in both directions, plus Compact/Detailed layouts. Text directions SHALL use A–Z/Z–A and last-updated directions Oldest first/Newest first. Committed choices SHALL use the existing persisted preferences, survive restart/collection changes and remain independent of saved-filter criteria. Stable tie ordering SHALL be preserved.

#### Scenario: Restart with a time sort and detailed view
- **WHEN** the user applies Detailed, Last updated and Newest first and restarts
- **THEN** those display choices are restored and no new text/category filter has been created

### Requirement: Visible active query intent
The vocabulary view SHALL show active category/filter selections, result count and current density/sort. Editing search or category criteria SHALL detach the applied saved-filter badge without mutating the stored filter. Display-only changes SHALL keep that badge. Changing collection SHALL clear collection-specific query/filter identity while retaining committed app-wide display preferences.

#### Scenario: Adjust density under a saved filter
- **WHEN** the user applies Café conversations and changes only density
- **THEN** the saved-filter badge remains because its text/category criteria still match

#### Scenario: Remove an active category chip
- **WHEN** the user removes a category chip from an applied saved filter
- **THEN** the current query changes, its Applied badge detaches and the saved filter is unchanged

### Requirement: Saved-filter creation from displayed selection
Save selection SHALL show the search/category criteria being saved, a required name and Unicode emoji selection. It SHALL capture the current search and pending categories shown in that summary, excluding sorting/density. Successful save SHALL return to the parent filter workflow with its draft intact and SHALL NOT implicitly apply pending criteria. Canceling the form SHALL preserve the parent draft; validation SHALL retain entered values and prevent incomplete saves.

#### Scenario: Save pending criteria without applying them
- **WHEN** the user selects Travel in a pending draft, names/saves that selection and returns to the sheet
- **THEN** the new saved filter contains Travel, the draft still shows Travel and the underlying list is unchanged until an explicit Apply action

#### Scenario: Cancel filter naming after choosing an emoji
- **WHEN** the user cancels Save filter after changing its pending name/icon
- **THEN** no saved filter is created and the parent category/display draft is retained

### Requirement: Saved-filter application deletion and empty state
The Saved tab SHALL show named/icon filters with readable criteria summaries and Apply/contextual Delete actions, or a welcoming empty state with Save current selection. Applying a saved filter SHALL install its search/categories immediately, retain committed display preferences, discard unrelated uncommitted display edits and close the sheet. Deletion SHALL require confirmation and retain vocabulary/categories; deleting the applied filter SHALL remove its identity badge while retaining the current query.

#### Scenario: Apply a saved filter from a modified sheet
- **WHEN** the user has an uncommitted display draft and explicitly applies a saved filter
- **THEN** that filter's criteria become active using the committed display preferences, and the sheet closes without saving the discarded display draft

#### Scenario: Delete the active saved filter
- **WHEN** the user confirms deleting the currently applied saved filter
- **THEN** its row and Applied identity disappear, current query/results remain usable and no term/category is deleted
