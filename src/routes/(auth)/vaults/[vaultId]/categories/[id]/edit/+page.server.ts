import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { categorySchema } from '$lib/schemas/expense';
import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from "./$types";
import {updateCategory, getCategory} from "$lib/server/api/categories/handlers";

export const load: PageServerLoad = async ({ params, fetch, locals, platform }) => {
    if(platform === undefined){
        throw new Error("No platform")
    }
    const { id, vaultId } = params;

	try {
        const category = await getCategory(locals.currentUser.id, vaultId, id, platform.env.DB);

		// Use the category data to populate the form
		const form = await superValidate({
            name: category.name,
            color: category.color,
            icon: category.icon!,
            iconType: category.iconType as "emoji" | "phosphor" | undefined,
            vaultId: category.vaultId!,
            groupId: category.groupId!,
        }, valibot(categorySchema));
		return { form, category };
	} catch (err) {
		throw error(500, 'Failed to load category');
	}
};

export const actions: Actions = {
	default: async ({ request, params, fetch, locals, platform }) => {
        if(platform === undefined){
            throw new Error("No platform")
        }

        const { id, vaultId } = params;
		const form = await superValidate(request, valibot(categorySchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			// const response = await fetch(`/api/categories/${id}`, {
			// 	method: 'PUT',
			// 	headers: {
			// 		'Content-Type': 'application/json'
			// 	},
			// 	body: JSON.stringify(form.data)
			// });
            //
			// if (!response.ok) {
			// 	if (response.status === 404) {
			// 		throw error(404, 'Category not found');
			// 	}
			// 	throw new Error('Failed to update category');
			// }

            const category = await updateCategory(locals.currentUser.id, vaultId, id, form.data, platform.env.DB);
			redirect(302, '/categories');
		} catch (err) {
			return fail(500, {
				form,
				error: 'Failed to update category. Please try again.'
			});
		}
	}
};