import {type Handle} from "@sveltejs/kit";
import { redirect } from '@sveltejs/kit';
import {getUserVaults} from "$lib/server/api/vaults/handlers";
import {auth} from "$lib/server/better-auth";
import {Resend} from "resend";

export const setupServicesHandler: Handle = async ({ event, resolve }) => {
    if(event.platform === undefined){
        throw new Error("No Platform")
    }

    const db = event.platform.env.DB;
    if(db === undefined){
        throw new Error("Database not defined");
    }

    return resolve(event);
};

const publicRoutes = [
    '/login',
    '/register',
    '/logged-out',
    '/callback',
    '/unauthorized',
    '/privacy',
    '/term',
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
    // if (pathname === '/' || publicRoutes.some(route => pathname.startsWith(route))) {
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return resolve(event);
    }

    const betterAuth = auth(event.platform.env);

    const session = await betterAuth.api.getSession({
        headers: event.request.headers,
    });

    if(!session){
        console.warn({session, message: "[checkSessionHandler] user not authenticated"});
        return redirect(307, "/login");
    }

    // const appUser = await getUserByEmail(session.user.email, event.platform.env.DB, event.platform.env.KV);
    // if(!appUser){
    //     console.warn(`[checkSessionHandler] user with ${session.user.email} not exist, creating user with default personal vault`);
    //     await createUserWithDefaultVault({
    //             firstName: session.user.name,
    //             lastName: session.user.name,
    //             email: session.user.email
    //         },
    //         event.platform.env.DB);
    // }

    const authClient = auth(event.platform.env);
    const organizationList = await authClient.api.listOrganizations({
        headers: event.request.headers,
    });

    if(organizationList.length === 0){
        const metadata = { someKey: "someValue" };
        const data = await authClient.api.createOrganization({
            body: {
                name: session.user.id, // required
                slug: "my-org", // required
                metadata,
                userId: session.user.id, // server-only
                // keepCurrentActiveOrganization: false,
            },
            headers: event.request.headers,
        });
    }

    const vaults = await getUserVaults(session.user.id, event.platform.env.DB, event.platform.env.KV);

    const ownerVaults = vaults.filter(v => v.owner === session.user.id);
    // console.log('[checkSessionHandler] ownerVaults.length', ownerVaults.length)

    event.locals.isVaultLimitReach = ownerVaults.length > event.platform.env.VAULT_LIMIT;
    event.locals.currentUserVaults = vaults;
    event.locals.currentSession = session;
    event.locals.currentUser = session.user;
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
    console.log({
        message: `[setupPersonalVaultHandler] ensureUserPersonalVault data by ${event.locals.currentUser.email} for ${event.url.pathname}`,
        currentUser: event.locals.currentUser,
        pathname: event.url.pathname
    });

    // const vault = await ensureUserPersonalVault(event.locals.currentUser.id, event.platform.env.DB);

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
        console.warn({
            message: "[adminOnlyHandler] this is admin only page, redirect to login"
        });
        return redirect(307, "/");
    }

    event.locals.isAdmin = true;

    return resolve(event);
};
