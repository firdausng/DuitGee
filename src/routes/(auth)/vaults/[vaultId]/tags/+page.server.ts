import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getTags, createTag, updateTag, deleteTag } from '$lib/server/api/tags/handlers';
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
		const tags = await getTags(vaultId, platform.env.DB);

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
			const tag = await createTag(
				locals.currentUser.id,
				{
					vaultId,
					name: formData.get('name')?.toString() || '',
					color: formData.get('color')?.toString() || '#6B7280',
					icon: formData.get('icon')?.toString(),
					iconType: formData.get('iconType')?.toString() || 'emoji'
				},
				platform.env.DB
			);

			// Convert to plain object to avoid serialization issues
			return {
				success: true,
				tag: {
					id: tag.id,
					vaultId: tag.vaultId,
					name: tag.name,
					color: tag.color,
					icon: tag.icon,
					iconType: tag.iconType,
					createdAt: tag.createdAt,
					createdBy: tag.createdBy,
					updatedAt: tag.updatedAt,
					updatedBy: tag.updatedBy,
					deletedAt: tag.deletedAt,
					deletedBy: tag.deletedBy
				}
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
			const tag = await updateTag(
				locals.currentUser.id,
				tagId,
				{
					name: formData.get('name')?.toString(),
					color: formData.get('color')?.toString(),
					icon: formData.get('icon')?.toString(),
					iconType: formData.get('iconType')?.toString()
				},
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
		const tagId = formData.get('id')?.toString();

		if (!tagId) {
			return { success: false, error: 'Tag ID required' };
		}

		try {
			await deleteTag(locals.currentUser.id, tagId, platform.env.DB);
			return { success: true };
		} catch (err) {
			console.error('Error deleting tag:', err);
			return { success: false, error: 'Failed to delete tag' };
		}
	}
} satisfies Actions;
