import type { PageServerLoad } from './$types';
import { getExpensesByVault } from '$lib/server/api/expenses/handlers';
import { getCategories } from '$lib/server/api/categories/handlers';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, platform, locals }) => {
	if (platform === undefined) {
		throw new Error('No platform');
	}

	if (!locals.currentUser) {
		throw new Error('Not authenticated');
	}

	const { vaultId } = params;
	const client = drizzle(platform.env.DB, { schema });
    console.log('[Statistic]');
	// Fetch all expenses for the vault (with optional server-side filters)
	const expenses = await getExpensesByVault(
		vaultId,
		locals.currentUser.id,
		platform.env.DB,
		{
			limit: 10000 // Get all expenses for statistics
		}
	);
    console.log('[Statistic] expenses', expenses);

	// Get vault owner ID
	const vault = await client
		.select({
			ownerId: schema.vaults.ownerId
		})
		.from(schema.vaults)
		.where(eq(schema.vaults.id, vaultId))
		.limit(1);

    console.log('[Statistic] vault', vault);

	// Fetch vault members for member filter
	const vaultMembers = await client
		.select({
			userId: schema.vaultMembers.userId,
			role: schema.vaultMembers.role,
			status: schema.vaultMembers.status
		})
		.from(schema.vaultMembers)
		.where(
			and(
				eq(schema.vaultMembers.vaultId, vaultId),
				eq(schema.vaultMembers.status, 'active')
			)
		);


    console.log('[Statistic] vaultMembers', vaultMembers);
	// Combine owner and members, using Map to deduplicate by userId
	const membersMap = new Map();

	// Add owner first
	if (vault[0]) {
		membersMap.set(vault[0].ownerId, {
			userId: vault[0].ownerId,
			firstName: undefined,
			lastName: undefined,
			email: '',
			role: 'owner' as const,
			status: 'active' as const
		});
	}



	// Add other members (skip if already in map as owner)
	vaultMembers.forEach(m => {
		if (!membersMap.has(m.userId)) {
			membersMap.set(m.userId, {
				userId: m.userId,
				firstName: undefined,
				lastName: undefined,
				email: '',
				role: m.role,
				status: m.status
			});
		}
	});

	const allMembers = Array.from(membersMap.values());

	// Fetch categories and tags for filters
	const [categories] = await Promise.all([
		getCategories(),
	]);

	return {
		vaultId,
		expenses,
		categories,
		members: allMembers
	};
};
