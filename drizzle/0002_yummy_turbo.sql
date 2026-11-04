CREATE TABLE `term_audio` (
	`collection_id` integer NOT NULL,
	`term_id` integer PRIMARY KEY NOT NULL,
	`duration_ms` integer NOT NULL,
	`audio` blob NOT NULL,
	FOREIGN KEY (`collection_id`,`term_id`) REFERENCES `terms`(`collection_id`,`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "term_audio_duration" CHECK("term_audio"."duration_ms" > 0 AND "term_audio"."duration_ms" <= 7000),
	CONSTRAINT "term_audio_size" CHECK(length("term_audio"."audio") > 0 AND length("term_audio"."audio") <= 131072)
);
