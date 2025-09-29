import { drizzle } from "drizzle-orm/d1";
import * as schema from "$lib/server/db/schema";
import { expenses, categories, categoryGroups, vaults, vaultMembers } from "$lib/server/db/schema";
import { and, eq, desc, sum, sql, or, isNull } from "drizzle-orm";
import { requireVaultPermission } from "$lib/server/utils/permissions";
import { initialAuditFields, updateAuditFields } from "$lib/server/utils/audit";
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
	const { page = 1, limit = 10, categoryId, startDate, endDate, vaultId } = options || {};
	const offset = (page - 1) * limit;

	// Build where clause for vault access control
	let whereClause;

	if (vaultId) {
		// For specific vault, check if user has access
		whereClause = and(
			eq(expenses.vaultId, vaultId),
			or(
				// Personal expenses in this vault
				eq(expenses.userId, userId),
				// Shared vault where user is owner
				eq(vaults.ownerId, userId),
				// Shared vault where user is an active member
				and(
					eq(vaultMembers.userId, userId),
					eq(vaultMembers.status, 'active')
				)
			)
		);
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
			// Vault expenses where user is an active member
			and(
				eq(vaultMembers.userId, userId),
				eq(vaultMembers.status, 'active')
			)
		);
	}

	if (categoryId) {
		whereClause = and(whereClause, eq(expenses.categoryId, categoryId));
	}
	if (startDate && endDate) {
		const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
		const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
		whereClause = and(
			whereClause,
			sql`${expenses.date} >= ${startTimestamp}`,
			sql`${expenses.date} <= ${endTimestamp}`
		);
	}

	const expensesList = await client
		.select()
		.from(expenses)
		.leftJoin(categories, eq(expenses.categoryId, categories.id))
		.leftJoin(categoryGroups, eq(categories.groupId, categoryGroups.id))
		.leftJoin(vaults, eq(expenses.vaultId, vaults.id))
		.leftJoin(vaultMembers, eq(vaults.id, vaultMembers.vaultId))
		.where(whereClause)
		.orderBy(desc(expenses.date))
		.limit(limit)
		.offset(offset);

	const totalCount = await client
		.select({ count: sql`count(*)` })
		.from(expenses)
		.leftJoin(vaults, eq(expenses.vaultId, vaults.id))
		.leftJoin(vaultMembers, eq(vaults.id, vaultMembers.vaultId))
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
			date: data.date ? new Date(data.date) : new Date(),
			...initialAuditFields({ userId })
		})
		.returning();

	return expense[0];
};

export const updateExpense = async (userId: string, vaultId: string, expenseId: string, data: any, db: D1Database) => {
	const client = drizzle(db, { schema });
	const { formatISO } = await import('date-fns');

	// Check if user has admin permissions to edit expenses
	await requireVaultPermission(userId, vaultId, 'canEditExpenses', db);

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
	const { startDate, endDate, vaultId } = options || {};

	// Build where clause for vault access
	let whereClause;

	if (vaultId) {
		whereClause = and(
			eq(expenses.vaultId, vaultId),
			// User must have access to this vault through membership or ownership
			or(
				eq(vaults.ownerId, userId),
				and(
					eq(vaultMembers.userId, userId),
					eq(vaultMembers.status, 'active')
				)
			)
		);
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
			and(
				eq(vaultMembers.userId, userId),
				eq(vaultMembers.status, 'active')
			)
		);
	}

	if (startDate && endDate) {
		const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
		const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);
		whereClause = and(
			whereClause,
			sql`${expenses.date} >= ${startTimestamp}`,
			sql`${expenses.date} <= ${endTimestamp}`
		);
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
		.leftJoin(vaultMembers, eq(vaults.id, vaultMembers.vaultId))
		.where(whereClause)
		.groupBy(categories.id);

	const totalAmount = summary.reduce((acc, item) => acc + item.total, 0);

	return {
		summary,
		totalAmount
	};
};