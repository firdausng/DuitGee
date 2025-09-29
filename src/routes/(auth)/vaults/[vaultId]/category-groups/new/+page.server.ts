import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { categoryGroupSchema } from '$lib/schemas/expense';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from "./$types";
import { createCategoryGroup } from "$lib/server/api/category-groups/handlers";

export const load: PageServerLoad = async () => {
	const form = await superValidate(valibot(categoryGroupSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, platform, locals, params }) => {
		if (platform === undefined) {
			throw new Error("No platform");
		}

		const form = await superValidate(request, valibot(categoryGroupSchema));

		console.log('form', form);

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const categoryGroup = await createCategoryGroup(locals.currentUser.id, params.vaultId, form.data, platform.env.DB);

			if (!categoryGroup) {
				return fail(500, {
					form,
					error: 'Failed to create category group. Please try again.'
				});
			}

			redirect(302, '/categories');
		} catch (error) {
			return fail(500, {
				form,
				error: 'Failed to create category group. Please try again.'
			});
		}
	}
};