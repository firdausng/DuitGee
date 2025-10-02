PRAGMA foreign_keys=OFF;--> statement-breakpoint
-- Step 1: Recreate tags table first (with name as primary key)
CREATE TABLE `__new_tags` (
	`name` text PRIMARY KEY NOT NULL,
	`usage_count` integer DEFAULT 0 NOT NULL,
	`created_at` text,
	`created_by` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_tags`("name", "usage_count", "created_at", "created_by") SELECT "name", "usage_count", "created_at", "created_by" FROM `tags`;--> statement-breakpoint
DROP TABLE `tags`;--> statement-breakpoint
ALTER TABLE `__new_tags` RENAME TO `tags`;--> statement-breakpoint
-- Step 2: Recreate expense_tags with foreign key to tags.name
CREATE TABLE `__new_expense_tags` (
	`expense_id` text NOT NULL,
	`tag_name` text NOT NULL,
	`color` text DEFAULT '#6B7280' NOT NULL,
	`created_at` text,
	PRIMARY KEY(`expense_id`, `tag_name`),
	FOREIGN KEY (`expense_id`) REFERENCES `expenses`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_name`) REFERENCES `tags`(`name`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_expense_tags`("expense_id", "tag_name", "color", "created_at") SELECT "expense_id", "tag_name", "color", "created_at" FROM `expense_tags`;--> statement-breakpoint
DROP TABLE `expense_tags`;--> statement-breakpoint
ALTER TABLE `__new_expense_tags` RENAME TO `expense_tags`;--> statement-breakpoint
-- Step 3: Recreate expense_template_tags with foreign key to tags.name
CREATE TABLE `__new_expense_template_tags` (
	`template_id` text NOT NULL,
	`tag_name` text NOT NULL,
	`color` text DEFAULT '#6B7280' NOT NULL,
	`created_at` text,
	PRIMARY KEY(`template_id`, `tag_name`),
	FOREIGN KEY (`template_id`) REFERENCES `expense_templates`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_name`) REFERENCES `tags`(`name`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_expense_template_tags`("template_id", "tag_name", "color", "created_at") SELECT "template_id", "tag_name", "color", "created_at" FROM `expense_template_tags`;--> statement-breakpoint
DROP TABLE `expense_template_tags`;--> statement-breakpoint
ALTER TABLE `__new_expense_template_tags` RENAME TO `expense_template_tags`;--> statement-breakpoint
PRAGMA foreign_keys=ON;