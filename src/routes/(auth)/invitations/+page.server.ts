import type { PageServerLoad, Actions } from './$types';
import { getUserVaultInvitations, acceptVaultInvitation, declineVaultInvitation } from '$lib/server/api/vault-members/handlers';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, platform }) => {
    if (!locals.currentUser) {
        throw redirect(302, '/login');
    }

    if (!platform?.env?.DB) {
        throw new Error('Database not available');
    }

    try {
        const invitations = await getUserVaultInvitations(locals.currentUser.id, platform.env.DB);
        return {
            invitations
        };
    } catch (error) {
        console.error('Error loading invitations:', error);
        return {
            invitations: []
        };
    }
};

export const actions: Actions = {
    accept: async ({ request, locals, platform }) => {
        if (!locals.currentUser) {
            throw redirect(302, '/login');
        }

        if (!platform?.env?.DB) {
            throw new Error('Database not available');
        }

        const data = await request.formData();
        const invitationId = data.get('invitationId') as string;

        if (!invitationId) {
            return { success: false, error: 'Invitation ID is required' };
        }

        try {
            await acceptVaultInvitation(locals.currentUser.id, invitationId, platform.env.DB);
            return { success: true, message: 'Invitation accepted successfully' };
        } catch (error) {
            console.error('Error accepting invitation:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to accept invitation'
            };
        }
    },

    decline: async ({ request, locals, platform }) => {
        if (!locals.currentUser) {
            throw redirect(302, '/login');
        }

        if (!platform?.env?.DB) {
            throw new Error('Database not available');
        }

        const data = await request.formData();
        const invitationId = data.get('invitationId') as string;

        if (!invitationId) {
            return { success: false, error: 'Invitation ID is required' };
        }

        try {
            await declineVaultInvitation(locals.currentUser.id, invitationId, platform.env.DB);
            return { success: true, message: 'Invitation declined successfully' };
        } catch (error) {
            console.error('Error declining invitation:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to decline invitation'
            };
        }
    }
};