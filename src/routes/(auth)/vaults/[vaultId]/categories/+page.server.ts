import {error} from '@sveltejs/kit';
import type { PageServerLoad } from "./$types";
import {getCategories} from "$lib/server/api/categories/handlers";

export const load: PageServerLoad = async ({ locals, platform, params }) => {
    if(platform === undefined){
        throw new Error("No platform")
    }

    try {
        const categories = await getCategories(params.vaultId, platform.env.DB);

        return {
            activeUser: locals.currentUser,
            categories
        };
    } catch (err) {
        console.log(err);
        throw error(500, 'Failed to load category');
    }
};