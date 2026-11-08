## ADDED Requirements

### Requirement: Four distinct introduction pages
First-run onboarding SHALL present four pages covering collections, vocabulary entries, filtering and backups. Every page SHALL expose the current step and four-step progress, appropriate accessible navigation and a Skip path. Illustrative vocabulary SHALL use only the app's supported expression, translation, notes and category model.

#### Scenario: View the introduction in Spanish
- **WHEN** a first-run device resolves to Spanish
- **THEN** all four pages, progress labels and actions are localized while example vocabulary remains unchanged

### Requirement: Leftward advancement and equivalent controls
A completed leftward content swipe SHALL advance one page, and a completed rightward content swipe SHALL return one page. The same transition logic SHALL power Next and Back buttons. The first/last pages SHALL bound navigation, controls/vertical scrolling/native edge Back SHALL remain usable, and canceled drags SHALL NOT persist a step change.

#### Scenario: Advance from collections to entries
- **WHEN** the user swipes left on the first page's content
- **THEN** the second page appears and persisted progress becomes step two

#### Scenario: Navigate without swiping
- **WHEN** a TalkBack user activates Next and then Back
- **THEN** the same forward and reverse step transitions occur without requiring a gesture

#### Scenario: Cancel a drag
- **WHEN** an incomplete drag returns to its starting position
- **THEN** the current persisted onboarding step remains unchanged

### Requirement: Gentle page motion
Introduction content SHALL have a brief entrance animation on first presentation and when changing pages, with the direction reflecting forward or backward navigation. Navigation and progress persistence SHALL remain immediate. When reduced motion is enabled or its setting is not yet known, the content SHALL remain still and fully visible.

#### Scenario: Navigate with reduced motion
- **WHEN** reduced motion is enabled and the user advances or returns to a page
- **THEN** the page appears without an animated transition and its controls remain usable

### Requirement: Resumable and nonblocking introduction
The app SHALL restore the last completed introduction step after restart until onboarding is completed. Users who completed onboarding SHALL reach their collections/empty home without being forced through the introduction again. Starting collection creation or skipping SHALL complete onboarding without committing a placeholder collection.

#### Scenario: Cancel first collection creation
- **WHEN** a first-run user chooses Create collection and leaves without saving
- **THEN** the empty collections home remains usable and no partial collection is stored

### Requirement: Clear start shortcuts
Pages one through three SHALL provide Get started choices for Create collection, Restore backup and Skip for now. The final page SHALL expose those actions directly. Closing the start-choice sheet SHALL return to the same page without changing its progress or data.

#### Scenario: Skip from an early page
- **WHEN** the user chooses Skip from an early page or its start-choice sheet
- **THEN** onboarding completes and the collections home opens with the existing dataset or its welcoming empty state

### Requirement: Restore entry retains a valid navigation path
Restoring from onboarding SHALL use the normal backup validation/confirmation workflow. Canceling before replacement SHALL return to the retained introduction step without an unintended onboarding completion. Successful explicit restore SHALL reach a valid collections home and complete the introduction transition, while honoring restored locale, appearance and display choices.

#### Scenario: Cancel choosing a backup
- **WHEN** the user enters Backups from page three and cancels selection/back navigation
- **THEN** page three remains available and notebook data has not changed

#### Scenario: Restore a backup with incomplete introduction flags
- **WHEN** the user explicitly confirms a valid restore containing incomplete introduction preferences
- **THEN** the restored notebook becomes accessible at home and this user-initiated transition completes onboarding without changing the supported backup format
