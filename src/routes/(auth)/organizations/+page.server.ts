import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import {auth} from "$lib/server/better-auth";

export const load: PageServerLoad = async ({ locals, platform, request }) => {
    if (!locals.currentUser) {
        throw redirect(302, '/login');
    }

    if (!platform?.env?.DB) {
        throw new Error('Database not available');
    }
    const authClient = auth(platform.env);

    const data = await authClient.api.listUsers({
        query: {
            searchValue: "some name",
            searchField: "name",
            searchOperator: "contains",
            limit: 100,
            offset: 100,
            sortBy: "name",
            sortDirection: "desc",
            filterField: "email",
            filterValue: "hello@example.com",
            filterOperator: "eq",
        },
        // This endpoint requires session cookies.
        headers: request.headers,
    });
    console.log("listUsers", data);
    // console.log(authClient.api);

    return {
        callbackPath: platform.env.CALLBACK_PATH,
        basePath: platform.env.BASE_PATH,
        googleClientId: platform.env.GOOGLE_CLIENT_ID,
    };
};