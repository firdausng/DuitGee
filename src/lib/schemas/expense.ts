import * as v from 'valibot';

export const expenseSchema = v.object({
	note: v.optional(v.string()),
	amount: v.pipe(v.number(), v.minValue(0.01, 'Amount must be positive')),
	categoryId: v.pipe(v.string(), v.minLength(1, 'Category is required')),
	//vaultId: v.pipe(v.string(), v.minLength(1, 'Vault is required')), // Required vault
	date: v.pipe(v.string(), v.isoDateTime())
});

export const categoryGroupSchema = v.object({
	name: v.pipe(v.string(), v.minLength(1, 'Name is required')),
	description: v.optional(v.string()),
	color: v.pipe(v.string(), v.regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')),
	icon: v.optional(v.string()),
	iconType: v.optional(v.picklist(['emoji', 'phosphor'])),
	vaultId: v.optional(v.string()) // Optional for public groups
});

export const categorySchema = v.object({
	name: v.pipe(v.string(), v.minLength(1, 'Name is required')),
	color: v.pipe(v.string(), v.regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')),
	icon: v.optional(v.string()),
	iconType: v.optional(v.picklist(['emoji', 'phosphor'])),
	groupId: v.optional(v.string()),
	vaultId: v.optional(v.string()) // Optional for public categories
});

export const userSchema = v.object({
	firstName: v.pipe(v.string(), v.minLength(1, 'First name is required')),
	lastName: v.pipe(v.string(), v.minLength(1, 'Last name is required')),
	email: v.pipe(v.string(), v.email('Please enter a valid email address'))
});

export const vaultSchema = v.object({
    name: v.pipe(v.string(), v.minLength(1, 'Name is required')),
    description: v.optional(v.string()),
	color: v.pipe(v.string(), v.regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')),
	icon: v.optional(v.string()),
	iconType: v.optional(v.picklist(['emoji', 'phosphor'])),
	isPersonal: v.optional(v.boolean())
});

export const vaultMemberSchema = v.object({
	email: v.pipe(v.string(), v.email('Please enter a valid email address')),
	role: v.pipe(v.string(), v.picklist(['member', 'admin']))
});

export type ExpenseSchema = typeof expenseSchema;
export type CategoryGroupSchema = typeof categoryGroupSchema;
export type CategorySchema = typeof categorySchema;
export type UserSchema = typeof userSchema;
export type VaultSchema = typeof vaultSchema;
export type VaultMemberSchema = typeof vaultMemberSchema;