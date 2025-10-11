import { Hono } from 'hono';
import * as v from "valibot";
import { vValidator } from "@hono/valibot-validator";
import {
    inviteUserToVault,
    acceptVaultInvitation,
    declineVaultInvitation,
    removeUserFromVault,
    updateVaultMember,
    getUserVaultInvitations
} from "$lib/server/api/vault-members/handlers";
import { describeRoute, resolver } from 'hono-openapi';
import {getInvitationsByEmailSchema, inviteUserSchema, updateMemberSchema} from "$lib/schemas/expense";

const VAULT_MEMBER_TAG = ['Vault Member'];
const commonVaultMemberConfig = {
    tags: VAULT_MEMBER_TAG,
};

export const vaultMembersApi = new Hono<App.Api>()

    .post(
        '/invite/:vaultId',
        describeRoute({
            ...commonVaultMemberConfig,
            description: 'Invite user to vault',
            responses: {
                201: {
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
                404: {
                    description: 'User not found',
                },
                409: {
                    description: 'User already invited',
                },
            },
        }),
        vValidator('json', inviteUserSchema),
        async (c) => {
            const session = c.get('currentSession');
            const vaultId = c.req.param('vaultId');
        const data = c.req.valid('json');

        try {
            const result = await inviteUserToVault(
                session.user.email,
                vaultId,
                data.email,
                data.role,
                data.permissions,
                c.env.DB
            );
            return c.json({
                success: true,
                data: result,
                message: 'User invited successfully'
            }, 201);
        } catch (error) {
            console.error('Error inviting user:', error);
            let status = 500;
            if (error instanceof Error) {
                if (error.message.includes('Permission denied')) status = 403;
                else if (error.message.includes('User not found')) status = 404;
                else if (error.message.includes('already')) status = 409;
            }
            return c.json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to invite user'
            },  status);
        }
    })

    .put(
        '/invitations/:invitationId/accept',
        describeRoute({
            ...commonVaultMemberConfig,
            description: 'Accept vault invitation',
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
                404: {
                    description: 'Invitation not found',
                },
            },
        }),
        async (c) => {
            const session = c.get('currentSession');
        const invitationId = c.req.param('invitationId');

        try {
            const membership = await acceptVaultInvitation(session.user.id, invitationId, c.env.DB);
            return c.json({
                success: true,
                data: membership,
                message: 'Invitation accepted successfully'
            });
        } catch (error) {
            console.error('Error accepting invitation:', error);
            const status = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            return c.json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to accept invitation'
            }, status);
        }
    })

    .put(
        '/invitations/:invitationId/decline',
        describeRoute({
            ...commonVaultMemberConfig,
            description: 'Decline vault invitation',
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
                404: {
                    description: 'Invitation not found',
                },
            },
        }),
        async (c) => {
            const session = c.get('currentSession');
        const invitationId = c.req.param('invitationId');

        try {
            const membership = await declineVaultInvitation(session.user.id, invitationId, c.env.DB);
            return c.json({
                success: true,
                data: membership,
                message: 'Invitation declined successfully'
            });
        } catch (error) {
            console.error('Error declining invitation:', error);
            const status = error instanceof Error && error.message.includes('not found') ? 404 : 500;
            return c.json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to decline invitation'
            }, status);
        }
    })

    .delete(
        '/:vaultId/members/:userId',
        describeRoute({
            ...commonVaultMemberConfig,
            description: 'Remove user from vault',
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
                400: {
                    description: 'Cannot remove vault owner',
                },
                403: {
                    description: 'Permission denied',
                },
            },
        }),
        async (c) => {
            const session = c.get('currentSession');
        const vaultId = c.req.param('vaultId');
        const userId = c.req.param('userId');

        try {
            const membership = await removeUserFromVault(userId, vaultId, session.user.id, c.env.DB);
            return c.json({
                success: true,
                data: membership,
                message: 'User removed from vault successfully'
            });
        } catch (error) {
            console.error('Error removing user from vault:', error);
            let status = 500;
            if (error instanceof Error) {
                if (error.message.includes('Permission denied')) status = 403;
                else if (error.message.includes('Cannot remove vault owner')) status = 400;
            }
            return c.json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to remove user from vault'
            }, status);
        }
    })

    .put(
        '/:vaultId/members/:userId',
        describeRoute({
            ...commonVaultMemberConfig,
            description: 'Update member role/permissions',
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
                400: {
                    description: 'Cannot update vault owner',
                },
                403: {
                    description: 'Permission denied',
                },
            },
        }),
        vValidator('json', updateMemberSchema),
        async (c) => {
            const session = c.get('currentSession');
        const vaultId = c.req.param('vaultId');
        const userId = c.req.param('userId');
        const updates = c.req.valid('json');

        try {
            const membership = await updateVaultMember(session.user.id, vaultId, userId, updates, c.env.DB);
            return c.json({
                success: true,
                data: membership,
                message: 'Member updated successfully'
            });
        } catch (error) {
            console.error('Error updating member:', error);
            let status = 500;
            if (error instanceof Error) {
                if (error.message.includes('Permission denied')) status = 403;
                else if (error.message.includes('Cannot update vault owner')) status = 400;
            }
            return c.json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update member'
            }, status);
        }
    })

    .get(
        '/invitations',
        describeRoute({
            ...commonVaultMemberConfig,
            description: 'Get user\'s vault invitations',
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
            const session = c.get('currentSession');

        try {
            const invitations = await getUserVaultInvitations(session.user.id, c.env.DB);
            return c.json({
                success: true,
                data: invitations
            });
        } catch (error) {
            console.error('Error fetching invitations:', error);
            return c.json({
                success: false,
                error: 'Failed to fetch invitations'
            }, 500);
        }
    });