import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { expenseSchema } from '$lib/schemas/expense';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from "./$types";
import {createExpense} from "$lib/server/api/expenses/handlers";
import {getCategories} from "$lib/server/api/categories/handlers";

export const load: PageServerLoad = async ({platform, locals, params}) => {
    if(platform === undefined){
        throw new Error("No platform")
    }

    let {vaultId} = params;

    const categories = await getCategories(vaultId, platform.env.DB);

	const form = await superValidate(valibot(expenseSchema));
	return {
        form,
        categories,
        vaultId
    };
};

export const actions: Actions = {
	default: async ({ request, fetch, locals, platform }) => {
        if(platform === undefined){
            throw new Error("No platform")
        }
        const form = await superValidate(request, valibot(expenseSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
            const expenses = await createExpense(locals.currentUser.id, form.data, platform.env.DB);
            // const categories = await getCategories(user.id, platform.env.DB);

			redirect(302, '/expenses');
		} catch (error) {
			return fail(500, {
				form,
				error: 'Failed to create expense. Please try again.'
			});
		}
	}
};