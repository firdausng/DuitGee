import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { error, redirect } from '@sveltejs/kit';
import {updateVaultSchema} from '$lib/schemas/expense.js';
import type { PageServerLoad, Actions } from './$types.js';
import {getVault, updateVault} from "$lib/server/api/vaults/handlers";

export const load: PageServerLoad = async ({ params, platform, locals }) => {
    if(platform === undefined){
        throw new Error("No platform")
    }
    const vaultId = params.vaultId;

	// Fetch the vault
	const {vault} = await getVault(locals.currentUser.id, vaultId, platform.env.DB);
	if (!vault) {
		throw error(404, 'Vault not found');
	}

	// Check if user has permission to edit this vault
	// For now, just check ownership
	if (vault.ownerId !== locals.currentUser.id) {
		throw error(403, 'You do not have permission to edit this vault');
	}

	// Pre-populate form with existing data
	const form = await superValidate({
		name: vault.name || '',
		description: vault.description || '',
		color: vault.color || '#3B82F6',
		icon: vault.icon || '🏦',
		iconType: (vault.iconType as 'emoji' | 'phosphor') || 'emoji',
		isPersonal: vault.isPersonal ?? true
	}, valibot(updateVaultSchema));

	return {
		form,
		vault: {
			id: vault.id,
			name: vault.name,
			description: vault.description,
			color: vault.color,
			icon: vault.icon,
			iconType: vault.iconType,
			isPersonal: vault.isPersonal,
			ownerId: vault.ownerId
		}
	};
};

export const actions: Actions = {
	default: async ({ request, params, platform, locals }) => {
        if(platform === undefined){
            throw new Error("No platform")
        }
        const vaultId = params.vaultId;
		const form = await superValidate(request, valibot(updateVaultSchema));

		if (!form.valid) {
			return { form };
		}

		try {
            const {vault} = await getVault(locals.currentUser.id, vaultId, platform.env.DB);
			if (!vault) {
				throw error(404, 'Vault not found');
			}

			if (vault.ownerId !== locals.currentUser.id) {
				throw error(403, 'You do not have permission to edit this vault');
			}

			// Prepare update data
			const updateData: any = {
				description: form.data.description || undefined,
				color: form.data.color,
				icon: form.data.icon || '🏦',
				iconType: form.data.iconType || 'emoji'
			};

			// Only update name if it's not a personal vault
			if (!vault.isPersonal) {
				updateData.name = form.data.name;
			}

            const updatedVault =await updateVault(locals.currentUser.id, vaultId, updateData, platform.env.DB);

			if (updatedVault) {
				throw redirect(302, `/vaults/${vaultId}`);
			}
		} catch (error) {
			console.error('Error updating vault:', error);
			if (error instanceof Response) {
				throw error; // Re-throw redirect responses
			}
			form.errors._errors = ['Failed to update vault. Please try again.'];
			return { form };
		}

		return { form };
	}
};