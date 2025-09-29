import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { categoryGroupSchema } from '$lib/schemas/expense';
import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from "./$types";
import { getCategoryGroup, updateCategoryGroup } from "$lib/server/api/category-groups/handlers";

export const load: PageServerLoad = async ({ params, platform, locals }) => {
	const { id, vaultId } = params;

	if (!platform) {
		throw error(500, 'No platform');
	}

	try {
		const categoryGroup = await getCategoryGroup(locals.currentUser.id, vaultId, id, platform.env.DB);

		if (!categoryGroup) {
			throw error(404, 'Category group not found');
		}

		// Use the category group data to populate the form
		const form = await superValidate({
            name: categoryGroup.name,
            color: categoryGroup.color,
            icon: categoryGroup.icon!,
            iconType: categoryGroup.iconType as "emoji" | "phosphor" | undefined,
            vaultId: categoryGroup.vaultId!,
        }, valibot(categoryGroupSchema));
		return { form, categoryGroup };
	} catch (err) {
		throw error(500, 'Failed to load category group');
	}
};

export const actions: Actions = {
	default: async ({ request, params, platform, locals }) => {
		const { id, vaultId } = params;

		if (!platform) {
			throw error(500, 'No platform');
		}

		const form = await superValidate(request, valibot(categoryGroupSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const categoryGroup = await updateCategoryGroup(locals.currentUser.id, vaultId, id, form.data, platform.env.DB);

			if (!categoryGroup) {
				throw error(404, 'Category group not found');
			}

			redirect(302, '/categories');
		} catch (err) {
			return fail(500, {
				form,
				error: 'Failed to update category group. Please try again.'
			});
		}
	}
};