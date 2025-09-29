import type {PageServerLoad} from "./$types";
import {COOKIE_SESSION} from "$lib/server/constants";

export const load: PageServerLoad = async ({ locals, platform, url, cookies }) => {
    if(platform === undefined){
        throw new Error("No platform")
    }
    const errorMessage = cookies.get('error_message');

    // Clear the cookie after reading
    if (errorMessage) {
        cookies.delete('error_message', { path: '/' });
    }

    return {
        error: errorMessage
    };
}