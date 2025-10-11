import { drizzle } from "drizzle-orm/d1";
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth } from 'better-auth';
import { bearer, admin  } from "better-auth/plugins";
import { betterAuthOptions } from './options';

import * as schema from "../db/better-auth-schema";

export const auth = (env: Cloudflare.Env): ReturnType<typeof betterAuth> => {
    const db = drizzle(env.AUTH_DB, { schema });

    return betterAuth({
        database: drizzleAdapter(db, { provider: 'sqlite' }),
        ...betterAuthOptions,
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