import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import {getTags, getOrCreateTag, decrementTagUsage} from '$lib/server/api/tags/handlers';
import { getVault } from '$lib/server/api/vaults/handlers';

export const load: PageServerLoad = async ({ locals, platform, params }) => {
	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	if (!locals.currentUser) {
		throw error(401, 'Unauthorized');
	}

	const { vaultId } = params;

	try {
		// Get vault to verify access
		const vault = await getVault(locals.currentUser.id, vaultId, platform.env.DB);

		// Load tags
		const tags = await getTags(platform.env.DB);

		return {
			vault: vault.vault,
			tags
		};
	} catch (err) {
		console.error('Error loading tags:', err);
		throw error(500, 'Failed to load tags');
	}
};

export const actions = {
	default: async ({ locals, platform, request, params }) => {
		if (!platform?.env?.DB) {
			return { success: false, error: 'Database not available' };
		}

		if (!locals.currentUser) {
			return { success: false, error: 'Unauthorized' };
		}

		const { vaultId } = params;
		const formData = await request.formData();

		try {
			const tag = await getOrCreateTag(
                formData.get('name') as string,
				locals.currentUser.id,
				platform.env.DB
			);

			// Convert to plain object to avoid serialization issues
			return {
				success: true,
				tag
			};
		} catch (err) {
			console.error('Error creating tag:', err);
			return { success: false, error: 'Failed to create tag' };
		}
	},

	update: async ({ locals, platform, request, params }) => {
		if (!platform?.env?.DB) {
			return { success: false, error: 'Database not available' };
		}

		if (!locals.currentUser) {
			return { success: false, error: 'Unauthorized' };
		}

		const formData = await request.formData();
		const tagId = formData.get('id')?.toString();

		if (!tagId) {
			return { success: false, error: 'Tag ID required' };
		}

		try {
            const tag = await getOrCreateTag(
                formData.get('name') as string,
                locals.currentUser.id,
                platform.env.DB
            );


            return { success: true, tag };
		} catch (err) {
			console.error('Error updating tag:', err);
			return { success: false, error: 'Failed to update tag' };
		}
	},

	delete: async ({ locals, platform, request }) => {
		if (!platform?.env?.DB) {
			return { success: false, error: 'Database not available' };
		}

		if (!locals.currentUser) {
			return { success: false, error: 'Unauthorized' };
		}

		const formData = await request.formData();
		const tagName = formData.get('name')?.toString();

		if (!tagName) {
			return { success: false, error: 'Tag tagName required' };
		}

		try {
			await decrementTagUsage(tagName, platform.env.DB);
			return { success: true };
		} catch (err) {
			console.error('Error deleting tag:', err);
			return { success: false, error: 'Failed to delete tag' };
		}
	}
} satisfies Actions;
