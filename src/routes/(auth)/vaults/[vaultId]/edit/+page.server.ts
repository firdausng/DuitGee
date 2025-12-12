import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import {updateVaultRequestSchema} from "$lib/schemas/vaults";

export const load = async ({ params, fetch }) => {
	const vaultId = params.vaultId;

    let vaultData;
    try {
        const response = await fetch(`/api/getVault?vaultId=${vaultId}`);
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                vaultData = result.data;
            }
        }
    } catch (err) {
        console.error({
            message: 'Failed to fetch vault',
            err
        });
    }

    const form = await superValidate(
        {
            id: vaultData.vaults.id,
            name: vaultData.vaults.name,
            description: vaultData.vaults.description,
            color: vaultData.vaults.color,
            icon: vaultData.vaults.icon,
            iconType: vaultData.vaults.iconType,
            isDefault: vaultData.vaults.isDefault,
            locale: vaultData.vaults.locale || 'en-US',
            currency: vaultData.vaults.currency || 'USD',
        },
        valibot(updateVaultRequestSchema)
    );

	return {
		form,
		vaultId,
        vault: vaultData
	};
};
