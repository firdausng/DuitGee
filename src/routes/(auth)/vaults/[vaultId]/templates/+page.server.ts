import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '$lib/server/api/templates/handlers';
import { getCategories } from '$lib/server/api/categories/handlers';
import { getVault, getVaultMembers } from '$lib/server/api/vaults/handlers';
import {getConfigurations} from "$lib/server/api/app-configurations/handlers";
import {superValidate} from "sveltekit-superforms";
import {valibot} from "sveltekit-superforms/adapters";
import {createExpenseTemplateSchema, updateExpenseTemplateSchema, updateVaultSchema} from "$lib/schemas/expense";

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
		const [templates, configurations, allMembers] = await Promise.all([
			getTemplates(vaultId, platform.env.DB),
            getConfigurations(),
			getVaultMembers(vaultId, platform.env.DB)
		]);

		return {
			vault: vault.vault,
			templates,
			categories: configurations.categoryData.categories,
			paymentTypes: configurations.paymentData.paymentTypes,
			paymentProviders: configurations.paymentData.paymentProviders,
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
        const form = await superValidate(request, valibot(createExpenseTemplateSchema));

        if (!form.valid) {
            return { form };
        }

        console.log('[create template]', locals.currentUser, form.data);
		try {
			const template = await createTemplate(
                form.data,
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

        let { vaultId } = params;

        const form = await superValidate(request, valibot(updateExpenseTemplateSchema));

        console.log('form', form);
        if (!form.valid) {
            return { form };
        }

		try {

			const template = await updateTemplate(
				locals.currentUser.id,
                form.data.templateId,
                vaultId,
				form.data,
				platform.env.DB
			);

			return { success: true, template };
		} catch (err) {
			console.error('Error updating template:', err);
			return { success: false, error: 'Failed to update template' };
		}
	},

	delete: async ({ locals, platform, request, params }) => {
		if (!platform?.env?.DB) {
			return { success: false, error: 'Database not available' };
		}

		if (!locals.currentUser) {
			return { success: false, error: 'Unauthorized' };
		}

        let { vaultId} = params;

		const formData = await request.formData();
		const templateId = formData.get('id')?.toString();

		if (!templateId) {
			return { success: false, error: 'Template ID required' };
		}

		try {
			await deleteTemplate(locals.currentUser.id, templateId, vaultId, platform.env.DB);
			return { success: true };
		} catch (err) {
			console.error('Error deleting template:', err);
			return { success: false, error: 'Failed to delete template' };
		}
	}
} satisfies Actions;
