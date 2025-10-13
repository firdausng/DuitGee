import { drizzle } from "drizzle-orm/d1";
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth } from 'better-auth';
import { betterAuthOptions } from './options';
import * as schema from "../db/better-auth-schema";
import {admin, bearer, organization} from "better-auth/plugins";

export const auth = (env: Cloudflare.Env) => {
    const db = drizzle(env.AUTH_DB, { schema });

    return betterAuth({
        database: drizzleAdapter(db, { provider: 'sqlite' }),
        ...betterAuthOptions,
        plugins: [
            bearer(),
            admin(),
            organization({
                teams: {
                    enabled: true,
                    //maximumTeams: 10, // Optional: limit teams per organization
                    allowRemovingAllTeams: false, // Optional: prevent removing the last team
                },
            }),
        ],
        baseURL: env.BETTER_AUTH_URL,
        secret: env.BETTER_AUTH_SECRET,
        emailAndPassword: {
            enabled: true,
        },
        socialProviders: {
            google:{
                clientId: env.GOOGLE_CLIENT_ID,
                clientSecret: env.GOOGLE_CLIENT_SECRET,
            }
        },
        trustedOrigins: [
            env.BASE_PATH,
        ],
    });
};