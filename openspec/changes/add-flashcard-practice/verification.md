# Verification

## Automated checks

- `mise exec -- pnpm lint`, `mise exec -- pnpm format:check`, and `mise exec -- pnpm typecheck` passed.
- `mise exec -- pnpm test --runInBand` passed 29 suites and 91 tests, including selection, reveal, advance, empty, single-term, and read-retry coverage.
- Added `.maestro/flashcard-practice.yaml` for disposable-device interaction coverage. A temporary copy targeting the isolated physical-device test application passed, and a separate targeted flow verified both Next transitions. The repository flow was then strengthened with those identity assertions.

## Physical Android device

- Built an arm64 standalone release with temporary application ID `dev.arial.vocabulaire.flashcardverify` and installed it alongside the existing app on a USB-connected Pixel 8 Pro running Android 17. The generated Android build file was restored after the build.
- Maestro 2.12.0 passed the empty collection, single-term reveal and hide, disabled Next, two-term practice from a no-matches search, and Back preserving the search. A second flow verified Next changes from `neko` to `inu` and back with translations hidden. The flow used a fresh isolated test application and did not clear the existing app's data.
- A further Maestro flow passed the Spanish labels and reveal interaction in light appearance. Captures show the [dark hidden card](evidence/pixel-dark-hidden.png) and [light Spanish revealed card](evidence/pixel-light-spanish-revealed.png).
- The standalone test copy passed an airplane-mode cold start followed by practice, reveal, and Next in Spanish. Airplane mode was restored to its prior setting. An earlier attempt was interrupted by the device lock screen.
- At an overridden 320 dp width and 200% text scale, a Spanish light-appearance Maestro flow reached Collection tools and practice, toggled a short translation, used Next, and returned with Back. Display size and font scale were restored. This check does not cover long terms or dark appearance at that size.
- At 320 dp and 200% text scale in dark appearance, a separate single-term collection with a long expression and translation allowed reveal, scrolling through the translation, reaching disabled Next, and returning with Back. Captures show the [initial long card](evidence/pixel-dark-long-hidden-320-200.png) and [scrolled revealed card](evidence/pixel-dark-long-revealed-bottom-320-200.png). For this long expression the reveal hint lies below the initial viewport, and the whole card is tappable. The display size and font scale were restored afterward.
- Compared the [dark](evidence/pixel-tools-dark.png) and [light](evidence/pixel-tools-light.png) Android Collection tools sheets with Stitch screen 18. Both include the practice action in the expected order. Native menu rows use existing unbadged icons and the category glyph for practice, while the artboards use circular icon treatments and a card glyph. The dark hidden-card artboard uses a decorative eye that the native card omits. Real device captures use Spanish text and the test collection; Stitch artboards use English sample content.

## Outstanding design and Android acceptance

- Stitch Canvas authentication succeeded. The [review gallery](../../../design/vocabulaire/index.html#54) contains seven inspected practice states in light and dark appearances, including corrected empty and recovery layouts. A first generated light card contained invented pronunciation metadata; the gallery uses a separate minimal artboard without that content. The dark hidden-card artboard includes a decorative eye icon that the native card omits. Both Collection tools artboards have been refreshed with the practice entry. Their card icons differ from the native app's reused category icon.
- Uploaded the device captures to Stitch as native references: [dark hidden card](https://stitch.google.com/projects/8226357890556052909?node-id=10978758710537739614) and [light Spanish revealed card](https://stitch.google.com/projects/8226357890556052909?node-id=8405257591509626374). The screenshots represent different states and do not establish paired design coverage.
- TalkBack reveal and disabled-state verification remains pending and is non-blocking at the user's request. An initial attempt opened the TalkBack tutorial; in subsequent attempts the user did not confirm the requested card announcements. No successful TalkBack result is claimed. The previous accessibility service and touch-exploration settings were restored. No hosted CI result is claimed.
