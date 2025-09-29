import {error} from '@sveltejs/kit';
import type { PageServerLoad } from "./$types";
import {getUserVaults} from "$lib/server/api/vaults/handlers";

export const load: PageServerLoad = async ({ locals, platform, url, cookies, params }) => {
    if(platform === undefined){
        throw new Error("No platform")
    }
    const { vaultId } = params;

    if (!locals.currentUser) {
        throw error(401, 'Unauthorized');
    }

    try {
        // Get user's available vaults
        const userVaults = await getUserVaults(locals.currentUser.id, platform?.env?.DB);

        // Find the current vault and user's role
        const currentVaultData = userVaults.find(v => v.vault.id === vaultId);

        if (!currentVaultData) {
            throw error(404, 'Vault not found or access denied');
        }

        // Format vaults for the store
        const availableVaults = userVaults.map(v => ({
            id: v.vault.id,
            name: v.vault.name,
            description: v.vault.description,
            color: v.vault.color,
            icon: v.vault.icon,
            iconType: v.vault.iconType as 'emoji' | 'phosphor',
            isPersonal: v.vault.isPersonal,
            role: v.vault.ownerId === locals.currentUser.id ? 'owner' : v.membership?.role as 'admin' | 'member'
        }));

        const currentVault = {
            id: currentVaultData.vault.id,
            name: currentVaultData.vault.name,
            description: currentVaultData.vault.description,
            color: currentVaultData.vault.color,
            icon: currentVaultData.vault.icon,
            iconType: currentVaultData.vault.iconType as 'emoji' | 'phosphor',
            isPersonal: currentVaultData.vault.isPersonal,
            role: currentVaultData.vault.ownerId === locals.currentUser.id ? 'owner' : currentVaultData.membership?.role as 'admin' | 'member'
        };

        return {
            currentVault,
            availableVaults,
            vaultId,
            url: url.pathname,
        };
    } catch (err) {
        console.error('Error loading vault data:', err);
        throw error(500, 'Failed to load vault data');
    }
};