import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { expenseSchema } from '$lib/schemas/expense';
import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from "./$types";
import {getCategories} from "$lib/server/api/categories/handlers";
import {getExpense, updateExpense} from "$lib/server/api/expenses/handlers";

export const load: PageServerLoad = async ({ params, fetch, locals, cookies, platform }) => {
    if(platform === undefined){
        throw new Error("No platform")
    }

    const { id, vaultId } = params;

	try {
        const categories = await getCategories(vaultId, platform.env.DB);
        const expense = await getExpense(vaultId, id, platform.env.DB);

        if (!expense) {
            throw error(404, 'Expense not found');
        }

		const formData = {
			note: expense.note!,
			amount: expense.amount,
			categoryId: expense.category?.id,
			date: expense.date
		};

		const form = await superValidate(formData, valibot(expenseSchema));
		return {
            form,
            categories,
            expense
        };
	} catch (err) {
		throw error(500, 'Failed to load expense');
	}
};

export const actions: Actions = {
	default: async ({ request, params, fetch, locals, platform }) => {
        if(platform === undefined){
            throw new Error("No platform")
        }
        const { id, vaultId } = params;
		const form = await superValidate(request, valibot(expenseSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const expense = await updateExpense(locals.currentUser.id, vaultId, id, form.data, platform.env.DB);

			redirect(302, '/expenses');
		} catch (err) {
			return fail(500, {
				form,
				error: 'Failed to update expense. Please try again.'
			});
		}
	}
};