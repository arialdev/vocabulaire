# Vocabulaire backup format, version 1

A backup is a UTF-8 JSON object with `format: "vocabulaire"`, `schemaVersion: 1`, an ISO UTC `exportedAt` timestamp, and a `data` object. The data object contains arrays named `collections`, `terms`, `categories`, `termCategories`, `savedFilters`, `savedFilterCategories`, `dailyPicks`, and `preferences`. Records use the camelCase field names from the application's typed SQLite schema; identifiers are positive safe integers and timestamps are UTC ISO strings. Daily dates use `YYYY-MM-DD` in the device's local calendar. The optional singleton preferences record has ID 1.

IDs and references are preserved. Category assignments and filter criteria contain their owning collection ID as well as the referenced IDs. Every reference must exist in the same collection. Icon strings and all vocabulary text are Unicode and are never converted into image filenames. The export is a database transaction snapshot. Restore is a complete replacement, after validation and confirmation; it is not a merge.

Old Ionic JSON files have no supported format identifier and are rejected. A future format change must explicitly add version handling rather than silently reinterpret version 1 records.
