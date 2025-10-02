import { sqliteTable, integer, text, real, primaryKey } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';
import { UTCDate } from "@date-fns/utc";
import { formatISO } from "date-fns";

export const users = sqliteTable('users', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	email: text('email').notNull().unique(),
	firstName: text('first_name'),
	lastName: text('last_name'),
	name: text('name'), // Full name or display name
    createdAt: text('created_at').$defaultFn(() => formatISO(new UTCDate())),
    updatedAt: text('updated_at').$defaultFn(() => formatISO(new UTCDate())),
    deletedAt: text('deleted_at'),
});

export const categoryGroups = sqliteTable('category_groups', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	name: text('name').notNull(),
	description: text('description'),
	color: text('color').notNull().default('#3B82F6'),
	icon: text('icon').default('📂'),
	iconType: text('icon_type').default('emoji'), // 'emoji' or 'phosphor'
	isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
	vaultId: text('vault_id').references(() => vaults.id, { onDelete: 'cascade' }), // null for public groups
    // Audit fields
    createdAt: text('created_at').$defaultFn(() => formatISO(new UTCDate())),
    createdBy: text('created_by').notNull(), // User ID as string, no FK constraint
    updatedAt: text('updated_at').$defaultFn(() => formatISO(new UTCDate())),
    updatedBy: text('updated_by'), // User ID as string, no FK constraint
    deletedAt: text('deleted_at'),
    deletedBy: text('deleted_by'), // User ID as string, no FK constraint
});

export const categories = sqliteTable('categories', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	name: text('name').notNull(),
	description: text('description'),
	keywords: text('keywords'), // Comma-separated search keywords/tags
	color: text('color').notNull().default('#3B82F6'),
	icon: text('icon'),
	iconType: text('icon_type').default('emoji'), // 'emoji' or 'phosphor'
	groupId: text('group_id').references(() => categoryGroups.id, { onDelete: 'set null' }),
	isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
	vaultId: text('vault_id').references(() => vaults.id, { onDelete: 'cascade' }), // null for public categories
    // Audit fields
    createdAt: text('created_at').$defaultFn(() => formatISO(new UTCDate())),
    createdBy: text('created_by').notNull(), // User ID as string, no FK constraint
    updatedAt: text('updated_at').$defaultFn(() => formatISO(new UTCDate())),
    updatedBy: text('updated_by'), // User ID as string, no FK constraint
    deletedAt: text('deleted_at'),
    deletedBy: text('deleted_by'), // User ID as string, no FK constraint
});

// Vaults - shared expense containers
export const vaults = sqliteTable('vaults', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	name: text('name').notNull(),
	description: text('description'),
	color: text('color').notNull().default('#3B82F6'),
	icon: text('icon').default('🏦'),
	iconType: text('icon_type').default('emoji'), // 'emoji' or 'phosphor'
	ownerId: text('owner_id').notNull(), // User ID as string, no FK constraint for microservice compatibility
	isPersonal: integer('is_personal', { mode: 'boolean' }).notNull().default(true), // false for shared vaults
    // Audit fields
    createdAt: text('created_at').$defaultFn(() => formatISO(new UTCDate())),
    createdBy: text('created_by').notNull(), // User ID as string, no FK constraint
    updatedAt: text('updated_at').$defaultFn(() => formatISO(new UTCDate())),
    updatedBy: text('updated_by'), // User ID as string, no FK constraint
    deletedAt: text('deleted_at'),
    deletedBy: text('deleted_by'), // User ID as string, no FK constraint
});

// Vault members - who has access to which vaults
export const vaultMembers = sqliteTable('vault_members', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	vaultId: text('vault_id').notNull().references(() => vaults.id, { onDelete: 'cascade' }),
	userId: text('user_id').notNull(), // User ID as string, no FK constraint for microservice compatibility
	role: text('role').notNull().default('member'), // 'owner', 'admin', 'member'
	permissions: text('permissions').notNull().default('member'), // 'owner', 'admin', 'member'
	invitedBy: text('invited_by'), // User ID as string, no FK constraint
	status: text('status').notNull().default('pending'), // 'pending', 'active', 'declined', 'removed'
    // Audit fields
    invitedAt: text('invited_at').$defaultFn(() => formatISO(new UTCDate())),
    joinedAt: text('joined_at'),
    createdAt: text('created_at').$defaultFn(() => formatISO(new UTCDate())),
    updatedAt: text('updated_at').$defaultFn(() => formatISO(new UTCDate())),
    updatedBy: text('updated_by'), // User ID as string, no FK constraint
    deletedAt: text('deleted_at'),
    deletedBy: text('deleted_by'), // User ID as string, no FK constraint
});

export const expenses = sqliteTable('expenses', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	note: text('description'),
	amount: real('amount').notNull(),
	categoryId: text('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
	userId: text('user_id').notNull(), // User ID as string, no FK constraint for microservice compatibility
	vaultId: text('vault_id').notNull().references(() => vaults.id, { onDelete: 'cascade' }), // required vault
	date: text('date').notNull().$defaultFn(() => formatISO(new Date())), // ISO string format like audit fields
	// Payment information - references to payment tables
	paymentTypeId: text('payment_type_id').references(() => paymentTypes.id, { onDelete: 'set null' }),
	paymentProviderId: text('payment_provider_id').references(() => paymentProviders.id, { onDelete: 'set null' }),
    // Audit fields
    createdAt: text('created_at').$defaultFn(() => formatISO(new Date())),
    createdBy: text('created_by').notNull(), // User ID as string, no FK constraint
    updatedAt: text('updated_at').$defaultFn(() => formatISO(new Date())),
    updatedBy: text('updated_by'), // User ID as string, no FK constraint
    deletedAt: text('deleted_at'),
    deletedBy: text('deleted_by'), // User ID as string, no FK constraint
});

// Tags - Twitter-style flexible labeling (case-insensitive, auto-created)
export const tags = sqliteTable('tags', {
	name: text('name').primaryKey(), // Lowercase, normalized (e.g., "travel")
	usageCount: integer('usage_count').notNull().default(0),
	createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
	createdBy: text('created_by').notNull(), // First user who used it
});

// Junction table for many-to-many relationship between expenses and tags
export const expenseTags = sqliteTable('expense_tags', {
	expenseId: text('expense_id').notNull().references(() => expenses.id, { onDelete: 'cascade' }),
	tagName: text('tag_name').notNull().references(() => tags.name, { onDelete: 'cascade' }),
    color: text('color').notNull().default('#6B7280'), // Per-expense tag color customization
	createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
}, (table) => ({
	// Composite primary key to prevent duplicate tags on same expense
	pk: primaryKey({ columns: [table.expenseId, table.tagName] }),
}));

// Expense templates - reusable expense configurations
export const expenseTemplates = sqliteTable('expense_templates', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	userId: text('user_id').notNull(), // User ID as string, no FK constraint
	vaultId: text('vault_id').notNull().references(() => vaults.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	description: text('description'),
	categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
	defaultAmount: real('default_amount'),
	paymentTypeId: text('payment_type_id').references(() => paymentTypes.id, { onDelete: 'set null' }),
	paymentProviderId: text('payment_provider_id').references(() => paymentProviders.id, { onDelete: 'set null' }),
	note: text('note'),
	icon: text('icon').default('📝'),
	iconType: text('icon_type').default('emoji'),
	// Usage tracking
	usageCount: integer('usage_count').notNull().default(0),
	lastUsedAt: text('last_used_at'),
	// Audit fields
	createdAt: text('created_at').$defaultFn(() => formatISO(new Date())),
	createdBy: text('created_by').notNull(),
	updatedAt: text('updated_at').$defaultFn(() => formatISO(new Date())),
	updatedBy: text('updated_by'),
	deletedAt: text('deleted_at'),
	deletedBy: text('deleted_by'),
});

// Junction table for template tags
export const expenseTemplateTags = sqliteTable('expense_template_tags', {
	templateId: text('template_id').notNull().references(() => expenseTemplates.id, { onDelete: 'cascade' }),
    tagName: text('tag_name').notNull().references(() => tags.name, { onDelete: 'cascade' }),
    color: text('color').notNull().default('#6B7280'),
	createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
}, (table) => ({
	// Composite primary key to prevent duplicate tags on same template
	pk: primaryKey({ columns: [table.templateId, table.tagName] }),
}));

// Payment types table
export const paymentTypes = sqliteTable('payment_types', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	code: text('code').notNull().unique(), // e.g., 'cash', 'e_wallet', 'credit_card'
	name: text('name').notNull(), // Display name, e.g., 'Cash', 'E-Wallet'
	icon: text('icon').default('💳'),
	iconType: text('icon_type').default('emoji'),
	isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(true), // Public types available to all
	vaultId: text('vault_id').references(() => vaults.id, { onDelete: 'cascade' }), // null for public types
	// Audit fields
	createdAt: text('created_at').$defaultFn(() => formatISO(new Date())),
	createdBy: text('created_by').notNull(),
	updatedAt: text('updated_at').$defaultFn(() => formatISO(new Date())),
	updatedBy: text('updated_by'),
	deletedAt: text('deleted_at'),
	deletedBy: text('deleted_by'),
});

// Payment providers table
export const paymentProviders = sqliteTable('payment_providers', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	name: text('name').notNull(), // e.g., 'GoPay', 'OVO', 'BCA'
	type: text('type'), // Optional: 'e_wallet', 'bank', etc. for filtering
	icon: text('icon').default('💳'),
	iconType: text('icon_type').default('emoji'),
	color: text('color').default('#6B7280'),
	isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false), // Public providers available to all
	vaultId: text('vault_id').references(() => vaults.id, { onDelete: 'cascade' }), // null for public providers
	userId: text('user_id'), // User who created custom provider
	// Audit fields
	createdAt: text('created_at').$defaultFn(() => formatISO(new Date())),
	createdBy: text('created_by').notNull(),
	updatedAt: text('updated_at').$defaultFn(() => formatISO(new Date())),
	updatedBy: text('updated_by'),
	deletedAt: text('deleted_at'),
	deletedBy: text('deleted_by'),
});
