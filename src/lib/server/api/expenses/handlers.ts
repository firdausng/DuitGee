import { drizzle } from "drizzle-orm/d1";
import * as schema from "$lib/server/db/schema";
import { expenses, categories, categoryGroups, vaults, vaultMembers, users } from "$lib/server/db/schema";
import { and, eq, desc, sum, sql, or, isNull } from "drizzle-orm";
import { requireVaultPermission } from "$lib/server/utils/permissions";
import { initialAuditFields, updateAuditFields } from "$lib/server/utils/audit";
import { formatISO } from "date-fns";
import type {
	ExpensesResponse,
	Expense,
	GetExpensesOptions,
	ExpensesSummary,
	GetExpensesSummaryOptions
} from "$lib/types/expenses";

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

	if (categoryId) {
		whereClause = and(whereClause, eq(expenses.categoryId, categoryId));
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
		.leftJoin(categories, eq(expenses.categoryId, categories.id))
		.leftJoin(categoryGroups, eq(categories.groupId, categoryGroups.id))
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
		category: row.categories?.id ? {
			id: row.categories.id,
			name: row.categories.name,
			color: row.categories.color,
			icon: row.categories.icon || undefined,
			iconType: (row.categories.iconType as 'emoji' | 'phosphor') || 'emoji',
			group: row.category_groups?.id ? {
				id: row.category_groups.id,
				name: row.category_groups.name,
				icon: row.category_groups.icon || undefined,
				iconType: (row.category_groups.iconType as 'emoji' | 'phosphor') || 'emoji',
				color: row.category_groups.color
			} : null
		} : null,
		creator: row.users?.id ? {
			id: row.users.id,
			firstName: row.users.firstName || undefined,
			lastName: row.users.lastName || undefined,
			email: row.users.email
		} : null
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
): Promise<Expense | undefined> => {
	const client = drizzle(db, { schema });

	// First get the expense to verify it belongs to the vault
	const expenseResult = await client
		.select()
		.from(expenses)
		.leftJoin(categories, eq(expenses.categoryId, categories.id))
		.leftJoin(categoryGroups, eq(categories.groupId, categoryGroups.id))
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

	const row = expenseResult[0];

	// Transform to match our Expense type
	return {
		id: row.expenses.id,
		note: row.expenses.note,
		amount: row.expenses.amount,
		date: row.expenses.date,
		createdAt: row.expenses.createdAt,
		vaultId: row.expenses.vaultId || undefined,
		vault: null, // Not included in this query
		category: row.categories?.id ? {
			id: row.categories.id,
			name: row.categories.name,
			color: row.categories.color,
			icon: row.categories.icon || undefined,
			iconType: (row.categories.iconType as 'emoji' | 'phosphor') || 'emoji',
			group: row.category_groups?.id ? {
				id: row.category_groups.id,
				name: row.category_groups.name,
				icon: row.category_groups.icon || undefined,
				iconType: (row.category_groups.iconType as 'emoji' | 'phosphor') || 'emoji',
				color: row.category_groups.color
			} : null
		} : null
	};
};

export const createExpense = async (userId: string, data: any, db: D1Database) => {
	const client = drizzle(db, { schema });

	// Check if user has permission to create expenses in this vault
	// Both members and admins can create expenses
	await requireVaultPermission(userId, data.vaultId, 'canCreateExpenses', db);

	const expense = await client
		.insert(expenses)
		.values({
			...data,
			userId,
			date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
			...initialAuditFields({ userId })
		})
		.returning();

	return expense[0];
};

export const updateExpense = async (userId: string, vaultId: string, expenseId: string, data: any, db: D1Database) => {
	const client = drizzle(db, { schema });

	// Check if user has admin permissions to edit expenses
	await requireVaultPermission(userId, vaultId, 'canEditExpenses', db);

	// Format date if provided
	const updateData = { ...data };
	if (updateData.date) {
		updateData.date = new Date(updateData.date).toISOString();
	}

	const updatedExpense = await client
		.update(expenses)
		.set({
			...updateData,
			...updateAuditFields({ userId })
		})
		.where(
			and(
				eq(expenses.id, expenseId),
				eq(expenses.vaultId, vaultId)
			)
		)
		.returning();

	return updatedExpense[0];
};

export const deleteExpense = async (userId: string, vaultId: string, expenseId: string, db: D1Database) => {
	const client = drizzle(db, { schema });

	// Check if user has admin permissions to delete expenses
	await requireVaultPermission(userId, vaultId, 'canDeleteExpenses', db);

	const deletedExpense = await client
		.delete(expenses)
		.where(
			and(
				eq(expenses.id, expenseId),
				eq(expenses.vaultId, vaultId)
			)
		)
		.returning();

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
			categoryName: categories.name,
			categoryColor: categories.color,
			total: sum(expenses.amount).mapWith(Number)
		})
		.from(expenses)
		.leftJoin(categories, eq(expenses.categoryId, categories.id))
		.leftJoin(vaults, eq(expenses.vaultId, vaults.id))
		.where(whereClause)
		.groupBy(categories.id);

	const totalAmount = summary.reduce((acc, item) => acc + item.total, 0);

	return {
		summary,
		totalAmount
	};
};

export const getMemberSpending = async (
	userId: string,
	db: D1Database,
	options?: GetExpensesSummaryOptions & { vaultId?: string }
): Promise<Array<{ userId: string; userName: string; totalAmount: number; expenseCount: number }>> => {
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

export const createExpenseByEmail = async (userEmail: string, data: any, db: D1Database) => {
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

	return createExpense(user[0].id, data, db);
};

export const updateExpenseByEmail = async (userEmail: string, vaultId: string, expenseId: string, data: any, db: D1Database) => {
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

	return updateExpense(user[0].id, vaultId, expenseId, data, db);
};

export const deleteExpenseByEmail = async (userEmail: string, vaultId: string, expenseId: string, db: D1Database) => {
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

	return deleteExpense(user[0].id, vaultId, expenseId, db);
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
): Promise<Array<{ userId: string; userName: string; totalAmount: number; expenseCount: number }>> => {
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