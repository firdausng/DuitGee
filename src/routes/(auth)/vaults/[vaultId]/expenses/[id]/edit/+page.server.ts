import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { expenseSchema } from '$lib/schemas/expense';
import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from "./$types";
import {getCategories} from "$lib/server/api/categories/handlers";
import {getExpense, updateExpense} from "$lib/server/api/expenses/handlers";
import {getTags} from "$lib/server/api/tags/handlers";

export const load: PageServerLoad = async ({ params, fetch, locals, cookies, platform }) => {
    if(platform === undefined){
        throw new Error("No platform")
    }

    const { id, vaultId } = params;

	try {
        const [categories, tags, expense] = await Promise.all([
            getCategories(vaultId, platform.env.DB),
            getTags(platform.env.DB, { limit: 100 }),
            getExpense(vaultId, id, platform.env.DB)
        ]);

        if (!expense) {
            throw error(404, 'Expense not found');
        }

		// Convert ISO date to datetime-local format (YYYY-MM-DDTHH:mm)
		const formatDateForInput = (isoDate: string): string => {
			const date = new Date(isoDate);
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			const hours = String(date.getHours()).padStart(2, '0');
			const minutes = String(date.getMinutes()).padStart(2, '0');
			return `${year}-${month}-${day}T${hours}:${minutes}`;
		};

		const formData = {
			note: expense.note || '',
			amount: expense.amount,
			categoryId: expense.category?.id,
			date: formatDateForInput(expense.date),
			paymentType: expense.paymentType || '',
			paymentProvider: expense.paymentProvider || '',
			tagNames: expense.tags?.map((t: any) => t.name).join(',') || ''
		};

        console.log('formData', formData);

		const form = await superValidate(formData, valibot(expenseSchema));
		return {
            form,
            categories,
            tags,
            expense,
            vaultId
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

		// Parse tagNames from comma-separated string
		const tagNames = form.data.tagNames
			? form.data.tagNames.split(',').filter(Boolean)
			: [];

		const data = {
			...form.data,
			tagNames,
			paymentType: form.data.paymentType || undefined,
			paymentProvider: form.data.paymentProvider || undefined
		};

		try {
			const expense = await updateExpense(locals.currentUser.id, vaultId, id, data, platform.env.DB);

			redirect(302, `/vaults/${vaultId}/expenses`);
		} catch (err) {
			return fail(500, {
				form,
				error: 'Failed to update expense. Please try again.'
			});
		}
	}
};