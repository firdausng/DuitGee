import type {RequestHandler} from "@sveltejs/kit";
import { redirect} from '@sveltejs/kit';
import {COOKIE_SESSION} from "$lib/server/constants";
import {createUserWithDefaultVault, getUserByEmail} from "$lib/server/api/users/handlers";

export const GET: RequestHandler = async ({  platform, url, locals, cookies }) => {
    if(platform === undefined){
        throw new Error("No platform")
    }

    const code = url.searchParams.get("code");
    if(code === null){
        throw new Error("No Auth Code in url")
    }

    const authResponse = await locals.authService.authenticateWithCode(code);
    console.log("[callback] ", authResponse)

    if(authResponse.sealedSession === undefined){
        throw new Error("No Session")
    }

    const user = await getUserByEmail(authResponse.user.email, platform.env.DB);
    console.log("[callback] getUserByEmail", user);
    if(!user){
        // console.log("[callback] user not in the system, redirect to unauthorized");
        // cookies.set('error_message', `User not found in system: ${authResponse.user.email}`, {
        //     path: '/',
        // });

        await createUserWithDefaultVault({
                firstName: authResponse.user.firstName,
                lastName: authResponse.user.firstName,
                email: authResponse.user.email
            },
            platform.env.DB);

        // redirect(307, '/unauthorized');
    }

    cookies.set(COOKIE_SESSION, authResponse.sealedSession, {
        path: "/",
    });

    redirect(307,"/");
};