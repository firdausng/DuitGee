ALTER TABLE `vaults` ADD `is_default` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_one_default_vault_per_user` ON `vaults` (`created_by`) WHERE "vaults"."is_default" = 1;