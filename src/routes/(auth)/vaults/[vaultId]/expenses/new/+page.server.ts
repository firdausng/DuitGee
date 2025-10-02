import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { expenseSchema } from '$lib/schemas/expense';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from "./$types";
import {createExpense} from "$lib/server/api/expenses/handlers";
import {getCategories} from "$lib/server/api/categories/handlers";
import {getTags} from "$lib/server/api/tags/handlers";
import {getTemplates} from "$lib/server/api/templates/handlers";

export const load: PageServerLoad = async ({platform, locals, params}) => {
    if(platform === undefined){
        throw new Error("No platform")
    }

    let {vaultId} = params;

    const [categories, tags, templates] = await Promise.all([
        getCategories(vaultId, platform.env.DB),
        getTags(platform.env.DB, { limit: 100 }), // Get top 100 popular tags
        getTemplates(locals.currentUser.id, vaultId, platform.env.DB)
    ]);

	const form = await superValidate(valibot(expenseSchema));
	return {
        form,
        categories,
        tags,
        templates,
        vaultId
    };
};

export const actions: Actions = {
	default: async ({ request, fetch, locals, platform, params }) => {
        if(platform === undefined){
            throw new Error("No platform")
        }
        let {vaultId} = params;
        const form = await superValidate(request, valibot(expenseSchema));

        console.log('form', form);
		if (!form.valid) {
			return fail(400, { form });
		}

        // Parse tagNames from comma-separated string
        const tagNames = form.data.tagNames
            ? form.data.tagNames.split(',').filter(Boolean)
            : [];

        const data = {
            ...form.data,
            vaultId,
            tagNames,
            paymentType: form.data.paymentType || undefined,
            paymentProvider: form.data.paymentProvider || undefined
        }

		try {
            const expenses = await createExpense(locals.currentUser.id, data, platform.env.DB);
            // const categories = await getCategories(user.id, platform.env.DB);
            console.log('expenses', expenses);
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