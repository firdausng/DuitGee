import { drizzle } from "drizzle-orm/d1";
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import {APIError, betterAuth} from 'better-auth';
import { betterAuthOptions } from './options';
import * as schema from "../db/better-auth-schema";
import {admin, bearer, organization, type UserWithRole} from "better-auth/plugins";
import {eq} from "drizzle-orm";
import {createId} from "@paralleldrive/cuid2";

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
                allowUserToCreateOrganization: async (user:UserWithRole) => {
                    // const subscription = await getSubscription(user.email);
                    return user.role === "admin";
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
        databaseHooks: {
            user: {
                create: {
                    after: async (user) => {

                        let defaultOrg = (await db.select()
                            .from(schema.organization)
                            .where(eq(schema.organization.slug, 'public'))
                            .limit(1))[0];

                        if(defaultOrg === undefined) {
                            throw new APIError(400, {
                                message: "Default organization not found",
                                code: "DEFAULT_ORG_NOT_FOUND",
                                details: {
                                    slug: "default",
                                },
                            });
                        }

                        const orgMember = await db
                            .insert(schema.member)
                            .values({
                                id: createId(),
                                organizationId: defaultOrg.id,
                                userId: user.id,
                                role: "member",
                                createdAt: new Date(),
                            })
                            .returning();

                        console.log({
                            orgMember: orgMember[0].id,
                            user: user.id,
                        });

                        await auth(env).api.setActiveOrganization({body: {organizationId: defaultOrg?.id}})
                    },
                },
            },
        }
    });
};