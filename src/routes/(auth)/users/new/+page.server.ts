import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { userSchema } from '$lib/schemas/expense';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from "./$types";
import { createUser } from "$lib/server/api/users/handlers";

export const load: PageServerLoad = async () => {
	const form = await superValidate(valibot(userSchema));
	return { form };
};

export const actions: Actions = {
	default: async ({ request, platform }) => {
		if (platform === undefined) {
			throw new Error("No platform");
		}

		const form = await superValidate(request, valibot(userSchema));

		console.log('form', form);

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const user = await createUser(form.data, platform.env.DB);

			if (!user) {
				return fail(500, {
					form,
					error: 'Failed to create user. Please try again.'
				});
			}

			redirect(302, '/users');
		} catch (error) {
			return fail(500, {
				form,
				error: 'Failed to create user. Please try again.'
			});
		}
	}
};