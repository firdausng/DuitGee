CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text DEFAULT '#3B82F6' NOT NULL,
	`icon` text,
	`icon_type` text DEFAULT 'emoji',
	`group_id` text,
	`is_public` integer DEFAULT false NOT NULL,
	`vault_id` text,
	`created_at` text,
	`created_by` text NOT NULL,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`group_id`) REFERENCES `category_groups`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`vault_id`) REFERENCES `vaults`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `category_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`color` text DEFAULT '#3B82F6' NOT NULL,
	`icon` text DEFAULT '📂',
	`icon_type` text DEFAULT 'emoji',
	`is_public` integer DEFAULT false NOT NULL,
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
CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`amount` real NOT NULL,
	`category_id` text NOT NULL,
	`user_id` text NOT NULL,
	`vault_id` text NOT NULL,
	`date` integer NOT NULL,
	`created_at` text,
	`created_by` text NOT NULL,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`vault_id`) REFERENCES `vaults`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`first_name` text,
	`last_name` text,
	`name` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `vault_members` (
	`id` text PRIMARY KEY NOT NULL,
	`vault_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`permissions` text DEFAULT 'member' NOT NULL,
	`invited_by` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`invited_at` text,
	`joined_at` text,
	`created_at` text,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`vault_id`) REFERENCES `vaults`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `vaults` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`color` text DEFAULT '#3B82F6' NOT NULL,
	`icon` text DEFAULT '🏦',
	`icon_type` text DEFAULT 'emoji',
	`owner_id` text NOT NULL,
	`is_personal` integer DEFAULT true NOT NULL,
	`created_at` text,
	`created_by` text NOT NULL,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text
);
