import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, platform }) => {
    if (!locals.currentUser) {
        throw redirect(302, '/login');
    }

    if (!platform?.env?.DB) {
        throw new Error('Database not available');
    }

    return {
        invitations: [],
        basePath: platform.env.BASE_PATH,
        googleClientId: platform.env.GOOGLE_CLIENT_ID,
    };
};