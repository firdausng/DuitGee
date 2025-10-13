import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { redirect } from '@sveltejs/kit';
import {type CreateVault, createVaultSchema} from '$lib/schemas/expense';
import type { PageServerLoad, Actions } from './$types.js';
import {createVault} from "$lib/server/api/vaults/handlers";

export const load: PageServerLoad = async ({platform, locals}) => {
    if(platform === undefined){
        throw new Error("No Platform")
    }
    const form = await superValidate(valibot(createVaultSchema));

	// Set default values
	form.data.color = '#3B82F6';
	form.data.iconType = 'emoji';
	form.data.icon = '🏦';
	form.data.isPersonal = true;

    const ownerVaults = locals.currentUserVaults.filter(v => v.owner === locals.currentSession.user.id);
    const isVaultLimitReach = ownerVaults.length > platform.env.VAULT_LIMIT
    console.log(ownerVaults.length , platform.env.VAULT_LIMIT)
	return {
		form,
        isVaultLimitReach,
        currentUserId: locals.currentUser.id,
	};
};

export const actions: Actions = {
	default: async ({ request, locals, platform }) => {
        if(platform === undefined){
            throw new Error("No platform")
        }
        const form = await superValidate(request, valibot(createVaultSchema));

        console.log("form", form)
		if (!form.valid) {
			return { form };
		}

        const data: CreateVault = {
            name: form.data.name,
            description: form.data.description || '',
            color: form.data.color,
            icon: form.data.icon || '🏦',
            iconType: form.data.iconType || 'emoji',
            isPersonal: form.data.isPersonal ?? true,
            ownerId: locals.currentUser.id
        };

		try {
			const newVault = await createVault(locals.currentUser.id, platform.env.VAULT_LIMIT, data, platform.env.DB);

			if (newVault) {
                throw redirect(303 , `/vaults/${newVault.id}`);
			}
		} catch (error) {
			console.error('Error creating vault:', error);
			form.errors._errors = ['Failed to create vault. Please try again.'];
			return { form };
		}

		return { form };
	}
};