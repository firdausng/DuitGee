import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { userSchema } from '$lib/schemas/expense';
import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from "./$types";
import { getUser, updateUser } from "$lib/server/api/users/handlers";

export const load: PageServerLoad = async ({ params, platform }) => {
	const { id } = params;

	if (!platform) {
		throw error(500, 'No platform');
	}

	try {
		// Fetch the existing user data
		const user = await getUser(id, platform.env.DB);

		if (!user) {
			throw error(404, 'User not found');
		}

		// Use the user data to populate the form
		const form = await superValidate(user, valibot(userSchema));
		return { form, user };
	} catch (err) {
		throw error(500, 'Failed to load user');
	}
};

export const actions: Actions = {
	default: async ({ request, params, platform }) => {
		const { id } = params;

		if (!platform) {
			throw error(500, 'No platform');
		}

		const form = await superValidate(request, valibot(userSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const user = await updateUser(id, form.data, platform.env.DB);

			if (!user) {
				throw error(404, 'User not found');
			}

			redirect(302, '/users');
		} catch (err) {
			return fail(500, {
				form,
				error: 'Failed to update user. Please try again.'
			});
		}
	}
};