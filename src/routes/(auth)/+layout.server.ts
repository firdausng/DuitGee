import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({locals, url, platform}) => {
    if(platform === undefined){
        throw new Error("No platform")
    }

    return {
        activeUser: locals.currentUser,
        pathname: url.pathname,
        vaults: locals.currentUserVaults,
        isAdmin: locals.isAdmin,
        currentSession: locals.currentSession,
        basePath: platform.env.BASE_PATH,
    };
}