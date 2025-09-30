import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, cookies }) => {
    // Clear the session cookie
    cookies.delete('wos-session', { path: '/' });

    // Redirect to login or home page
    throw redirect(302, '/');
};