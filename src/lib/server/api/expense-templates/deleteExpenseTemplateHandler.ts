import { drizzle } from 'drizzle-orm/d1';
import * as schema from '$lib/server/db/schema';
import { expenseTemplates } from '$lib/server/db/schema';
import { eq, isNull, and } from 'drizzle-orm';
import type { DeleteExpenseTemplateRequest } from '$lib/schemas/expenseTemplates';
import { deleteAuditFields } from '$lib/server/utils/audit';
import { requireVaultPermission } from '$lib/server/utils/vaultPermissions';

export const deleteExpenseTemplate = async (
	session: App.AuthSession,
	data: DeleteExpenseTemplateRequest,
	env: Cloudflare.Env
) => {
	const client = drizzle(env.DB, { schema });
	const { id, vaultId } = data;

	// Check if user has permission to delete templates in this vault
	await requireVaultPermission(session, vaultId, 'canDeleteExpenses', env);

	// Check if template exists
	const existingTemplate = await client
		.select()
		.from(expenseTemplates)
		.where(
			and(
				eq(expenseTemplates.id, id),
				eq(expenseTemplates.vaultId, vaultId),
				isNull(expenseTemplates.deletedAt)
			)
		)
		.limit(1);

	if (!existingTemplate || existingTemplate.length === 0) {
		throw new Error('Template not found');
	}

	// Soft delete the template
	const [deletedTemplate] = await client
		.update(expenseTemplates)
		.set({
			...deleteAuditFields({ userId: session.user.id })
		})
		.where(eq(expenseTemplates.id, id))
		.returning();

	return deletedTemplate;
};
