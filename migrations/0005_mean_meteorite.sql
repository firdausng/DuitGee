CREATE TABLE `payment_providers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text,
	`icon` text DEFAULT '💳',
	`icon_type` text DEFAULT 'emoji',
	`color` text DEFAULT '#6B7280',
	`is_public` integer DEFAULT false NOT NULL,
	`vault_id` text,
	`user_id` text,
	`created_at` text,
	`created_by` text NOT NULL,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`vault_id`) REFERENCES `vaults`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `payment_types` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`icon` text DEFAULT '💳',
	`icon_type` text DEFAULT 'emoji',
	`is_public` integer DEFAULT true NOT NULL,
	`vault_id` text,
	`created_at` text,
	`created_by` text NOT NULL,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`vault_id`) REFERENCES `vaults`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_types_code_unique` ON `payment_types` (`code`);--> statement-breakpoint
ALTER TABLE `expense_templates` ADD `payment_type_id` text REFERENCES payment_types(id);--> statement-breakpoint
ALTER TABLE `expense_templates` ADD `payment_provider_id` text REFERENCES payment_providers(id);--> statement-breakpoint
ALTER TABLE `expense_templates` DROP COLUMN `payment_type`;--> statement-breakpoint
ALTER TABLE `expense_templates` DROP COLUMN `payment_provider`;--> statement-breakpoint
ALTER TABLE `expenses` ADD `payment_type_id` text REFERENCES payment_types(id);--> statement-breakpoint
ALTER TABLE `expenses` ADD `payment_provider_id` text REFERENCES payment_providers(id);--> statement-breakpoint
ALTER TABLE `expenses` DROP COLUMN `payment_type`;--> statement-breakpoint
ALTER TABLE `expenses` DROP COLUMN `payment_provider`;