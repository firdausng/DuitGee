import { drizzle } from 'drizzle-orm/d1';
import * as schema from '$lib/server/db/schema';
import { expenseTemplates } from '$lib/server/db/schema';
import { eq, isNull, and } from 'drizzle-orm';
import type { GetExpenseTemplateQuery } from '$lib/schemas/expenseTemplates';
import { checkVaultPermission } from '$lib/server/utils/vaultPermissions';

export const getExpenseTemplate = async (
	session: App.AuthSession,
	query: GetExpenseTemplateQuery,
	env: Cloudflare.Env
) => {
	const client = drizzle(env.DB, { schema });
	const { vaultId, id } = query;

	// Check if user is a member of this vault
	const hasAccess = await checkVaultPermission(session.user.id, vaultId, 'canViewExpenses', env);
	if (!hasAccess) {
		throw new Error('You do not have access to this vault');
	}

	// Get the template
	const template = await client
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

	if (!template || template.length === 0) {
		throw new Error('Template not found');
	}

	return template[0];
};
