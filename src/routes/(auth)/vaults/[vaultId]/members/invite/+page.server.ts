import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { redirect, error } from '@sveltejs/kit';
import * as v from 'valibot';
import type { PageServerLoad, Actions } from './$types.js';
import { createNotification } from '$lib/server/api/notifications/handlers';
import {getUserVaultsByEmail, getVault} from "$lib/server/api/vaults/handlers";
import {getUserByEmail} from "$lib/server/api/users/handlers";
import {getUserVaultInvitationsByEmail, inviteUserToVault} from "$lib/server/api/vault-members/handlers";
import type {CreateNotification, NotificationType} from "$lib/schemas/expense";

// Schema for inviting a user
const inviteUserSchema = v.object({
    email: v.pipe(
        v.string(),
        v.email('Please enter a valid email address'),
        v.minLength(1, 'Email is required')
    ),
    role: v.pipe(
        v.string(),
        v.picklist(['admin', 'member'], 'Please select a valid role')
    ),
    message: v.optional(v.string(), '')
});

export const load: PageServerLoad = async ({ locals, platform, params }) => {
    if (!platform?.env?.DB) {
        throw error(500, 'Database not available');
    }

    const { vaultId } = params;

    if (!locals.currentUser) {
        throw error(401, 'Unauthorized');
    }

    // TODO: Verify user has permission to invite others to this vault
    // (owner or admin role)

    const form = await superValidate(valibot(inviteUserSchema));

    // Set default role
    form.data.role = 'member';

    // Mock vault data - replace with actual vault lookup
    const mockVault = {
        id: vaultId,
        name: 'Sample Vault',
        ownerId: locals.currentUser.id,
        isPersonal: false
    };

    return {
        form,
        vault: mockVault
    };
};

export const actions: Actions = {
    default: async ({ request, locals, platform, params }) => {
        if (!platform?.env?.DB) {
            throw error(500, 'Database not available');
        }

        if (!locals.currentUser) {
            throw error(401, 'Unauthorized');
        }

        const { vaultId } = params;
        const form = await superValidate(request, valibot(inviteUserSchema));

        if (!form.valid) {
            return { form };
        }

        try {
            // TODO: Implement actual invitation logic:
            // 2. Check if user is already a member of this vault
            const invitedUserVaults = await getUserVaultsByEmail(form.data.email, platform.env.DB);
            const isAlreadyInVault = invitedUserVaults.some(v => v.vault.id === vaultId);
            console.log('isAlreadyInVault', isAlreadyInVault);

            if (isAlreadyInVault) {
                return {
                    form,
                    error: 'User is already a member of this vault.'
                }
            }

            const invitation = await getUserVaultInvitationsByEmail(form.data.email, platform.env.DB);

            const alreadyInvited = invitation.some(v => v.vault?.id === vaultId);
            if (alreadyInvited) {
                return {
                    form,
                    error: 'User is already invited to the vault.'
                }
            }

            // 3. Create vault member invitation

            const userInvitation = await inviteUserToVault(locals.currentUser.id, vaultId, form.data.email, form.data.role, form.data.role, platform.env.DB);

            // 4. Send invitation email (optional)

            console.log('Invitation data:', {
                vaultId,
                email: form.data.email,
                role: form.data.role,
                message: form.data.message,
                invitedBy: locals.currentUser.id
            });

            // 5. Create notification for the invited user (mock for now)
            // In real implementation, you would find the user by email first
            const mockInvitedUserId = 'mock-user-id'; // Replace with actual user lookup
            const vaultName = 'Sample Vault'; // Replace with actual vault name lookup

            // Create notification for the invited user
            const notificationData = createNotificationData(
                mockInvitedUserId,
                'vault_invitation',
                'Vault Invitation',
                `${locals.currentUser.firstName || locals.currentUser.email} invited you to join "${vaultName}" vault${form.data.message ? `: "${form.data.message}"` : ''}`,
                {
                    relatedId: vaultId,
                    relatedType: 'vault',
                    actionUrl: `/vaults/${vaultId}`,
                    metadata: {
                        invitedBy: locals.currentUser.id,
                        inviterName: locals.currentUser.firstName || locals.currentUser.email,
                        role: form.data.role,
                        vaultName
                    }
                }
            );

            await createNotification(notificationData, platform.env.DB);

            // For now, just simulate success
            await new Promise(resolve => setTimeout(resolve, 500));

            // Redirect back to members page
            return {
                form,
                message: 'Invitation sent successfully!'
            }

        } catch (redirectError) {
            console.error('Error inviting user:', redirectError);
            form.errors._errors = ['Failed to send invitation. Please try again.'];
            return { form };
        }
    }
};

function createNotificationData(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    options?: {
        relatedId?: string;
        relatedType?: string;
        actionUrl?: string;
        metadata?: Record<string, any>;
    }
): CreateNotification {
    return {
        userId,
        type,
        title,
        message,
        isRead: false,
        relatedId: options?.relatedId || null,
        relatedType: options?.relatedType || null,
        actionUrl: options?.actionUrl || null,
        metadata: options?.metadata ? JSON.stringify(options.metadata) : null
    };
}