import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import {type UpdateExpense, updateExpenseSchema} from '$lib/schemas/expense';
import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from "./$types";
import {getExpense, updateExpense} from "$lib/server/api/expenses/handlers";
import {getVaultMembers} from "$lib/server/api/vaults/handlers";
import {getConfigurations} from "$lib/server/api/app-configurations/handlers";

export const load: PageServerLoad = async ({ params, fetch, locals, cookies, platform }) => {
    if(platform === undefined){
        throw new Error("No platform")
    }

    const { id, vaultId } = params;

	try {
        const [configuration, expense, members] = await Promise.all([
            getConfigurations(),
            getExpense(vaultId, id, platform.env.DB),
            getVaultMembers(locals.currentUser.id, vaultId, platform.env.DB)
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
			categoryName: expense.category?.name,
			userId: expense.userId || '',
			date: formatDateForInput(expense.date),
			paymentType: expense.paymentType || '',
			paymentProvider: expense.paymentProvider || '',
			tagNames: expense.tags?.map((t: any) => t.name).join(',') || ''
		};

		const form = await superValidate(formData, valibot(updateExpenseSchema));
		return {
            form,
            categories: configuration.categoryData.categories,
            paymentTypes: configuration.paymentData.paymentTypes,
            paymentProviders: configuration.paymentData.paymentProviders,
            members,
            currentUserId: locals.currentUser.id,
            expense,
            vaultId
        };
	} catch (err) {
        console.error('Error loading expense:', err);
		throw error(500, 'Failed to load expense');
	}
};

export const actions: Actions = {
	default: async ({ request, params, fetch, locals, platform }) => {
        if(platform === undefined){
            throw new Error("No platform")
        }
        const { id, vaultId } = params;
		const form = await superValidate(request, valibot(updateExpenseSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const data: UpdateExpense = {
			...form.data,
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