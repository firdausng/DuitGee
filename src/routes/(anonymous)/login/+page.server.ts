import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
    if(platform === undefined){
        throw new Error("No platform")
    }

    if (!platform?.env?.DB) {
        throw new Error('Database not available');
    }

    return {
        basePath: platform.env.BASE_PATH,
        callbackPath: platform.env.CALLBACK_PATH,
    };
};