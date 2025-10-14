import type { PageServerLoad } from '../../../../../../.svelte-kit/types/src/routes';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, platform, request, params }) => {
    if (!locals.currentUser) {
        throw redirect(302, '/login');
    }

    if (!platform?.env?.DB) {
        throw new Error('Database not available');
    }

    return {
        basePath: platform.env.BASE_PATH,
        organizationSlug: params.organizationSlug,
    };
};