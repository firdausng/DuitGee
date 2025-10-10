import { drizzle } from "drizzle-orm/d1";
import * as schema from "$lib/server/db/schema";
import { expenseTemplates } from "$lib/server/db/schema";
import { and, eq, desc, isNull, sql } from "drizzle-orm";
import { initialAuditFields, updateAuditFields } from "$lib/server/utils/audit";
import { createId } from '@paralleldrive/cuid2';
import type {CreateExpenseTemplate, ExpenseTemplate, UpdateExpenseTemplate} from "$lib/schemas/expense";
import {requireVaultPermission} from "$lib/server/utils/permissions";

export const getTemplates = async (
	vaultId: string,
	db: D1Database
): Promise<ExpenseTemplate[]> => {
	const client = drizzle(db, { schema });

	// Get templates with category - show ALL templates in the vault ordered by usage
	const templatesList = await client
		.select()
		.from(expenseTemplates)
		.where(
			and(
				eq(expenseTemplates.vaultId, vaultId),
				isNull(expenseTemplates.deletedAt)
			)
		)
		.orderBy(desc(expenseTemplates.usageCount), desc(expenseTemplates.lastUsedAt));

	return templatesList;
};

export const getTemplate = async (
	templateId: string,
    vaultId: string,
	db: D1Database
): Promise<ExpenseTemplate | undefined> => {
	const client = drizzle(db, { schema });

	// Get template without userId filter - any vault member can view templates
	const result = await client
		.select()
		.from(expenseTemplates)
		.where(
			and(
				eq(expenseTemplates.id, templateId),
				eq(expenseTemplates.vaultId, vaultId),
				isNull(expenseTemplates.deletedAt)
			)
		)
		.limit(1);

	if (!result[0]) return undefined;

	return result[0];
};

export const createTemplate = async (
	data: CreateExpenseTemplate,
	db: D1Database
) => {
    // console.log('[createTemplate] data:', data);
	const client = drizzle(db, { schema });
    console.log('[createTemplate] data:', data);
    await requireVaultPermission(data.userId, data.vaultId, 'canCreateTemplateExpenses', db);
	const templateId = createId();

	const template = await client
		.insert(expenseTemplates)
		.values({
			id: templateId,
			...data,
			...initialAuditFields({ userId: data.userId })
		})
		.returning();

	return template[0];
};

export const updateTemplate = async (
	updaterUserId: string,
	templateId: string,
    vaultId: string,
	data: UpdateExpenseTemplate,
	db: D1Database
) => {
	const client = drizzle(db, { schema });

    await requireVaultPermission(updaterUserId, vaultId, 'canEditTemplateExpenses', db);

	const updatedTemplate = await client
		.update(expenseTemplates)
		.set({
			...data,
			...updateAuditFields({ userId: updaterUserId })
		})
		.where(
			and(
				eq(expenseTemplates.id, templateId),
				isNull(expenseTemplates.deletedAt)
			)
		)
		.returning();
	return updatedTemplate[0];
};

export const deleteTemplate = async (
	userId: string,
	templateId: string,
    vaulId: string,
	db: D1Database
) => {
	const client = drizzle(db, { schema });

    await requireVaultPermission(userId, vaulId, 'canDeleteTemplateExpenses', db);
	// Soft delete template
	const deletedTemplate = await client
		.update(expenseTemplates)
		.set({
			deletedAt: new Date().toISOString(),
			deletedBy: userId
		})
		.where(
			and(
				eq(expenseTemplates.id, templateId),
				eq(expenseTemplates.userId, userId)
			)
		)
		.returning();

    console.log('[deleteTemplate] deletedTemplate:', deletedTemplate);

	return deletedTemplate[0];
};

export const incrementTemplateUsage = async (
	templateId: string,
	db: D1Database
) => {
	const client = drizzle(db, { schema });

	await client
		.update(expenseTemplates)
		.set({
			usageCount: sql`${expenseTemplates.usageCount} + 1`,
			lastUsedAt: new Date().toISOString()
		})
		.where(eq(expenseTemplates.id, templateId));
};
