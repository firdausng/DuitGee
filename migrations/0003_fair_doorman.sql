CREATE TABLE `invitation` (
	`id` text PRIMARY KEY NOT NULL,
	`vault_id` text NOT NULL,
	`role` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`inviter_id` text,
	FOREIGN KEY (`vault_id`) REFERENCES `vaults`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `vault_members` (
	`id` text PRIMARY KEY NOT NULL,
	`vault_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`invited_by` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text,
	`updated_at` text,
	FOREIGN KEY (`vault_id`) REFERENCES `vaults`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `expense_templates` DROP COLUMN `payment_type_id`;--> statement-breakpoint
ALTER TABLE `expenses` DROP COLUMN `payment_type_id`;--> statement-breakpoint
ALTER TABLE `vaults` DROP COLUMN `is_public`;--> statement-breakpoint
ALTER TABLE `vaults` DROP COLUMN `team_id`;