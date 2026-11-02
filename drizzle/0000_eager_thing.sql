CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`collection_id` integer NOT NULL,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "categories_kind" CHECK("categories"."kind" IN ('grammatical', 'thematic'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_collection_id_id` ON `categories` (`collection_id`,`id`);--> statement-breakpoint
CREATE INDEX `categories_collection_id` ON `categories` (`collection_id`);--> statement-breakpoint
CREATE TABLE `collections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`short_label` text,
	`icon` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `daily_picks` (
	`collection_id` integer NOT NULL,
	`local_date` text NOT NULL,
	`term_id` integer NOT NULL,
	`selected_at` text NOT NULL,
	PRIMARY KEY(`collection_id`, `local_date`),
	FOREIGN KEY (`collection_id`,`term_id`) REFERENCES `terms`(`collection_id`,`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `daily_picks_term` ON `daily_picks` (`collection_id`,`term_id`);--> statement-breakpoint
CREATE TABLE `preferences` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`selected_collection_id` integer,
	`locale` text DEFAULT 'system' NOT NULL,
	`appearance` text DEFAULT 'system' NOT NULL,
	`onboarding_complete` integer DEFAULT false NOT NULL,
	`term_view` text DEFAULT 'compact' NOT NULL,
	`sort_field` text DEFAULT 'original' NOT NULL,
	`sort_direction` text DEFAULT 'asc' NOT NULL,
	FOREIGN KEY (`selected_collection_id`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "preferences_singleton" CHECK("preferences"."id" = 1),
	CONSTRAINT "preferences_locale" CHECK("preferences"."locale" IN ('system', 'en', 'es')),
	CONSTRAINT "preferences_appearance" CHECK("preferences"."appearance" IN ('system', 'light', 'dark')),
	CONSTRAINT "preferences_view" CHECK("preferences"."term_view" IN ('compact', 'detailed')),
	CONSTRAINT "preferences_sort_field" CHECK("preferences"."sort_field" IN ('original', 'translation', 'updated')),
	CONSTRAINT "preferences_sort_direction" CHECK("preferences"."sort_direction" IN ('asc', 'desc'))
);
--> statement-breakpoint
CREATE TABLE `saved_filter_categories` (
	`collection_id` integer NOT NULL,
	`filter_id` integer NOT NULL,
	`category_id` integer NOT NULL,
	PRIMARY KEY(`filter_id`, `category_id`),
	FOREIGN KEY (`collection_id`,`filter_id`) REFERENCES `saved_filters`(`collection_id`,`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`collection_id`,`category_id`) REFERENCES `categories`(`collection_id`,`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `saved_filter_categories_category` ON `saved_filter_categories` (`collection_id`,`category_id`);--> statement-breakpoint
CREATE TABLE `saved_filters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`collection_id` integer NOT NULL,
	`name` text NOT NULL,
	`icon` text NOT NULL,
	`search` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `saved_filters_collection_id_id` ON `saved_filters` (`collection_id`,`id`);--> statement-breakpoint
CREATE INDEX `saved_filters_collection_id` ON `saved_filters` (`collection_id`);--> statement-breakpoint
CREATE TABLE `term_categories` (
	`collection_id` integer NOT NULL,
	`term_id` integer NOT NULL,
	`category_id` integer NOT NULL,
	PRIMARY KEY(`term_id`, `category_id`),
	FOREIGN KEY (`collection_id`,`term_id`) REFERENCES `terms`(`collection_id`,`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`collection_id`,`category_id`) REFERENCES `categories`(`collection_id`,`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `term_categories_category` ON `term_categories` (`collection_id`,`category_id`);--> statement-breakpoint
CREATE TABLE `terms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`collection_id` integer NOT NULL,
	`original` text NOT NULL,
	`translation` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `terms_collection_id_id` ON `terms` (`collection_id`,`id`);--> statement-breakpoint
CREATE INDEX `terms_collection_id` ON `terms` (`collection_id`);