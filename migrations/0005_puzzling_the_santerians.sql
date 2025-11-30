PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_vault_members` (
	`id` text PRIMARY KEY NOT NULL,
	`vault_id` text NOT NULL,
	`user_id` text NOT NULL,
	`display_name` text,
	`role` text DEFAULT 'member' NOT NULL,
	`invited_by` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text,
	`updated_at` text,
	FOREIGN KEY (`vault_id`) REFERENCES `vaults`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_vault_members`("id", "vault_id", "user_id", "display_name", "role", "invited_by", "status", "created_at", "updated_at") SELECT "id", "vault_id", "user_id", "display_name", "role", "invited_by", "status", "created_at", "updated_at" FROM `vault_members`;--> statement-breakpoint
DROP TABLE `vault_members`;--> statement-breakpoint
ALTER TABLE `__new_vault_members` RENAME TO `vault_members`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `invitation` ADD `invitee_id` text;