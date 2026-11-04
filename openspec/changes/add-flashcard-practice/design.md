## Context

Vocabulary already opens collection-scoped tools through Expo Router. `repository.listTerms(collectionId)` returns the full collection with stable term IDs, expressions, and translations. Vocabulary applies search and category filters after that read. The practice screen can reuse the collection route and read patterns from Vocabulary and Word of the Day.

## Goals / Non-Goals

**Goals**

- Open a small, offline practice screen for the current collection, with one tappable card and a Next button.
- Handle zero or one term and reuse shared UI, appearance, and localization.

**Non-Goals**

- Dependencies, repository API changes, database migrations, or persisted practice state.
- Scores, history, learning progress, or practice animations.

## Decisions

- Add one `MenuAction` to Vocabulary's Collection tools. Close the sheet and push `/collection/practice` with the current `collectionId`, following the Word of the Day entry. Keep the existing Vocabulary screen on the stack so Back preserves the query and filters.
- Use the service provider and existing collection and term reads. Validate the collection, keep the shared app bar available throughout loading and recovery, and reuse the localized loading, missing-collection, vocabulary read error, and Retry copy. Scope the read and card state to the route's collection ID, and refresh the term list on repository revisions.
- Use one pure selector with an optional current term ID and an injectable random source, following the existing domain test pattern. For the initial draw, every term is eligible. For Next, filter out the current ID. Pick one random index from the eligible terms, or return no selection when the list is empty. A singleton supplies the initial card, and the shared `ActionButton` displays Next as disabled.
- Store the active term ID and reveal flag in the screen. Next changes the ID and hides the translation together. Back discards the session, and reopening starts a fresh draw. An empty collection uses the existing empty vocabulary copy and Back.
- Build the screen with `ScreenLayout`, `AppBar`, `NotebookText`, and a themed `Pressable` for the card. Use localized show/hide affordances and expose the expression and revealed translation to TalkBack. Keep the hidden translation out of the accessibility tree. Put Next in the shared footer and allow long vocabulary text to wrap and scroll.

## Risks / Trade-offs

- Terms can share display text. Compare IDs so distinct terms remain eligible even when their expressions match.
- A collection or active term can disappear when repository data changes. Resolve the card against the refreshed data and show the appropriate missing or empty state, or choose a replacement with its translation hidden.
- The extra tools row and long card text take more vertical space. Check that the tools row, card, and Next remain reachable at 320 dp and 200% text scale, in both appearances.
