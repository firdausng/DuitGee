CREATE INDEX `idx_expense_templates_vault` ON `expense_templates` (`vault_id`);--> statement-breakpoint
CREATE INDEX `idx_expenses_vault` ON `expenses` (`vault_id`);--> statement-breakpoint
CREATE INDEX `idx_invitation_vault` ON `invitation` (`vault_id`);--> statement-breakpoint
CREATE INDEX `idx_member_vault` ON `vault_members` (`vault_id`);