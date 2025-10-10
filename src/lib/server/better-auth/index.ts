import {drizzle} from "drizzle-orm/d1";
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth } from 'better-auth';
import { bearer } from "better-auth/plugins";
import { oneTap } from "better-auth/plugins";
import { betterAuthOptions } from './options';

import * as schema from "../db/better-auth-schema";

export const auth = (env: Cloudflare.Env): ReturnType<typeof betterAuth> => {
    const db = drizzle(env.AUTH_DB, { schema });

    return betterAuth({
        ...betterAuthOptions,
        database: drizzleAdapter(db, { provider: 'sqlite' }),
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
        plugins: [
            bearer(),
            oneTap(),
        ],
        trustedOrigins: [
            env.BASE_PATH,
        ],
    });
};