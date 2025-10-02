CREATE TABLE `expense_tags` (
	`expense_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`created_at` text,
	FOREIGN KEY (`expense_id`) REFERENCES `expenses`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `expense_template_tags` (
	`template_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`created_at` text,
	FOREIGN KEY (`template_id`) REFERENCES `expense_templates`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `expense_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`vault_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category_id` text,
	`default_amount` real,
	`payment_type` text,
	`payment_provider` text,
	`note` text,
	`icon` text DEFAULT '📝',
	`icon_type` text DEFAULT 'emoji',
	`usage_count` integer DEFAULT 0 NOT NULL,
	`last_used_at` text,
	`created_at` text,
	`created_by` text NOT NULL,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`vault_id`) REFERENCES `vaults`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`vault_id` text NOT NULL,
	`name` text NOT NULL,
	`color` text DEFAULT '#6B7280' NOT NULL,
	`icon` text,
	`icon_type` text DEFAULT 'emoji',
	`created_at` text,
	`created_by` text NOT NULL,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`vault_id`) REFERENCES `vaults`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `expenses` ADD `payment_type` text;--> statement-breakpoint
ALTER TABLE `expenses` ADD `payment_provider` text;