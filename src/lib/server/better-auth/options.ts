import type {BetterAuthOptions} from "better-auth";
import {admin, bearer} from "better-auth/plugins";

/**
 * Better Auth Options
 * this is used in both prod and database migration
 * do not put value related to env here
 */
export const betterAuthOptions: BetterAuthOptions = {
    appName: 'DUIT_GEE',
    plugins: [
        bearer(),
        admin(),
    ],
};