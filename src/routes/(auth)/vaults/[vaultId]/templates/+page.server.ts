import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '$lib/server/api/templates/handlers';
import { getTags } from '$lib/server/api/tags/handlers';
import { getCategories } from '$lib/server/api/categories/handlers';
import { getVault, getVaultMembers } from '$lib/server/api/vaults/handlers';
import { getPaymentTypes, getPaymentProviders } from '$lib/server/api/payments/handlers';

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

		// Load templates, tags (popular), categories, payment types, providers, and members
		const [templates, tags, categories, paymentTypes, paymentProviders, allMembers] = await Promise.all([
			getTemplates(locals.currentUser.id, vaultId, platform.env.DB),
			getTags(platform.env.DB, { limit: 100 }), // Get top 100 popular tags
			getCategories(vaultId, platform.env.DB),
			getPaymentTypes(platform.env.DB),
			getPaymentProviders(platform.env.DB),
			getVaultMembers(vaultId, platform.env.DB)
		]);

		return {
			vault: vault.vault,
			templates,
			tags,
			categories,
			paymentTypes,
			paymentProviders,
			members: allMembers,
			currentUserId: locals.currentUser.id
		};
	} catch (err) {
		console.error('Error loading templates:', err);
		throw error(500, 'Failed to load templates');
	}
};

export const actions = {
	create: async ({ locals, platform, request, params }) => {
		if (!platform?.env?.DB) {
			return { success: false, error: 'Database not available' };
		}

		if (!locals.currentUser) {
			return { success: false, error: 'Unauthorized' };
		}

		const { vaultId } = params;
		const formData = await request.formData();

		try {
			const tagNames = formData.get('tagNames')?.toString().split(',').filter(Boolean) || [];

			const defaultUserIdValue = formData.get('defaultUserId')?.toString();
			const template = await createTemplate(
				locals.currentUser.id,
				{
					vaultId,
					name: formData.get('name')?.toString() || '',
					description: formData.get('description')?.toString(),
					categoryId: formData.get('categoryId')?.toString(),
					defaultAmount: formData.get('defaultAmount') ? parseFloat(formData.get('defaultAmount')!.toString()) : undefined,
					paymentTypeId: formData.get('paymentTypeId')?.toString(),
					paymentProviderId: formData.get('paymentProviderId')?.toString(),
					note: formData.get('note')?.toString(),
					icon: formData.get('icon')?.toString() || '📝',
					iconType: formData.get('iconType')?.toString() || 'emoji',
					defaultUserId: defaultUserIdValue !== undefined ? (defaultUserIdValue || undefined) : undefined,
					tagNames
				},
				platform.env.DB
			);

			return { success: true, template };
		} catch (err) {
			console.error('Error creating template:', err);
			return { success: false, error: 'Failed to create template' };
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
		const templateId = formData.get('id')?.toString();

		if (!templateId) {
			return { success: false, error: 'Template ID required' };
		}

		try {
			const tagNames = formData.get('tagNames')?.toString().split(',').filter(Boolean) || [];

			const defaultUserIdValue = formData.get('defaultUserId')?.toString();
			const template = await updateTemplate(
				locals.currentUser.id,
				templateId,
				{
					name: formData.get('name')?.toString(),
					description: formData.get('description')?.toString(),
					categoryId: formData.get('categoryId')?.toString(),
					defaultAmount: formData.get('defaultAmount') ? parseFloat(formData.get('defaultAmount')!.toString()) : undefined,
					paymentTypeId: formData.get('paymentTypeId')?.toString(),
					paymentProviderId: formData.get('paymentProviderId')?.toString(),
					note: formData.get('note')?.toString(),
					icon: formData.get('icon')?.toString(),
					iconType: formData.get('iconType')?.toString(),
					defaultUserId: defaultUserIdValue !== undefined ? (defaultUserIdValue || undefined) : undefined,
					tagNames
				},
				platform.env.DB
			);

			return { success: true, template };
		} catch (err) {
			console.error('Error updating template:', err);
			return { success: false, error: 'Failed to update template' };
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
		const templateId = formData.get('id')?.toString();

		if (!templateId) {
			return { success: false, error: 'Template ID required' };
		}

		try {
			await deleteTemplate(locals.currentUser.id, templateId, platform.env.DB);
			return { success: true };
		} catch (err) {
			console.error('Error deleting template:', err);
			return { success: false, error: 'Failed to delete template' };
		}
	}
} satisfies Actions;
