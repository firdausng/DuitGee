import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({locals, url, params}) => {
    return {
        activeUser: locals.activeAuth,
        pathname: url.pathname,
        vaultId: params.vaultId,
    };
}