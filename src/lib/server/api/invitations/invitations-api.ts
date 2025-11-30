import {Hono} from 'hono';
import * as v from "valibot";
import {describeRoute, resolver} from "hono-openapi";
import {vValidator} from "@hono/valibot-validator";
import {createInvitationSchema, acceptInvitationSchema} from "$lib/schemas/invitations";
import {inviteUserToVault} from "$lib/server/api/invitations/inviteUserToVaultHandler";
import {acceptVaultInvitation} from "$lib/server/api/invitations/AcceptInvitationToVaultHandler";
import {getPendingInvitations} from "$lib/server/api/invitations/getPendingInvitationsHandler";

const INVITATION_TAG = ['Invitation'];
const commonInvitationConfig = {
    tags: INVITATION_TAG,
};

export const invitationsApi = new Hono<App.Api>()
    // Query: Get pending invitations (GET)
    .get(
        '/getPendingInvitations',
        describeRoute({
            ...commonInvitationConfig,
            description: 'Get all pending invitations for current user',
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
                const invitations = await getPendingInvitations(session, c.env);
                return c.json({
                    success: true,
                    data: invitations
                });
            } catch (error) {
                console.error({
                    message: 'Error fetching pending invitations',
                    error
                });
                return c.json({
                    success: false,
                    error: 'Failed to fetch pending invitations'
                }, 500);
            }
        })
    // Command: Create invitation (POST)
    .post(
        '/createInvitation',
        describeRoute({
            ...commonInvitationConfig,
            description: 'Invite a user to a vault',
            responses: {
                201: {
                    description: 'Successful response',
                    content: {
                        'application/json': {
                            schema: resolver(v.object({
                                success: v.boolean(),
                                data: v.object({
                                    invitation: v.any(),
                                    member: v.any()
                                })
                            }))
                        },
                    },
                },
            },
        }),
        vValidator('json', createInvitationSchema),
        async (c) => {
            const session = c.get('currentSession');
            const data = c.req.valid('json');

            try {
                const result = await inviteUserToVault(
                    data.vaultId,
                    data.inviteeEmail,
                    data.role,
                    session,
                    c.env
                );
                return c.json({
                    success: true,
                    data: result
                }, 201);
            } catch (error) {
                console.error({
                    message: 'Error creating invitation',
                    error
                });
                return c.json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Failed to create invitation'
                }, 500);
            }
        })
    // Command: Accept invitation (POST)
    .post(
        '/acceptInvitation',
        describeRoute({
            ...commonInvitationConfig,
            description: 'Accept a vault invitation',
            responses: {
                200: {
                    description: 'Successful response',
                    content: {
                        'application/json': {
                            schema: resolver(v.object({
                                success: v.boolean(),
                                data: v.object({
                                    member: v.any(),
                                    invitation: v.any()
                                })
                            }))
                        },
                    },
                },
                404: {
                    description: 'Invitation not found',
                },
            },
        }),
        vValidator('json', acceptInvitationSchema),
        async (c) => {
            const session = c.get('currentSession');
            const { invitationId } = c.req.valid('json');

            try {
                const result = await acceptVaultInvitation(
                    invitationId,
                    session,
                    c.env
                );

                return c.json({
                    success: true,
                    data: result
                });
            } catch (error) {
                console.error({
                    message: `Error accepting invitation`,
                    error
                })
                const status = error instanceof Error && error.message.includes('not found') ? 404 : 500;
                return c.json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Failed to accept invitation'
                }, status);
            }
        })
