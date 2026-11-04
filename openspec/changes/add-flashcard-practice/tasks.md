## 1. Stitch and handoff

- [x] 1.1 Read the Stitch skill and the repository's design and flow guidance. In the existing Vocabulaire Stitch project, update Collection tools and add the linked practice states in light and dark. Cover hidden and revealed translations, empty and single-term collections, loading, missing collection, and read error with Retry.
- [x] 1.2 Refresh the affected PNG and HTML exports, `screens.json`, the review gallery, and the design and flow documentation. Keep screen IDs and navigation aligned with Stitch.

## 2. Selection and screen

- [x] 2.1 Implement the pure random selector and add focused Jest cases for zero and one term, initial eligibility, exclusion by ID on Next, duplicate display text with distinct IDs, and selection at the ends of the eligible list. Use a deterministic random source in tests.
- [x] 2.2 Add the Collection tools entry and practice route. Load terms through the existing repository, keep practice state on the screen, and implement toggle, Next, empty and single-term behavior, and read recovery. Reuse the shared layout, controls, theme, and English and Spanish resources.
- [x] 2.3 Add focused React Native Testing Library coverage for the card interaction and small collections, including that Next hides the new translation and a single-term card can still reveal it. Run `mise exec -- pnpm lint`, `mise exec -- pnpm format:check`, `mise exec -- pnpm typecheck`, and `mise exec -- pnpm test --runInBand`.

## 3. Android acceptance

- [x] 3.1 Run the affected Maestro flow on a disposable Android target. Verify entry from filtered Vocabulary, reveal and hide, Next with two terms, empty and single-term collections, and Back preserving the query. Verify practice in airplane mode on the standalone build. The user supplied a physical device and the checks used an isolated test application ID and dataset.
- [x] 3.2 Compare the Android tools sheet and practice states with Stitch in both appearances. Check reachability at 320 dp and 200% text scale, English and Spanish labels, and Android Back. Record screen references, command and device results, native adaptations, and verification limits in the change handoff. TalkBack reveal and disabled-state verification is pending and non-blocking at the user's request.
