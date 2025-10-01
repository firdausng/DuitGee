import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({locals, url, params}) => {
    return {
        activeUser: locals.currentUser,
        pathname: url.pathname,
        vaultId: params.vaultId,
    };
}