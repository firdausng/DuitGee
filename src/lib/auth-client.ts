import {createAuthClient} from "better-auth/client";

export const authClient = ({basePath}: {basePath:string}) => createAuthClient({
    baseURL: basePath,
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60 // Cache duration in seconds
        }
    }
});