import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import {drizzle} from "drizzle-orm/d1";
import * as schema from "$lib/server/db/schema";
import * as authSchema from "$lib/server/db/better-auth-schema";
import {expenses, expenseTemplates, users, vaultMembers, vaults} from "$lib/server/db/schema";
import {user, session, account, verification} from "$lib/server/db/better-auth-schema";

export const load: PageServerLoad = async ({ locals, platform }) => {
    if (!locals.currentUser) {
        throw redirect(302, '/login');
    }

    if (!platform?.env?.DB || !platform?.env?.AUTH_DB) {
        throw new Error('Database not available');
    }

    // Main app database
    const client = drizzle(platform.env.DB, { schema });

    // Auth database
    const authClient = drizzle(platform.env.AUTH_DB, { schema: authSchema });

    // Fetch from main DB
    const userList = await client
        .select()
        .from(users);

    const expenseList = await client
        .select()
        .from(expenses);

    const expenseTemplateList = await client
        .select()
        .from(expenseTemplates);

    const vaultList = await client
        .select()
        .from(vaults);

    const vaultMemberList = await client
        .select()
        .from(vaultMembers);

    // Fetch from auth DB
    const authUserList = await authClient
        .select()
        .from(user);

    const sessionList = await authClient
        .select()
        .from(session);

    const accountList = await authClient
        .select()
        .from(account);

    const verificationList = await authClient
        .select()
        .from(verification);

    // Match users between app DB and auth DB by email
    const matched: Array<{ appUser: any; authUser: any }> = [];
    const appUsersOnly: Array<{ appUser: any; authUser: null }> = [];
    const authUsersOnly: Array<{ authUser: any; appUser: null }> = [];

    // Create maps for quick lookup
    const appUsersByEmail = new Map(userList.map(u => [u.email.toLowerCase(), u]));
    const authUsersByEmail = new Map(authUserList.map(u => [u.email.toLowerCase(), u]));

    // Find matched users and app-only users
    for (const appUser of userList) {
        const authUser = authUsersByEmail.get(appUser.email.toLowerCase());
        if (authUser) {
            matched.push({ appUser, authUser });
        } else {
            appUsersOnly.push({ appUser, authUser: null });
        }
    }

    // Find auth-only users
    for (const authUser of authUserList) {
        if (!appUsersByEmail.has(authUser.email.toLowerCase())) {
            authUsersOnly.push({ authUser, appUser: null });
        }
    }

    const matchedUsers = {
        matched,
        appUsersOnly,
        authUsersOnly,
        stats: {
            matchedCount: matched.length,
            appUsersOnlyCount: appUsersOnly.length,
            authUsersOnlyCount: authUsersOnly.length
        }
    };

    return {
        userList: userList,
        expenses: expenseList,
        expenseTemplates: expenseTemplateList,
        vaults: vaultList,
        vaultMembers: vaultMemberList,
        authUsers: authUserList,
        sessions: sessionList,
        accounts: accountList,
        verifications: verificationList,
        matchedUsers,
        basePath: platform.env.BASE_PATH,
        googleClientId: platform.env.GOOGLE_CLIENT_ID,
    };
};
