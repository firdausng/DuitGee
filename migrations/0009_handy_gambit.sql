PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_expense_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`vault_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category_id` text,
	`default_amount` real,
	`payment_type_id` text,
	`payment_provider_id` text,
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
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`payment_type_id`) REFERENCES `payment_types`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`payment_provider_id`) REFERENCES `payment_providers`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_expense_templates`("id", "user_id", "vault_id", "name", "description", "category_id", "default_amount", "payment_type_id", "payment_provider_id", "note", "icon", "icon_type", "usage_count", "last_used_at", "created_at", "created_by", "updated_at", "updated_by", "deleted_at", "deleted_by") SELECT "id", "user_id", "vault_id", "name", "description", "category_id", "default_amount", "payment_type_id", "payment_provider_id", "note", "icon", "icon_type", "usage_count", "last_used_at", "created_at", "created_by", "updated_at", "updated_by", "deleted_at", "deleted_by" FROM `expense_templates`;--> statement-breakpoint
DROP TABLE `expense_templates`;--> statement-breakpoint
ALTER TABLE `__new_expense_templates` RENAME TO `expense_templates`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`description` text,
	`amount` real NOT NULL,
	`category_id` text NOT NULL,
	`user_id` text,
	`vault_id` text NOT NULL,
	`date` text NOT NULL,
	`payment_type_id` text,
	`payment_provider_id` text,
	`created_at` text,
	`created_by` text NOT NULL,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`vault_id`) REFERENCES `vaults`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`payment_type_id`) REFERENCES `payment_types`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`payment_provider_id`) REFERENCES `payment_providers`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_expenses`("id", "description", "amount", "category_id", "user_id", "vault_id", "date", "payment_type_id", "payment_provider_id", "created_at", "created_by", "updated_at", "updated_by", "deleted_at", "deleted_by") SELECT "id", "description", "amount", "category_id", "user_id", "vault_id", "date", "payment_type_id", "payment_provider_id", "created_at", "created_by", "updated_at", "updated_by", "deleted_at", "deleted_by" FROM `expenses`;--> statement-breakpoint
DROP TABLE `expenses`;--> statement-breakpoint
ALTER TABLE `__new_expenses` RENAME TO `expenses`;