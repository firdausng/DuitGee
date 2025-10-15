
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
    teamId: text('team_id'),
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
	categoryName: text('category_id').notNull(),
	userId: text('user_id'), // Optional - null means vault-level expense (e.g., family/shared expense)
	vaultId: text('vault_id').notNull().references(() => vaults.id, { onDelete: 'cascade' }), // required vault
	date: text('date').notNull().$defaultFn(() => formatISO(new UTCDate())), // ISO string format like audit fields
	// Payment information - references to payment tables
	paymentType: text('payment_type_id'),
	paymentProvider: text('payment_provider_id'),
    // Audit fields
    createdAt: text('created_at').$defaultFn(() => formatISO(new UTCDate())),
    createdBy: text('created_by').notNull(), // User ID as string, no FK constraint - who created the record (different from userId which is who the expense is for)
    updatedAt: text('updated_at').$defaultFn(() => formatISO(new UTCDate())),
    updatedBy: text('updated_by'), // User ID as string, no FK constraint
    deletedAt: text('deleted_at'),
    deletedBy: text('deleted_by'), // User ID as string, no FK constraint
});

// Expense templates - reusable expense configurations
export const expenseTemplates = sqliteTable('expense_templates', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	userId: text('user_id').notNull(), // Template creator/owner - never null
	vaultId: text('vault_id').notNull().references(() => vaults.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	description: text('description'),
	categoryName: text('category_id'),
	defaultAmount: real('default_amount'),
    paymentType: text('payment_type_id'),
    paymentProvider: text('payment_provider_id'),
	note: text('note'),
	icon: text('icon').default('📝'),
	iconType: text('icon_type').default('emoji'),
	defaultUserId: text('default_user_id'), // Who the expense should be assigned to: "__creator__", null (vault), or specific user ID
	// Usage tracking
	usageCount: integer('usage_count').notNull().default(0),
	lastUsedAt: text('last_used_at'),
	// Audit fields
	createdAt: text('created_at').$defaultFn(() => formatISO(new UTCDate())),
	createdBy: text('created_by').notNull(),
	updatedAt: text('updated_at').$defaultFn(() => formatISO(new UTCDate())),
	updatedBy: text('updated_by'),
	deletedAt: text('deleted_at'),
	deletedBy: text('deleted_by'),
});

