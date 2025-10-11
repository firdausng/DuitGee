import {Hono} from 'hono';
import * as v from "valibot";
import {vValidator} from "@hono/valibot-validator";
import {
    getUserVaultsByEmail,
    getVaultByEmail,
    createVaultByEmail,
    updateVaultByEmail,
    deleteVaultByEmail,
} from "$lib/server/api/vaults/handlers";
import {describeRoute, resolver} from 'hono-openapi';
import {getUserVaultsByEmailSchema, updateVaultSchema, vaultSchema} from "$lib/schemas/expense";

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
        async (c) => {
            const session = c.get('currentSession');

            try {
                const vaults = await getUserVaultsByEmail(session.user.email, c.env.DB);
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
                        'application/json': {
                            schema: resolver(v.object({
                                success: v.boolean(),
                                data: v.array(v.any())
                            }))
                        },
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
                        'application/json': {
                            schema: resolver(v.object({
                                success: v.boolean(),
                                data: vaultSchema
                            }))
                        },
                    },
                },
            },
        }),
        vValidator('json', vaultSchema),
        async (c) => {
            const session = c.get('currentSession');
            const data = c.req.valid('json');

            try {
                const vault = await createVaultByEmail(session.user.email, data, c.env.DB, c.env.KV);
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
                        'application/json': {
                            schema: resolver(v.object({
                                success: v.boolean(),
                                data: v.any()
                            }))
                        },
                    },
                },
                404: {
                    description: 'Vault not found',
                },
            },
        }),
        async (c) => {
            const session = c.get('currentSession');
            const vaultId = c.req.param('id');

            try {
                const vault = await getVaultByEmail(session.user.email, vaultId, c.env.DB);
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
                        'application/json': {
                            schema: resolver(v.object({
                                success: v.boolean(),
                                data: vaultSchema
                            }))
                        },
                    },
                },
                403: {
                    description: 'Permission denied',
                },
            },
        }),
        vValidator('json', updateVaultSchema),
        async (c) => {
            const session = c.get('currentSession');
            const vaultId = c.req.param('id');
            const data = c.req.valid('json');

            try {
                const vault = await updateVaultByEmail(session.user.email, vaultId, data, c.env.DB, c.env.KV);
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
                        'application/json': {
                            schema: resolver(v.object({
                                success: v.boolean(),
                                data: v.any(),
                                message: v.string()
                            }))
                        },
                    },
                },
                403: {
                    description: 'Permission denied',
                },
            },
        }),
        async (c) => {
            const session = c.get('currentSession');
            const vaultId = c.req.param('id');

            try {
                const vault = await deleteVaultByEmail(session.user.email, vaultId, c.env.DB, c.env.KV);
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
            description: 'Get vault statistics with optional filtering by date range',
            responses: {
                200: {
                    description: 'Successful response',
                    content: {
                        'application/json': {
                            schema: resolver(v.object({
                                success: v.boolean(),
                                data: v.any()
                            }))
                        },
                    },
                },
                404: {
                    description: 'Vault not found',
                },
            },
        }),
        async (c) => {
            const session = c.get('currentSession');
            const vaultId = c.req.param('id');

            // Get query parameters for filtering
            const startDate = c.req.query('startDate'); // ISO string from client
            const endDate = c.req.query('endDate'); // ISO string from client
            const memberIdsParam = c.req.query('memberIds');
            const memberIds = memberIdsParam ? memberIdsParam.split(',') : undefined;
            const limit = parseInt(c.req.query('limit') || '10');

            try {
                // Import handlers for expenses
                const {
                    getExpenses,
                    getExpensesSummary,
                    getMemberSpending
                } = await import('$lib/server/api/expenses/handlers');
                const {getUserByEmail} = await import('$lib/server/api/users/handlers');

                // Get user ID from email
                const user = await getUserByEmail(session.user.email, c.env.DB);
                if (!user) {
                    return c.json({
                        success: false,
                        error: 'User not found'
                    }, 404);
                }

                // Get filtered stats
                const [expensesResult, summaryResult, memberSpendingResult] = await Promise.all([
                    getExpenses(user.id, c.env.DB, {
                        vaultId,
                        startDate,
                        endDate,
                        memberIds,
                        limit
                    }),
                    getExpensesSummary(user.id, c.env.DB, {
                        vaultId,
                        startDate,
                        endDate,
                        memberIds
                    }),
                    getMemberSpending(user.id, c.env.DB, {
                        vaultId,
                        startDate,
                        endDate,
                        memberIds
                    })
                ]);

                return c.json({
                    success: true,
                    data: {
                        totalExpenses: expensesResult.pagination.total,
                        totalAmount: summaryResult.totalAmount,
                        avgAmount: expensesResult.pagination.total > 0 ? summaryResult.totalAmount / expensesResult.pagination.total : 0,
                        recentExpenses: expensesResult.expenses,
                        memberSpending: memberSpendingResult
                    }
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