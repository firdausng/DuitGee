import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import {createVaultSchema} from '$lib/schemas/expense';
import type { PageServerLoad } from './$types.js';

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
        basePath: platform.env.BASE_PATH,
	};
};
