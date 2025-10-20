import type { PageServerLoad } from './$types';
import {redirect} from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals, platform }) => {
    if(platform === undefined){
        throw new Error("No platform")
    }

    if (!platform?.env?.DB) {
        throw new Error('Database not available');
    }

    if(locals.currentUser){
        redirect(302, '/');
    }

    return {
        basePath: platform.env.BASE_PATH,
        callbackPath: platform.env.CALLBACK_PATH,
    };
};