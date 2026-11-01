# Vocabulaire — The Field Notebook

An Android design proposal for a calm, personal, offline vocabulary notebook.

[Open the Stitch project](https://stitch.google.com/projects/8226357890556052909). The handoff contains **53 states in both appearances: 106 current artboards**, each exported as PNG and HTML.

Open [the review gallery](index.html) to compare light and dark appearances, browse by workflow, and follow the links between connected states. Each artboard also links to its editable Stitch screen and generated HTML export.

- [Design system and behavior](DESIGN.md): typography, semantic palettes, components, spacing, accessibility and interaction rules.
- [Screen inventory and flow map](FLOWS.md): all 53 views and representative states, navigation, and recovery behavior.
- [Palette contrast calculations](CONTRAST.md): normal-text color pairs verified against the proposed tokens.
- [Requested corrections and code findings](REVISIONS.md): pronunciation, the retired collection alias, simpler PDF export and compact-list copy.
- [Screen metadata](screens.json): canonical IDs, titles, dimensions, assets and CLI-resolved Stitch URLs.
- `screens/`: original PNG and HTML exports for every light/dark artboard.
- `prompts/` and `results/`: generation instructions and provenance. A revised screen supersedes its original; the gallery identifies the current artboards.

The visual direction pairs EB Garamond with DM Sans, warm paper with botanical ink, and restrained grammatical/thematic accents. The application remains useful without an account or connection. Motivation comes from collecting and revisiting language; the proposal contains no gamification.

The reference artboards use a 390 dp width, typically 892 dp high (780 × 1784 output pixels); some scrollable states are taller. The implementation should adapt to 320 dp and larger widths, text scaling, safe areas, and the keyboard. Native Android file pickers and sharing remain system-owned.

This is a design handoff, not an implementation. The review gallery connects designs; it does not save vocabulary or alter data. Generated HTML is a visual reference and may use hosted preview dependencies. Bundle fonts/assets and implement native semantics when applying the design to the offline app.

Application source files are unchanged.
