## ADDED Requirements

### Requirement: Collection-scoped categories
Users SHALL create, rename, and delete grammatical and thematic categories within a collection and assign zero or more categories of either type to a term in that collection. Cross-collection category assignments SHALL be rejected. Renaming a category SHALL update its display everywhere through its stable identity.

#### Scenario: Rename an assigned category
- **WHEN** a user renames a category assigned to terms and referenced by saved filters
- **THEN** the new name appears on the terms and filters without duplicating the category or breaking assignments

#### Scenario: Delete an assigned category
- **WHEN** a user confirms deletion of a category
- **THEN** that category's term assignments and saved-filter references are removed atomically while the terms and filters remain

### Requirement: Consistent combined filtering
The application SHALL combine text search and category selections using one set of query semantics. Selected categories within one type SHALL match any selected category of that type. When both grammatical and thematic selections are present, a term SHALL satisfy both groups. An empty group SHALL impose no restriction. Clearing filters SHALL return the full collection subject to any remaining search query.

#### Scenario: Combine grammatical and thematic selections
- **WHEN** a user selects grammatical categories `Verb` and `Noun`, thematic category `Travel`, and search text `go`
- **THEN** results contain only matching text terms assigned to `Travel` and to at least one of `Verb` or `Noun`

#### Scenario: Apply no category restrictions
- **WHEN** neither category type has a selection
- **THEN** category filtering excludes no terms, including terms with no category assignments

### Requirement: Saved filters retain query intent
Users SHALL save a collection's current text/category query as a named filter with a Unicode icon, apply it later, and delete it. Saved filters SHALL store criteria rather than snapshots of result terms. Editing an applied query SHALL leave the stored filter unchanged unless an explicit save/update action is performed. Filters SHALL NOT be applied across collections.

#### Scenario: New vocabulary matches a saved filter
- **WHEN** a saved filter is applied after a new matching term has been added
- **THEN** that term appears using the same semantics as an equivalent unsaved search and category selection

#### Scenario: Change collections with a filter selected
- **WHEN** a user changes collections while a saved filter is active
- **THEN** the old collection's filter is cleared and cannot select categories in the new collection

#### Scenario: Remove a referenced category
- **WHEN** a category referenced by a saved filter is deleted
- **THEN** the filter retains its name, icon, text, and remaining category criteria, and no invalid references remain
