import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import {auth} from "$lib/server/better-auth";

export const load: PageServerLoad = async ({ locals, platform }) => {
    if (!locals.currentUser) {
        throw redirect(302, '/login');
    }

    if (!platform?.env?.DB) {
        throw new Error('Database not available');
    }
    const authClient = auth(platform.env);

    const data = await authClient.api.organizations.list();

    return {
        callbackPath: platform.env.CALLBACK_PATH,
        basePath: platform.env.BASE_PATH,
        googleClientId: platform.env.GOOGLE_CLIENT_ID,
    };
};