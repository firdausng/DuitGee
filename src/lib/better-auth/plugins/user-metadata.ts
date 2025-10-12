import {type BetterAuthPlugin, Where} from "better-auth";
import {createAuthEndpoint,} from "better-auth/plugins";
export const metadataPlugin = () =>{

    return {
        id: "metadataPlugin",
        schema: {
            user: {
                fields: {
                    metadata: {
                        type: "json", // string, number, boolean, date
                        required: true, // if the field should be required on a new record. (default: false)
                        unique: false, // if the field should be unique. (default: false)
                    },
                },
            },
        },
        init(){
            return {
                options: {
                    databaseHooks: {
                        user: {
                            create: {
                                async before(user) {
                                    return {
                                        data: {
                                            metadata: {},
                                            ...user,
                                        },
                                    };
                                },
                            },

                        }
                    }
                }
            }
        },
        endpoints: {
            listUsers: createAuthEndpoint(
                "/metadata/list-users",
                {
                    method: "GET"
                },
                async(ctx) =>{
                    const session = ctx.context.session;

                    const where: Where[] = [];
                    const users = await ctx.context.internalAdapter.listUsers(
                        Number(ctx.query?.limit) || undefined,
                        Number(ctx.query?.offset) || undefined,
                        ctx.query?.sortBy
                            ? {
                                field: ctx.query.sortBy,
                                direction: ctx.query.sortDirection || "asc",
                            }
                            : undefined,
                        where.length ? where : undefined,
                    );
                }
            )
        }

    } satisfies BetterAuthPlugin
};