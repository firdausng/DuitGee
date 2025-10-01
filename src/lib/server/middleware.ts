import {type Handle} from "@sveltejs/kit";
import { redirect } from '@sveltejs/kit';
import {COOKIE_SESSION} from "$lib/server/constants";
import {AuthService} from "$lib/server/auth-service.svelte";
import {createUserWithDefaultVault, ensureUserPersonalVault, getUserByEmail, updateUser} from "$lib/server/api/users/handlers";
import type {AuthenticateWithSessionCookieSuccessResponse} from "@workos-inc/node";
import {getUserVaults} from "$lib/server/api/vaults/handlers";

export const setupServicesHandler: Handle = async ({ event, resolve }) => {
    if(event.platform === undefined){
        throw new Error("No Platform")
    }
    
    const db = event.platform.env.DB;
    if(db === undefined){
        throw new Error("Database not defined");
    }

    event.locals.authService = new AuthService(event.platform.env.WORKOS_API_KEY, event.platform.env.WORKOS_CLIENT_ID, event.platform.env.BASE_PATH, event.platform.env.WORKOS_COOKIE_PASSWORD);
    return resolve(event);
};

const publicRoutes = [
    '/login',
    '/logged-out',
    '/callback',
    '/unauthorized',
    '/.well-known',
    '/openapi.json',
    '/scalar',
    '/api'
]

export const checkSessionHandler: Handle = async ({ event, resolve }) => {
    if(event.platform === undefined){
        throw new Error("No Platform")
    }
    const pathname = event.url.pathname;
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return resolve(event);
    }
    
    const sessionData = event.cookies.get(COOKIE_SESSION);
    if(!sessionData){
        console.warn("[checkSessionHandler] cannot found auth cookie, redirect to login");
        return redirect(307, "/login");
    }

    let session = await event.locals.authService.authenticate(sessionData);
    
    let successSession : AuthenticateWithSessionCookieSuccessResponse | null = null;
    if(!session.authenticated){
        console.warn("[checkSessionHandler] user not authenticated", session);

        const sessionCookie = await event.locals.authService.getSessionFromCookie(sessionData);
        if(sessionCookie){
            const refreshedSession = await event.locals.authService.authenticateWithRefreshToken(sessionCookie.refreshToken);
            // user = refreshedSession.user;
            session = await event.locals.authService.authenticate(sessionData);
            if(!session.authenticated){
                console.warn("[checkSessionHandler] cannot obtain user auth, redirect to login");
                return redirect(307, "/login");
            }
            successSession = session;
            console.log("[checkSessionHandler] session refreshed", refreshedSession);
            if(!refreshedSession.sealedSession){
                console.warn("[checkSessionHandler] cannot obtain sealedSession, redirect to login");
                return redirect(307, "/login");
            }

            event.cookies.set(COOKIE_SESSION, refreshedSession.sealedSession, {
                path: '/',
            })
        }else{
            console.warn("[checkSessionHandler] no session cookie, redirect to login");
            return redirect(307, "/login");
        }  
    }else{
        successSession = session;
    }

    const appUser = await getUserByEmail(successSession.user.email, event.platform.env.DB);
    if(!appUser){
        console.warn(`[checkSessionHandler] user with ${successSession.user.email} not exist, creating user with default personal vault`);
        await createUserWithDefaultVault({
                firstName: successSession.user.firstName,
                lastName: successSession.user.firstName,
                email: successSession.user.email
            },
            event.platform.env.DB);
    }

    const vaults = await getUserVaults(appUser.id, event.platform.env.DB);

    console.log(`[checkSessionHandler] setting active user to the local data for ${event.url.pathname}`);
    event.locals.currentSession = successSession;
    event.locals.currentUser = appUser;
    event.locals.currentUserVaults = vaults;

    return resolve(event);
};

export const setupPersonalVaultHandler: Handle = async ({ event, resolve }) => {
    if(event.platform === undefined){
        throw new Error("No Platform")
    }

    const pathname = event.url.pathname;
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return resolve(event);
    }

    const db = event.platform.env.DB;
    if(db === undefined){
        throw new Error("Database not defined");
    }

    if(!event.locals.currentSession){
        return resolve(event);
    }
    console.log(`[setupPersonalVaultHandler] getUserByEmail data by ${JSON.stringify(event.locals.currentSession)} for ${event.url.pathname}`);

    const vault = await ensureUserPersonalVault(event.locals.currentUser.id, event.platform.env.DB);

    return resolve(event);
};

const adminRoutes = [
    '/users',
]

export const adminOnlyHandler: Handle = async ({ event, resolve }) => {
    if(event.platform === undefined){
        throw new Error("No Platform")
    }
    const pathname = event.url.pathname;
    if (!adminRoutes.some(route => pathname.startsWith(route))) {
        return resolve(event);
    }

    const adminEmails = event.platform.env.ADMIN_EMAILS.split(',')

    if(!adminEmails.includes(event.locals.currentUser.email)){
        console.warn("[adminOnlyHandler] this is admin only page, redirect to login");
        return redirect(307, "/");
    }

    event.locals.isAdmin = true;

    return resolve(event);
};

//TODO: this temporary handler is for api, need to figure out what to do to ensure third party caller handle refresh token themselve
export const checkApiHandler: Handle = async ({ event, resolve }) => {
    if(event.platform === undefined){
        throw new Error("No Platform")
    }
    const pathname = event.url.pathname;
    if ( !pathname.startsWith("/api")) {
        return resolve(event);
    }

    // Reuse session from checkSessionHandler if available (to avoid rate limits)
    if (event.locals.currentSession && event.locals.currentUser) {
        console.log(`[checkApiHandler] reusing existing session for ${event.url.pathname}`);
        return resolve(event);
    }

    // Fallback: authenticate if session not already checked (shouldn't happen in normal flow)
    console.warn("[checkApiHandler] session not pre-authenticated, authenticating now");

    const sessionData = event.cookies.get(COOKIE_SESSION);
    if(!sessionData){
        console.warn("[checkApiHandler] cannot found auth cookie, redirect to login");
        return redirect(307, "/login");
    }

    let session = await event.locals.authService.authenticate(sessionData);

    let successSession : AuthenticateWithSessionCookieSuccessResponse | null = null;
    if(!session.authenticated){
        console.warn("[checkApiHandler] user not authenticated", session);

        const sessionCookie = await event.locals.authService.getSessionFromCookie(sessionData);
        if(sessionCookie){
            const refreshedSession = await event.locals.authService.authenticateWithRefreshToken(sessionCookie.refreshToken);
            // user = refreshedSession.user;
            session = await event.locals.authService.authenticate(sessionData);
            if(!session.authenticated){
                console.warn("[checkApiHandler] cannot obtain user auth, redirect to login");
                return redirect(307, "/login");
            }
            successSession = session;
            console.log("[checkApiHandler] session refreshed", refreshedSession);
            if(!refreshedSession.sealedSession){
                console.warn("[checkApiHandler] cannot obtain sealedSession, redirect to login");
                return redirect(307, "/login");
            }

            event.cookies.set(COOKIE_SESSION, refreshedSession.sealedSession, {
                path: '/',
            })
        }else{
            console.warn("[checkApiHandler] no session cookie, redirect to login");
            return redirect(307, "/login");
        }
    }else{
        successSession = session;
    }

    let appUser = await getUserByEmail(successSession.user.email, event.platform.env.DB);
    if(!appUser){
        console.warn(`[checkApiHandler] user with ${successSession.user.email} not exist, creating user with default personal vault`);
        await createUserWithDefaultVault({
                firstName: successSession.user.firstName,
                lastName: successSession.user.lastName,
                email: successSession.user.email
            },
            event.platform.env.DB);
        appUser = await getUserByEmail(successSession.user.email, event.platform.env.DB);
    } else {
        // Check if WorkOS user data differs from database and update if needed
        const workosFirstName = successSession.user.firstName;
        const workosLastName = successSession.user.lastName;

        if (appUser.firstName !== workosFirstName || appUser.lastName !== workosLastName) {
            console.log(`[checkApiHandler] updating user ${appUser.email} - firstName: "${appUser.firstName}" -> "${workosFirstName}", lastName: "${appUser.lastName}" -> "${workosLastName}"`);
            await updateUser(appUser.id, {
                firstName: workosFirstName,
                lastName: workosLastName
            }, event.platform.env.DB);
            // Refresh user data after update
            appUser = await getUserByEmail(successSession.user.email, event.platform.env.DB);
        }
    }

    const vaults = await getUserVaults(appUser.id, event.platform.env.DB);

    console.log(`[checkApiHandler] setting active user to the local data for ${event.url.pathname}`);
    event.locals.currentSession = successSession;
    event.locals.currentUser = appUser;
    event.locals.currentUserVaults = vaults;

    return resolve(event);
};
