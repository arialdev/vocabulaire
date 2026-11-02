## ADDED Requirements

### Requirement: Offline vocabulary PDF generation
Users SHALL generate a PDF for a collection or an applied saved filter using local application data. The PDF SHALL include the collection/filter title, original expressions, translations, notes, and grammatical/thematic categories. It SHALL use the current interface language for application labels while preserving vocabulary text. PDF creation SHALL NOT fetch remote fonts, images, or other resources.

#### Scenario: Export a saved filter in airplane mode
- **WHEN** a user generates a PDF for a saved filter without network access
- **THEN** the PDF contains all matching terms from the same shared filter semantics, not just items mounted in the virtualized list

### Requirement: Safe and readable document content
Vocabulary and user-defined labels SHALL be treated as plain text when inserted into PDF markup. Documents SHALL remain readable across multiple pages, wrap long expressions and notes, and preserve supported Unicode scripts. Decorative emoji rendering SHALL NOT be the sole means of identifying a collection or filter.

#### Scenario: Export markup-like vocabulary
- **WHEN** a note contains `<script>`, ampersands, quotes, or angle brackets
- **THEN** those characters appear as vocabulary text and do not execute or alter the document structure

#### Scenario: Export enough terms for multiple pages
- **WHEN** a collection's PDF spans several pages
- **THEN** text remains legible with usable page breaks and no clipped content, as verified on Android

### Requirement: Share and recover from PDF failures
Successful PDF generation SHALL expose the file through Android's share/save flow. An empty result set SHALL produce a clear empty-state message rather than an unexplained blank PDF. Cancellations and generation/share failures SHALL leave vocabulary data unchanged and produce appropriate feedback.

#### Scenario: No terms match the selected filter
- **WHEN** a user requests a PDF for an empty result set
- **THEN** the application explains that there are no matching terms to export
