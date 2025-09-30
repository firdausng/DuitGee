import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';
import { formatISO } from 'date-fns';

export const users = sqliteTable('users', {
	id: text('id').primaryKey().$defaultFn(() => createId()),
	email: text('email').notNull().unique(),
	firstName: text('first_name'),
	lastName: text('last_name'),
	name: text('name'), // Full name or display name
    createdAt: text('created_at').$defaultFn(() => formatISO(new Date())),
    updatedAt: text('updated_at').$defaultFn(() => formatISO(new Date())),
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
    createdAt: text('created_at').$defaultFn(() => formatISO(new Date())),
    createdBy: text('created_by').notNull(), // User ID as string, no FK constraint
    updatedAt: text('updated_at').$defaultFn(() => formatISO(new Date())),
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
    createdAt: text('created_at').$defaultFn(() => formatISO(new Date())),
    createdBy: text('created_by').notNull(), // User ID as string, no FK constraint
    updatedAt: text('updated_at').$defaultFn(() => formatISO(new Date())),
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
    createdAt: text('created_at').$defaultFn(() => formatISO(new Date())),
    createdBy: text('created_by').notNull(), // User ID as string, no FK constraint
    updatedAt: text('updated_at').$defaultFn(() => formatISO(new Date())),
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
    invitedAt: text('invited_at').$defaultFn(() => formatISO(new Date())),
    joinedAt: text('joined_at'),
    createdAt: text('created_at').$defaultFn(() => formatISO(new Date())),
    updatedAt: text('updated_at').$defaultFn(() => formatISO(new Date())),
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
    // Audit fields
    createdAt: text('created_at').$defaultFn(() => formatISO(new Date())),
    createdBy: text('created_by').notNull(), // User ID as string, no FK constraint
    updatedAt: text('updated_at').$defaultFn(() => formatISO(new Date())),
    updatedBy: text('updated_by'), // User ID as string, no FK constraint
    deletedAt: text('deleted_at'),
    deletedBy: text('deleted_by'), // User ID as string, no FK constraint
});
