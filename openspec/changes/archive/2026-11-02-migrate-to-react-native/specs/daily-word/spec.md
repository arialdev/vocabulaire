## ADDED Requirements

### Requirement: Persistent daily word per collection
For collections containing at least five terms, the application SHALL select and persist a word of the day for the device's current local calendar date. The same collection and date SHALL resolve to the same term across navigation and process restarts while that term exists. The displayed vocabulary SHALL reflect later edits to the selected term.

#### Scenario: Reopen the daily word
- **WHEN** a user reopens a qualifying collection's daily word on the same local date after restarting the app
- **THEN** the same term identity is shown with its current content

#### Scenario: Collection has fewer than five terms
- **WHEN** a user opens the daily word for a collection with fewer than five terms
- **THEN** the application explains the minimum vocabulary count and does not invent or persist an invalid selection

### Requirement: Bounded recent-selection avoidance
A new daily selection SHALL avoid the collection's three most recent prior selections when an alternative exists. Selection SHALL use the eligible candidate set's actual size. Concurrent requests for the same collection/date SHALL not persist conflicting picks.

#### Scenario: Advance to another local date
- **WHEN** a new local date is reached and eligible terms outside the recent history exist
- **THEN** the persisted daily term is chosen from those alternatives

### Requirement: Deleted daily terms recover safely
Deleting a selected daily term SHALL invalidate its daily-word reference. If the collection still qualifies, the application SHALL select a replacement for that date; otherwise it SHALL show the minimum-count state. History and daily-word displays SHALL NOT retain embedded copies of deleted terms.

#### Scenario: Delete today's selected term
- **WHEN** a user deletes today's selected term and at least five terms remain
- **THEN** reopening the daily word produces a valid replacement and later same-day openings use that replacement
