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

	// Fetch all expenses for the vault (with optional server-side filters)
	const expenses = await getExpensesByVault(
		vaultId,
		locals.currentUser.id,
		platform.env.DB,
		{
			limit: 10000 // Get all expenses for statistics
		}
	);

	// Get vault owner
	const vault = await client
		.select({
			ownerId: schema.vaults.ownerId,
			ownerFirstName: schema.users.firstName,
			ownerLastName: schema.users.lastName,
			ownerEmail: schema.users.email
		})
		.from(schema.vaults)
		.leftJoin(schema.users, eq(schema.vaults.ownerId, schema.users.id))
		.where(eq(schema.vaults.id, vaultId))
		.limit(1);

	// Fetch vault members for member filter (excluding owner to avoid duplicates)
	const vaultMembers = await client
		.select({
			userId: schema.vaultMembers.userId,
			role: schema.vaultMembers.role,
			status: schema.vaultMembers.status,
			firstName: schema.users.firstName,
			lastName: schema.users.lastName,
			email: schema.users.email
		})
		.from(schema.vaultMembers)
		.leftJoin(schema.users, eq(schema.vaultMembers.userId, schema.users.id))
		.where(
			and(
				eq(schema.vaultMembers.vaultId, vaultId),
				eq(schema.vaultMembers.status, 'active')
			)
		);

	// Combine owner and members, using Map to deduplicate by userId
	const membersMap = new Map();

	// Add owner first
	if (vault[0]) {
		membersMap.set(vault[0].ownerId, {
			userId: vault[0].ownerId,
			firstName: vault[0].ownerFirstName || undefined,
			lastName: vault[0].ownerLastName || undefined,
			email: vault[0].ownerEmail || '',
			role: 'owner' as const,
			status: 'active' as const
		});
	}

	// Add other members (skip if already in map as owner)
	vaultMembers.forEach(m => {
		if (!membersMap.has(m.userId)) {
			membersMap.set(m.userId, {
				userId: m.userId,
				firstName: m.firstName || undefined,
				lastName: m.lastName || undefined,
				email: m.email || '',
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
