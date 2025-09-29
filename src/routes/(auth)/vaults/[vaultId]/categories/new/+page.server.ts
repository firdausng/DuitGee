import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { categorySchema } from '$lib/schemas/expense';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from "./$types";
import {createCategory} from "$lib/server/api/categories/handlers";

export const load: PageServerLoad = async () => {
	const form = await superValidate(valibot(categorySchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, fetch, platform, locals, params }) => {
        if(platform === undefined){
            throw new Error("No platform")
        }

        const form = await superValidate(request, valibot(categorySchema));

        console.log('form', form);

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
            const category = await createCategory(locals.currentUser.id, form.data, params.vaultId, platform.env.DB)

			redirect(302, '/categories');
		} catch (error) {
			return fail(500, {
				form,
				error: 'Failed to create category. Please try again.'
			});
		}
	}
};