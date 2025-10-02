import { Hono } from 'hono';
import * as v from "valibot";
import { vValidator } from "@hono/valibot-validator";
import {
    getUserVaultsByEmail,
    getVaultByEmail,
    createVaultByEmail,
    updateVaultByEmail,
    deleteVaultByEmail,
    getVaultStatsByEmail
} from "$lib/server/api/vaults/handlers";
import { vaultSchema } from "$lib/server/api/vaults/schema";
import { describeRoute, resolver } from 'hono-openapi';

const updateVaultSchema = v.partial(vaultSchema);

// Query schema for getUserVaultsByEmail
const getUserVaultsByEmailSchema = v.object({
    email: v.pipe(v.string(), v.email())
});

const VAULT_TAG = ['Vault'];
const commonVaultConfig = {
    tags: VAULT_TAG,
};

export const vaultsApi = new Hono<App.Api>()
    .get(
        '/',
        describeRoute({
            ...commonVaultConfig,
            description: 'Get user\'s vaults',
            responses: {
                200: {
                    description: 'Successful response',
                    content: {
                        'application/json': { schema: resolver(v.object({
                            success: v.boolean(),
                            data: v.array(v.any())
                        })) },
                    },
                },
            },
        }),
        async (c) => {
        const userEmail = c.get('userEmail') as string;

        try {
            const vaults = await getUserVaultsByEmail(userEmail, c.env.DB);
            return c.json({
                success: true,
                data: vaults
            });
        } catch (error) {
            console.error('Error fetching vaults:', error);
            return c.json({
                success: false,
                error: 'Failed to fetch vaults'
            }, 500);
        }
    })
    .get(
        '/by-email',
        describeRoute({
            ...commonVaultConfig,
            description: 'Get vaults by user email',
            responses: {
                200: {
                    description: 'Successful response',
                    content: {
                        'application/json': { schema: resolver(v.object({
                            success: v.boolean(),
                            data: v.array(v.any())
                        })) },
                    },
                },
                404: {
                    description: 'User not found',
                },
            },
        }),
        vValidator('query', getUserVaultsByEmailSchema),
        async (c) => {
        const query = c.req.valid('query');

        try {
            const vaults = await getUserVaultsByEmail(query.email, c.env.DB);
            return c.json({
                success: true,
                data: vaults
            });
        } catch (error) {
            console.error('Error fetching vaults by email:', error);
            return c.json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch vaults'
            }, error instanceof Error && error.message === 'User not found' ? 404 : 500);
        }
    })
    .post(
        '/',
        describeRoute({
            ...commonVaultConfig,
            description: 'Create a new vault',
            responses: {
                201: {
                    description: 'Successful response',
                    content: {
                        'application/json': { schema: resolver(v.object({
                            success: v.boolean(),
                            data: vaultSchema
                        })) },
                    },
                },
            },
        }),
        vValidator('json', vaultSchema),
        async (c) => {
        const userEmail = c.get('userEmail') as string;
        const data = c.req.valid('json');

        try {
            const vault = await createVaultByEmail(userEmail, data, c.env.DB, c.env.KV);
            return c.json({
                success: true,
                data: vault
            }, 201);
        } catch (error) {
            console.error('Error creating vault:', error);
            return c.json({
                success: false,
                error: 'Failed to create vault'
            }, 500);
        }
    })
    .get(
        '/:id',
        describeRoute({
            ...commonVaultConfig,
            description: 'Get specific vault with members',
            responses: {
                200: {
                    description: 'Successful response',
                    content: {
                        'application/json': { schema: resolver(v.object({
                            success: v.boolean(),
                            data: v.any()
                        })) },
                    },
                },
                404: {
                    description: 'Vault not found',
                },
            },
        }),
        async (c) => {
        const userEmail = c.get('userEmail') as string;
        const vaultId = c.req.param('id');

        try {
            const vault = await getVaultByEmail(userEmail, vaultId, c.env.DB);
            return c.json({
                success: true,
                data: vault
            });
        } catch (error) {
            console.error('Error fetching vault:', error);
            const status = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            return c.json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch vault'
            }, status);
        }
    })
    .put(
        '/:id',
        describeRoute({
            ...commonVaultConfig,
            description: 'Update vault',
            responses: {
                200: {
                    description: 'Successful response',
                    content: {
                        'application/json': { schema: resolver(v.object({
                            success: v.boolean(),
                            data: vaultSchema
                        })) },
                    },
                },
                403: {
                    description: 'Permission denied',
                },
            },
        }),
        vValidator('json', updateVaultSchema),
        async (c) => {
        const userEmail = c.get('userEmail') as string;
        const vaultId = c.req.param('id');
        const data = c.req.valid('json');

        try {
            const vault = await updateVaultByEmail(userEmail, vaultId, data, c.env.DB, c.env.KV);
            return c.json({
                success: true,
                data: vault
            });
        } catch (error) {
            console.error('Error updating vault:', error);
            const status = error instanceof Error && error.message.includes('Permission denied') ? 403 : 500;
            return c.json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update vault'
            }, status);
        }
    })
    .delete(
        '/:id',
        describeRoute({
            ...commonVaultConfig,
            description: 'Delete vault',
            responses: {
                200: {
                    description: 'Successful response',
                    content: {
                        'application/json': { schema: resolver(v.object({
                            success: v.boolean(),
                            data: v.any(),
                            message: v.string()
                        })) },
                    },
                },
                403: {
                    description: 'Permission denied',
                },
            },
        }),
        async (c) => {
        const userEmail = c.get('userEmail') as string;
        const vaultId = c.req.param('id');

        try {
            const vault = await deleteVaultByEmail(userEmail, vaultId, c.env.DB, c.env.KV);
            return c.json({
                success: true,
                data: vault,
                message: 'Vault deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting vault:', error);
            const status = error instanceof Error && error.message.includes('Permission denied') ? 403 : 500;
            return c.json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete vault'
            }, status);
        }
    })
    .get(
        '/:id/stats',
        describeRoute({
            ...commonVaultConfig,
            description: 'Get vault statistics',
            responses: {
                200: {
                    description: 'Successful response',
                    content: {
                        'application/json': { schema: resolver(v.object({
                            success: v.boolean(),
                            data: v.any()
                        })) },
                    },
                },
                404: {
                    description: 'Vault not found',
                },
            },
        }),
        async (c) => {
        const userEmail = c.get('userEmail') as string;
        const vaultId = c.req.param('id');

        try {
            const stats = await getVaultStatsByEmail(userEmail, vaultId, c.env.DB);
            return c.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error fetching vault stats:', error);
            const status = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            return c.json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch vault stats'
            }, status);
        }
    });