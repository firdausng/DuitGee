import {Hono} from 'hono';
import * as v from "valibot";
import {vValidator} from "@hono/valibot-validator";
import {
    getUserVaults,
    getVault,
    updateVault,
    deleteVault,
} from "$lib/server/api/admin/vaults/handlers";
import {describeRoute, resolver} from 'hono-openapi';
import {createVaultSchema, getUserVaultsByEmailSchema, updateVaultSchema, vaultSchema} from "$lib/schemas/expense";
import {auth} from "$lib/server/better-auth";

const VAULT_TAG = ['Admin Organization'];
const commonVaultConfig = {
    tags: VAULT_TAG,
};

const addMemberSchema = v.object({
    userId: v.string(),
    role: v.union([
        v.literal('member'),
        v.literal('admin'),
        v.literal('owner'),
        v.array(v.union([
            v.literal('member'),
            v.literal('admin'),
            v.literal('owner'),
        ]))
    ]),
    organizationId: v.optional(v.string()),
    teamId: v.optional(v.string()),
});

export const adminOrganizationApi = new Hono<App.Api>()
    .use("*", async (c, next) => {
        const session = c.get('currentSession');
        if (session.user.role !== 'admin') {
            return c.json({
                success: false,
                error: 'Unauthorized'
            }, 401);
        }

        return next();
    })
    .post(
        '/:orgId/add-member',
        describeRoute({
            ...commonVaultConfig,
            description: 'Add member to organization',
            responses: {
                200: {
                    description: 'Successful response',
                    content: {
                        'application/json': {
                            schema: resolver(v.object({
                                success: v.boolean(),
                                data: v.array(v.any())
                            }))
                        },
                    },
                },
            },
        }),
        vValidator('json', addMemberSchema),
        async (c) => {
            const session = c.get('currentSession');
            const addMemberCommand = c.req.valid('json');

            try {
                const member = await auth(c.env).api.addMember({
                    body: addMemberCommand,
                });

                return c.json({
                    success: true,
                    data: member
                });
            } catch (error) {
                console.error({
                    message: 'Error fetching vaults:',
                    error
                });
                return c.json({
                    success: false,
                    error: 'Failed to fetch vaults'
                }, 500);
            }
        });