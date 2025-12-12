ALTER TABLE `expense_templates` ADD `default_payment_type` text DEFAULT 'cash';--> statement-breakpoint
ALTER TABLE `expenses` ADD `payment_type` text DEFAULT 'cash' NOT NULL;