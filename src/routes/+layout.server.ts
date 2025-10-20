import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({locals, url, platform}) => {
    if(platform === undefined){
        throw new Error("No platform")
    }

    return {
        posthogKey: platform.env.POSTHOG_KEY,
        currentSession: locals.currentSession,
        basePath: platform.env.BASE_PATH,
        callbackPath: platform.env.CALLBACK_PATH,
    };
}