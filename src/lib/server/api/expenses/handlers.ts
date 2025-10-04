import {drizzle} from "drizzle-orm/d1";
import * as schema from "$lib/server/db/schema";
import {expenses, expenseTemplates, users, vaultMembers, vaults} from "$lib/server/db/schema";
import {and, desc, eq, isNull, or, sql, sum} from "drizzle-orm";
import {requireVaultPermission} from "$lib/server/utils/permissions";
import {initialAuditFields, updateAuditFields} from "$lib/server/utils/audit";
import {formatISO} from "date-fns";
import {invalidateExpenseCache, setExpenseCache} from "$lib/server/utils/kv-cache";
import {createId} from '@paralleldrive/cuid2';
import type {
    Expense,
    ExpensesResponse,
    ExpensesSummary,
    GetExpensesOptions,
    GetExpensesSummaryOptions
} from "$lib/types/expenses";
import {categoryData} from "$lib/configuration/categories";
import {paymentData} from "$lib/configuration/paymentTypes";
import type {CreateExpense, UpdateExpense} from "$lib/schemas/expense";


export const getExpenses = async (
	userId: string,
	db: D1Database,
	options?: GetExpensesOptions
): Promise<ExpensesResponse> => {
	const client = drizzle(db, { schema });
	const { page = 1, limit = 10, categoryId, startDate, endDate, vaultId, memberIds } = options || {};
	const offset = (page - 1) * limit;

	// Build where clause for vault access control
	let whereClause;

	if (vaultId) {
		// For specific vault, verify user has access first, then show ALL expenses in the vault
		const vaultAccess = await client
			.select({ id: vaults.id })
			.from(vaults)
			.leftJoin(vaultMembers, eq(vaults.id, vaultMembers.vaultId))
			.where(
				and(
					eq(vaults.id, vaultId),
					or(
						eq(vaults.ownerId, userId),
						and(
							eq(vaultMembers.userId, userId),
							eq(vaultMembers.status, 'active')
						)
					)
				)
			)
			.limit(1);

		if (vaultAccess.length === 0) {
			throw new Error('Access denied to this vault');
		}

		// Show all expenses in this vault (from any member)
		whereClause = eq(expenses.vaultId, vaultId);
	} else {
		// For all expenses, show personal expenses + vault expenses user has access to
		whereClause = or(
			// Personal expenses (no vault)
			and(
				eq(expenses.userId, userId),
				isNull(expenses.vaultId)
			),
			// Vault expenses where user is owner
			eq(vaults.ownerId, userId),
			// Vault expenses where user is an active member - use EXISTS subquery
			sql`EXISTS (
				SELECT 1 FROM vault_members vm
				WHERE vm.vault_id = ${expenses.vaultId}
				AND vm.user_id = ${userId}
				AND vm.status = 'active'
			)`
		);
	}

	if (startDate && endDate) {
		whereClause = and(
			whereClause,
			sql`${expenses.date} >= ${startDate}`,
			sql`${expenses.date} <= ${endDate}`
		);
	}
	if (memberIds && memberIds.length > 0) {
		// Filter by specific member IDs
		const memberConditions = memberIds.map(memberId => eq(expenses.userId, memberId));
		whereClause = and(whereClause, or(...memberConditions));
	}

	const expensesList = await client
		.select()
		.from(expenses)
		.leftJoin(vaults, eq(expenses.vaultId, vaults.id))
		.leftJoin(users, eq(expenses.userId, users.id))
		.where(whereClause)
		.orderBy(desc(expenses.date))
		.limit(limit)
		.offset(offset);

	const totalCount = await client
		.select({ count: sql`count(*)` })
		.from(expenses)
		.leftJoin(vaults, eq(expenses.vaultId, vaults.id))
		.where(whereClause);

	// Get all expense IDs to fetch tags
	// const expenseIds = expensesList.map(row => row.expenses.id);

	// Transform the raw data to match our Expense type
	const transformedExpenses: Expense[] = expensesList.map(row => ({
		id: row.expenses.id,
		note: row.expenses.note,
		amount: row.expenses.amount,
		date: row.expenses.date,
		createdAt: row.expenses.createdAt,
		vaultId: row.expenses.vaultId || undefined,
		vault: row.vaults?.id ? {
			id: row.vaults.id,
			name: row.vaults.name,
			color: row.vaults.color,
			icon: row.vaults.icon || undefined,
			iconType: (row.vaults.iconType as 'emoji' | 'phosphor') || 'emoji',
			isPersonal: row.vaults.isPersonal
		} : null,
        category: categoryData.categories.find(c => c.name === row.expenses.categoryName) || null,
		creator: row.users?.id ? {
			id: row.users.id,
			firstName: row.users.firstName || undefined,
			lastName: row.users.lastName || undefined,
			email: row.users.email
		} : null,
	}));

	return {
		expenses: transformedExpenses,
		pagination: {
			page,
			limit,
			total: totalCount[0].count as number,
			pages: Math.ceil((totalCount[0].count as number) / limit)
		}
	};
};

export const getExpense = async (
	vaultId: string,
	expenseId: string,
	db: D1Database
): Promise<any> => {
	const client = drizzle(db, { schema });

	// First get the expense to verify it belongs to the vault
	const expenseResult = await client
		.select()
		.from(expenses)
		// .leftJoin(schema.paymentTypes, eq(expenses.paymentTypeId, schema.paymentTypes.id))
		// .leftJoin(schema.paymentProviders, eq(expenses.paymentProviderId, schema.paymentProviders.id))
		.where(
			and(
				eq(expenses.id, expenseId),
				eq(expenses.vaultId, vaultId)
			)
		)
		.limit(1);

	if (!expenseResult[0]) {
		return undefined;
	}

    // expenseResult

	const row = expenseResult[0];

	// Transform to match our Expense type with additional fields
	return {
		id: row.id,
		note: row.note,
		amount: row.amount,
		date: row.date,
		createdAt: row.createdAt,
		vaultId: row.vaultId || undefined,
        paymentTypeName: row.paymentType,
        paymentProviderName: row.paymentProvider,
        paymentType: paymentData.paymentTypes.find(p => p.name === row.paymentType)?.code || null,
        paymentProvider: paymentData.paymentProviders.find(p => p.name === row.paymentProvider)?.name || null,
		vault: null, // Not included in this query
        category: categoryData.categories.find(c => c.name === row.categoryName) || null,
	};
};

export const createExpense = async (userId: string, data: CreateExpense, db: D1Database, kv?: KVNamespace) => {
	const client = drizzle(db, { schema });

	// Check if user has permission to create expenses in this vault
	// Both members and admins can create expenses
	await requireVaultPermission(userId, data.vaultId, 'canCreateExpenses', db);

	// Generate expense ID and prepare data
	const expenseId = createId();
	const { templateId, paymentType, paymentProvider, ...expenseFields } = data;

	const expenseData = {
		id: expenseId,
		...expenseFields,
		userId,
		categoryName: categoryData.categories.find(c => c.name === data.categoryName)?.name || null,
        paymentType: paymentData.paymentTypes.find(p => p.name === paymentType)?.name || null,
		paymentProvider: paymentData.paymentProviders.find(p => p.name === paymentProvider)?.name || null,
		date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
		...initialAuditFields({ userId })
	};

	// Write to KV cache first
	await setExpenseCache(expenseId, expenseData, kv);

	// Then write to database
	const expense = await client
		.insert(expenses)
		.values(expenseData)
		.returning();

	// Increment template usage if expense was created from a template
	if (templateId) {
		await client
			.update(expenseTemplates)
			.set({
				usageCount: sql`${expenseTemplates.usageCount} + 1`,
				lastUsedAt: formatISO(new Date())
			})
			.where(eq(expenseTemplates.id, templateId));
	}

	return expense[0];
};

export const updateExpense = async (userId: string, vaultId: string, expenseId: string, data: UpdateExpense, db: D1Database, kv?: KVNamespace) => {
	const client = drizzle(db, { schema });

	// Check if user has admin permissions to edit expenses
	await requireVaultPermission(userId, vaultId, 'canEditExpenses', db);

    data.date = data.date ? new Date(data.date).toISOString() : new Date().toISOString();

    
	const updatedExpense = await client
		.update(expenses)
		.set({
			...data,
			...updateAuditFields({ userId })
		})
		.where(
			and(
				eq(expenses.id, expenseId),
				eq(expenses.vaultId, vaultId)
			)
		)
		.returning();

	// Invalidate expense cache after update
	await invalidateExpenseCache(expenseId, kv);

	return updatedExpense[0];
};

export const deleteExpense = async (userId: string, vaultId: string, expenseId: string, db: D1Database, kv?: KVNamespace) => {
	const client = drizzle(db, { schema });

	// Check if user has admin permissions to delete expenses
	await requireVaultPermission(userId, vaultId, 'canDeleteExpenses', db);

	// Delete the expense
	const deletedExpense = await client
		.delete(expenses)
		.where(
			and(
				eq(expenses.id, expenseId),
				eq(expenses.vaultId, vaultId)
			)
		)
		.returning();

	// Invalidate expense cache after deletion
	await invalidateExpenseCache(expenseId, kv);

	return deletedExpense[0];
};

export const getExpensesSummary = async (
	userId: string,
	db: D1Database,
	options?: GetExpensesSummaryOptions & { vaultId?: string }
): Promise<ExpensesSummary> => {
	const client = drizzle(db, { schema });
	const { startDate, endDate, vaultId, memberIds } = options || {};

	// Build where clause for vault access
	let whereClause;

	if (vaultId) {
		// For specific vault, verify user has access first, then show ALL expenses in the vault
		const vaultAccess = await client
			.select({ id: vaults.id })
			.from(vaults)
			.leftJoin(vaultMembers, eq(vaults.id, vaultMembers.vaultId))
			.where(
				and(
					eq(vaults.id, vaultId),
					or(
						eq(vaults.ownerId, userId),
						and(
							eq(vaultMembers.userId, userId),
							eq(vaultMembers.status, 'active')
						)
					)
				)
			)
			.limit(1);

		if (vaultAccess.length === 0) {
			throw new Error('Access denied to this vault');
		}

		// Show all expenses in this vault (from any member)
		whereClause = eq(expenses.vaultId, vaultId);
	} else {
		// For all expenses accessible to the user
		whereClause = or(
			// Personal expenses (no vault)
			and(
				eq(expenses.userId, userId),
				isNull(expenses.vaultId)
			),
			// Vault expenses where user is owner
			eq(vaults.ownerId, userId),
			// Vault expenses where user is an active member
			sql`EXISTS (
				SELECT 1 FROM vault_members vm
				WHERE vm.vault_id = ${expenses.vaultId}
				AND vm.user_id = ${userId}
				AND vm.status = 'active'
			)`
		);
	}

	if (startDate && endDate) {
		whereClause = and(
			whereClause,
			sql`${expenses.date} >= ${startDate}`,
			sql`${expenses.date} <= ${endDate}`
		);
	}
	if (memberIds && memberIds.length > 0) {
		// Filter by specific member IDs
		const memberConditions = memberIds.map(memberId => eq(expenses.userId, memberId));
		whereClause = and(whereClause, or(...memberConditions));
	}

	const summary = await client
		.select({
            categoryName: expenses.categoryName,
			total: sum(expenses.amount).mapWith(Number)
		})
		.from(expenses)
		.leftJoin(vaults, eq(expenses.vaultId, vaults.id))
		.where(whereClause);

    const summaryWithCategoryData = summary.map(item => ({
        ...item,
        categoryColor: categoryData.categories.find(c => c.name === item.categoryName)?.color || '#6B7280'
    }))

	const totalAmount = summaryWithCategoryData.reduce((acc, item) => acc + item.total, 0);

	return {
		summary: summaryWithCategoryData,
		totalAmount
	};
};

export const getMemberSpending = async (
	userId: string,
	db: D1Database,
	options?: GetExpensesSummaryOptions & { vaultId?: string }
): Promise<Array<{ userId: string|null; userName: string|null; totalAmount: number; expenseCount: number }>> => {
	const client = drizzle(db, { schema });
	const { startDate, endDate, vaultId } = options || {};

	if (!vaultId) {
		return [];
	}

	// First verify user has access to the vault
	const vault = await client
		.select({ ownerId: vaults.ownerId })
		.from(vaults)
		.where(eq(vaults.id, vaultId))
		.limit(1);

	if (vault.length === 0) {
		throw new Error('Vault not found');
	}

	const isOwner = vault[0].ownerId === userId;

	if (!isOwner) {
		// Check if user is an active member
		const membership = await client
			.select()
			.from(vaultMembers)
			.where(
				and(
					eq(vaultMembers.vaultId, vaultId),
					eq(vaultMembers.userId, userId),
					eq(vaultMembers.status, 'active')
				)
			)
			.limit(1);

		if (membership.length === 0) {
			throw new Error('Access denied');
		}
	}

	// Build where clause for expenses - just filter by vault and date
	let whereClause = eq(expenses.vaultId, vaultId);

	if (startDate && endDate) {
		whereClause = and(
			whereClause,
			sql`${expenses.date} >= ${startDate}`,
			sql`${expenses.date} <= ${endDate}`
		);
	}

	const memberStats = await client
		.select({
			userId: expenses.userId,
			firstName: users.firstName,
			lastName: users.lastName,
			email: users.email,
			totalAmount: sum(expenses.amount).mapWith(Number),
			expenseCount: sql<number>`count(*)`.mapWith(Number)
		})
		.from(expenses)
		.leftJoin(users, eq(expenses.userId, users.id))
		.where(whereClause)
		.groupBy(expenses.userId, users.firstName, users.lastName, users.email);

	return memberStats.map(stat => ({
		userId: stat.userId,
		userName: stat.firstName && stat.lastName
			? `${stat.firstName} ${stat.lastName}`
			: stat.email,
		totalAmount: stat.totalAmount,
		expenseCount: stat.expenseCount
	}));
};

// Get expenses by vault ID (for statistics and analytics)
export interface GetExpensesByVaultOptions {
	limit?: number;
	categoryId?: string;
	tagName?: string;
	note?: string;
	startDate?: string;
	endDate?: string;
	memberIds?: string[];
}

export const getExpensesByVault = async (
	vaultId: string,
	userId: string,
	db: D1Database,
	options?: GetExpensesByVaultOptions
): Promise<Expense[]> => {
	const client = drizzle(db, { schema });
	const { limit = 10000, categoryId, note, startDate, endDate, memberIds } = options || {};

	// Verify user has access to the vault
	const vaultAccess = await client
		.select({ id: vaults.id })
		.from(vaults)
		.leftJoin(vaultMembers, eq(vaults.id, vaultMembers.vaultId))
		.where(
			and(
				eq(vaults.id, vaultId),
				or(
					eq(vaults.ownerId, userId),
					and(
						eq(vaultMembers.userId, userId),
						eq(vaultMembers.status, 'active')
					)
				)
			)
		)
		.limit(1);

	if (vaultAccess.length === 0) {
		throw new Error('Access denied to this vault');
	}

	// Build where clause
	let whereClause = eq(expenses.vaultId, vaultId);

	if (startDate && endDate) {
		whereClause = and(
			whereClause,
			sql`${expenses.date} >= ${startDate}`,
			sql`${expenses.date} <= ${endDate}`
		);
	}

	if (memberIds && memberIds.length > 0) {
		const memberConditions = memberIds.map(memberId => eq(expenses.userId, memberId));
		whereClause = and(whereClause, or(...memberConditions));
	}

	if (note) {
		whereClause = and(
			whereClause,
			sql`lower(${expenses.note}) like ${'%' + note.toLowerCase() + '%'}`
		);
	}

	// Fetch expenses
	const expensesList = await client
		.select()
		.from(expenses)
		// .leftJoin(categories, eq(expenses.categoryId, categories.id))
		// .leftJoin(categoryGroups, eq(categories.groupId, categoryGroups.id))
		.leftJoin(vaults, eq(expenses.vaultId, vaults.id))
		.leftJoin(users, eq(expenses.userId, users.id))
		.where(whereClause)
		.orderBy(desc(expenses.date))
		.limit(limit);

	// Transform the raw data to match our Expense type
    return expensesList.map(row => ({
        id: row.expenses.id,
        note: row.expenses.note,
        amount: row.expenses.amount,
        date: row.expenses.date,
        createdAt: row.expenses.createdAt,
        vaultId: row.expenses.vaultId || undefined,
        vault: row.vaults?.id ? {
            id: row.vaults.id,
            name: row.vaults.name,
            color: row.vaults.color,
            icon: row.vaults.icon || undefined,
            iconType: (row.vaults.iconType as 'emoji' | 'phosphor') || 'emoji',
            isPersonal: row.vaults.isPersonal
        } : null,
        category: categoryData.categories.find(c => c.name === row.expenses.categoryName) || null,
        creator: row.users?.id ? {
            id: row.users.id,
            firstName: row.users.firstName || undefined,
            lastName: row.users.lastName || undefined,
            email: row.users.email
        } : null,
    }));
};

// Email-based wrapper functions for API consistency
export const getExpensesByEmail = async (
	userEmail: string,
	db: D1Database,
	options?: GetExpensesOptions
): Promise<ExpensesResponse> => {
	const client = drizzle(db, { schema });

	// Find user by email first
	const user = await client
		.select({ id: users.id })
		.from(users)
		.where(eq(users.email, userEmail))
		.limit(1);

	if (user.length === 0) {
		throw new Error('User not found');
	}

	return getExpenses(user[0].id, db, options);
};

export const createExpenseByEmail = async (userEmail: string, data: any, db: D1Database, kv?: KVNamespace) => {
	const client = drizzle(db, { schema });

	// Find user by email first
	const user = await client
		.select({ id: users.id })
		.from(users)
		.where(eq(users.email, userEmail))
		.limit(1);

	if (user.length === 0) {
		throw new Error('User not found');
	}

	return createExpense(user[0].id, data, db, kv);
};

export const updateExpenseByEmail = async (userEmail: string, vaultId: string, expenseId: string, data: any, db: D1Database, kv?: KVNamespace) => {
	const client = drizzle(db, { schema });

	// Find user by email first
	const user = await client
		.select({ id: users.id })
		.from(users)
		.where(eq(users.email, userEmail))
		.limit(1);

	if (user.length === 0) {
		throw new Error('User not found');
	}

	return updateExpense(user[0].id, vaultId, expenseId, data, db, kv);
};

export const deleteExpenseByEmail = async (userEmail: string, vaultId: string, expenseId: string, db: D1Database, kv?: KVNamespace) => {
	const client = drizzle(db, { schema });

	// Find user by email first
	const user = await client
		.select({ id: users.id })
		.from(users)
		.where(eq(users.email, userEmail))
		.limit(1);

	if (user.length === 0) {
		throw new Error('User not found');
	}

	return deleteExpense(user[0].id, vaultId, expenseId, db, kv);
};

export const getExpensesSummaryByEmail = async (
	userEmail: string,
	db: D1Database,
	options?: GetExpensesSummaryOptions & { vaultId?: string }
): Promise<ExpensesSummary> => {
	const client = drizzle(db, { schema });

	// Find user by email first
	const user = await client
		.select({ id: users.id })
		.from(users)
		.where(eq(users.email, userEmail))
		.limit(1);

	if (user.length === 0) {
		throw new Error('User not found');
	}

	return getExpensesSummary(user[0].id, db, options);
};

export const getMemberSpendingByEmail = async (
	userEmail: string,
	db: D1Database,
	options?: GetExpensesSummaryOptions & { vaultId?: string }
): Promise<Array<{ userId: string|null; userName: string|null; totalAmount: number; expenseCount: number }>> => {
	const client = drizzle(db, { schema });

	// Find user by email first
	const user = await client
		.select({ id: users.id })
		.from(users)
		.where(eq(users.email, userEmail))
		.limit(1);

	if (user.length === 0) {
		throw new Error('User not found');
	}

	return getMemberSpending(user[0].id, db, options);
};