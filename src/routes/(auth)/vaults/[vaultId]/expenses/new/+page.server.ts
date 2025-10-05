import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import {createExpenseSchema, expenseSchema} from '$lib/schemas/expense';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from "./$types";
import {createExpense} from "$lib/server/api/expenses/handlers";
import {getTemplates} from "$lib/server/api/templates/handlers";
import {getVaultMembers} from "$lib/server/api/vaults/handlers";
import {getConfigurations} from "$lib/server/api/app-configurations/handlers";

export const load: PageServerLoad = async ({platform, locals, params, url}) => {
    if(platform === undefined){
        throw new Error("No platform")
    }

    let {vaultId} = params;
    const templateId = url.searchParams.get('templateId');
    const skip = url.searchParams.get('skip');

    const [configuration, templates, allMembers] = await Promise.all([
        getConfigurations(),
        getTemplates(vaultId, platform.env.DB),
        getVaultMembers(vaultId, platform.env.DB),
    ]);

	const form = await superValidate(valibot(createExpenseSchema));

	// Set default userId to current user
	form.data.userId = locals.currentUser.id;

	// If templateId is provided, pre-fill form with template data
	let selectedTemplate = null;
	let isSkipped = skip === 'true';

	if (templateId) {
		selectedTemplate = templates.find(t => t.id === templateId);
		if (selectedTemplate) {
			// Pre-fill form with template data
			if (selectedTemplate.categoryName) form.data.categoryName = selectedTemplate.categoryName;
			if (selectedTemplate.defaultAmount) form.data.amount = selectedTemplate.defaultAmount;
			if (selectedTemplate.note) form.data.note = selectedTemplate.note;
			if (selectedTemplate.paymentType) form.data.paymentType = selectedTemplate.paymentType;
			if (selectedTemplate.paymentProvider) form.data.paymentProvider = selectedTemplate.paymentProvider;

			// Handle defaultUserId
			if (selectedTemplate.defaultUserId !== undefined) {
				if (selectedTemplate.defaultUserId === '__creator__') {
					form.data.userId = locals.currentUser.id;
				} else {
					form.data.userId = selectedTemplate.defaultUserId;
				}
			}
		}
	}

	return {
        form,
        templates,
        members: allMembers,
        currentUserId: locals.currentUser.id,
        vaultId,
        categories: configuration.categoryData.categories,
        paymentTypes: configuration.paymentData.paymentTypes,
        paymentProviders: configuration.paymentData.paymentProviders,
		selectedTemplate,
		isSkipped,
    };
};

export const actions: Actions = {
	default: async ({ request, fetch, locals, platform, params }) => {
        if(platform === undefined){
            throw new Error("No platform")
        }
        let {vaultId} = params;
        const form = await superValidate(request, valibot(createExpenseSchema));

        console.log('form', form);
		if (!form.valid) {
			return fail(400, { form });
		}

        const data = {
            ...form.data,
            vaultId,
        }

		try {
            const expenses = await createExpense(locals.currentUser.id, data, platform.env.DB);
			return {
                form,
                expenses,
            }
		} catch (error) {
			return fail(500, {
				form,
				error: 'Failed to create expense. Please try again.'
			});
		}
	}
};