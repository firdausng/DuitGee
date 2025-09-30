import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getVault } from '$lib/server/api/vaults/handlers';

export const load: PageServerLoad = async ({ locals, platform, params }) => {
    if (!platform?.env?.DB) {
        throw error(500, 'Database not available');
    }

    const { vaultId } = params;

    if (!locals.currentUser) {
        throw error(401, 'Unauthorized');
    }

    try {
        // Get vault with all members using the real handler
        const vaultData = await getVault(locals.currentUser.id, vaultId, platform.env.DB);
        console.log('vaultData.members', vaultData.members);
        return {
            members: vaultData.members,
            vault: vaultData.vault,
            currentUserId: locals.currentUser.id
        };
    } catch (err) {
        console.error('Error loading vault members:', err);
        if (err instanceof Error && err.message.includes('not found')) {
            throw error(404, 'Vault not found or access denied');
        }
        throw error(500, 'Failed to load vault members');
    }
};