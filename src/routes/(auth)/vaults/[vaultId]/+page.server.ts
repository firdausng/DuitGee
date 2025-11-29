import {error} from '@sveltejs/kit';
import type { PageServerLoad } from "./$types";
import {getVault} from "$lib/server/api/vaults/getVaultHandler";

export const load: PageServerLoad = async ({ locals, platform, url, cookies, params }) => {
    if(platform === undefined){
        throw new Error("No platform")
    }

    if (!locals.currentUser) {
        throw error(401, 'Unauthorized');
    }

    const { vaultId } = params;

    return {
        vaultId,
        url: url.pathname,
    };

};