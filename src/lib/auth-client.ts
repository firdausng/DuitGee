import {createAuthClient} from "better-auth/client";
import {adminClient, organizationClient} from "better-auth/client/plugins";

export const authClient = ({basePath}: {basePath:string}) => createAuthClient({
    baseURL: basePath,
    plugins: [
        organizationClient({
            teams: {
                enabled: true,
            },
        }),
    ],
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60 // Cache duration in seconds
        }
    }
});

export const adminAuthClient = ({basePath}: {basePath:string}) => createAuthClient({
    baseURL: basePath,
    plugins: [
        organizationClient({
            teams: {
                enabled: true,
            },
        }),
        adminClient(),
    ],
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60 // Cache duration in seconds
        }
    }
});