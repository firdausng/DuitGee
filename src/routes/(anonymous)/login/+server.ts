import type {RequestHandler} from "@sveltejs/kit";
import { redirect } from '@sveltejs/kit';

export const GET: RequestHandler = ({ platform, locals }) => {
    if(platform === undefined){
        throw new Error("No platform")
    }

    const authorizationUrl = locals.authService.getLoginRedirectUrl();
    redirect(307, authorizationUrl);
};
