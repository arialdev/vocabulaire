## ADDED Requirements

### Requirement: Collection-scoped flashcard practice

The application SHALL offer Flashcard practice in Vocabulary's Collection tools. Practice SHALL work offline and use all terms in the opened collection, regardless of the active search or filters. Practice SHALL keep session state in memory for the lifetime of the screen and leave notebook data and preferences intact.

#### Scenario: Open practice from filtered vocabulary

- **WHEN** a user opens Flashcard practice from a collection whose active search has no matches
- **THEN** all terms in that collection are eligible for practice, including those excluded by search or filters
- **AND** returning to Vocabulary preserves the active search and filters

#### Scenario: Reopen practice

- **WHEN** a user exits practice after revealing a translation and then opens practice again
- **THEN** a fresh session starts with the first card's translation hidden if the collection contains terms

### Requirement: Translation reveal and random selection

A card SHALL initially display the term's expression with its translation hidden visually and from assistive technology. Activating the card SHALL toggle the translation while keeping the expression visible. When at least two terms are available, Next SHALL select uniformly at random from terms whose IDs differ from the current term's ID and hide the newly selected translation. The first card SHALL be drawn uniformly from the whole collection.

#### Scenario: Reveal and hide a translation

- **WHEN** the user activates the same card twice
- **THEN** the first activation reveals the translation and the second hides it again

#### Scenario: Advance from a revealed card

- **WHEN** the user activates Next while a translation is visible and the collection contains at least two terms
- **THEN** the card displays a different term's expression with its translation hidden

### Requirement: Small collections and read recovery

An empty collection SHALL show an empty message with Back available. A single-term collection SHALL show its sole card with normal reveal behavior and a disabled Next button. While loading or when a collection cannot be read, the application SHALL distinguish those states from an empty collection. Read errors SHALL offer Retry, and missing collections SHALL offer Back.

#### Scenario: Open an empty collection's practice screen

- **WHEN** the collection has no terms
- **THEN** an empty message appears and there is no card or Next button

#### Scenario: Practice the only term

- **WHEN** the collection has exactly one term
- **THEN** that term is shown with its translation initially hidden, the card can toggle the translation, and Next is disabled

#### Scenario: Retry a failed collection read

- **WHEN** reading the collection fails and the user selects Retry
- **THEN** the application attempts the collection read again and shows the corresponding result
