# Vocabulaire backup format

A backup is a UTF-8 JSON object with `format: "vocabulaire"`, `schemaVersion`, an ISO UTC `exportedAt` timestamp, and a `data` object. The data object contains arrays named `collections`, `terms`, `categories`, `termCategories`, `savedFilters`, `savedFilterCategories`, `dailyPicks`, and `preferences`. Records use the camelCase field names from the application's typed SQLite schema; identifiers are positive safe integers and timestamps are UTC ISO strings. Daily dates use `YYYY-MM-DD` in the device's local calendar. The optional singleton preferences record has ID 1.

Version 2 adds the required `termAudio` array. Each item has `collectionId`, `termId`, `durationMs`, and `audioBase64`. The latter is canonical padded base64 containing a mono AAC recording in an MPEG-4 audio container, at most 128 KiB decoded. Duration is an integer from 1 through 7000 milliseconds. The container duration must agree within 250 milliseconds and cannot exceed 7200 milliseconds to allow encoder and container rounding. Each term has at most one clip, and the term must belong to the specified collection. Restore validates the encoding, container, duration, size, uniqueness, and ownership before confirmation.

The app exports version 2 and accepts version 1 and version 2 backups. Version 1 contains no pronunciation recordings. Versions of the app that only support version 1 cannot restore version 2 exports. The maximum backup file size is 25 MiB, including JSON and base64 overhead.

IDs and references are preserved. Category assignments and filter criteria contain their owning collection ID as well as the referenced IDs. Every reference must exist in the same collection. Icon strings and all vocabulary text are Unicode and are never converted into image filenames. The export is a database transaction snapshot. Restore is a complete replacement, after validation and confirmation; it is not a merge.

Old Ionic JSON files have no supported format identifier and are rejected. A future format change must explicitly add version handling rather than silently reinterpret existing records.
