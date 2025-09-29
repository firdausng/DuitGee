import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { redirect } from '@sveltejs/kit';
import { vaultSchema } from '$lib/schemas/expense.js';
import type { PageServerLoad, Actions } from './$types.js';
import {createVault} from "$lib/server/api/vaults/handlers";
import type {Vault} from "$lib/server/api/vaults/schema";

export const load: PageServerLoad = async () => {
	const form = await superValidate(valibot(vaultSchema));

	// Set default values
	form.data.color = '#3B82F6';
	form.data.iconType = 'emoji';
	form.data.icon = '🏦';
	form.data.isPersonal = true;

	return {
		form
	};
};

export const actions: Actions = {
	default: async ({ request, locals, platform }) => {
        if(platform === undefined){
            throw new Error("No platform")
        }
        const form = await superValidate(request, valibot(vaultSchema));
        console.log('form', form);
		if (!form.valid) {
			return { form };
		}

        const data: Vault = {
            name: form.data.name,
            description: form.data.description || '',
            color: form.data.color,
            icon: form.data.icon || '🏦',
            iconType: form.data.iconType || 'emoji',
            isPersonal: form.data.isPersonal ?? true,
        };

		try {
			const newVault = await createVault(locals.currentUser.id, data, platform.env.DB);

			if (newVault) {
				throw redirect(302, `/vaults/${newVault.id}`);
			}
		} catch (error) {
			console.error('Error creating vault:', error);
			form.errors._errors = ['Failed to create vault. Please try again.'];
			return { form };
		}

		return { form };
	}
};