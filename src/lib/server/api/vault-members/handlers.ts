import { drizzle } from "drizzle-orm/d1";
import * as schema from "$lib/server/db/schema";
import { vaults, vaultMembers } from "$lib/server/db/schema";
import { and, eq, or } from "drizzle-orm";
import { createId } from '@paralleldrive/cuid2';

// Invite a user to a vault
export const inviteUserToVault = async (
    inviterId: string,
    vaultId: string,
    inviteeEmail: string,
    role: string,
    permissions: string,
    db: D1Database
) => {
    const client = drizzle(db, { schema });

    // Check if inviter has permission to invite (owner or admin)
    const canInvite = await client
        .select({ id: vaults.id })
        .from(vaults)
        .leftJoin(vaultMembers, eq(vaults.id, vaultMembers.vaultId))
        .where(
            and(
                eq(vaults.id, vaultId),
                or(
                    eq(vaults.ownerId, inviterId), // Owner
                    and(
                        eq(vaultMembers.userId, inviterId),
                        eq(vaultMembers.permissions, 'admin'),
                        eq(vaultMembers.status, 'active')
                    ) // Admin member
                )
            )
        )
        .limit(1);

    if (canInvite.length === 0) {
        throw new Error('Permission denied: Cannot invite users to this vault');
    }

    // Find the user by email
    const inviteeUser = await client
        .select()
        .from(users)
        .where(eq(users.email, inviteeEmail))
        .limit(1);

    if (inviteeUser.length === 0) {
        throw new Error('User not found with that email address');
    }

    const inviteeId = inviteeUser[0].id;

    // Check if user is already a member or has pending invitation
    const existingMembership = await client
        .select()
        .from(vaultMembers)
        .where(
            and(
                eq(vaultMembers.vaultId, vaultId),
                eq(vaultMembers.userId, inviteeId)
            )
        )
        .limit(1);

    if (existingMembership.length > 0) {
        const status = existingMembership[0].status;
        if (status === 'active') {
            throw new Error('User is already a member of this vault');
        } else if (status === 'pending') {
            throw new Error('User already has a pending invitation to this vault');
        }
    }

    // Create the invitation
    const invitation = await client
        .insert(vaultMembers)
        .values({
            id: createId(),
            vaultId: vaultId,
            userId: inviteeId,
            role: role,
            permissions: permissions,
            invitedBy: inviterId,
            invitedAt: new Date().toISOString(),
            status: 'pending',
            createdAt: new Date().toISOString()
        })
        .returning();

    return {
        invitation: invitation[0],
        inviteeUser: inviteeUser[0]
    };
};

// Accept vault invitation
export const acceptVaultInvitation = async (userId: string, invitationId: string, db: D1Database) => {
    const client = drizzle(db, { schema });

    console.log('[acceptVaultInvitation] userId:', userId, 'invitationId:', invitationId);

    // First check if invitation exists at all
    const anyInvitation = await client
        .select()
        .from(vaultMembers)
        .where(eq(vaultMembers.id, invitationId))
        .limit(1);

    console.log('[acceptVaultInvitation] anyInvitation:', anyInvitation);

    // Find the invitation
    const invitation = await client
        .select()
        .from(vaultMembers)
        .where(
            and(
                eq(vaultMembers.id, invitationId),
                eq(vaultMembers.userId, userId),
                eq(vaultMembers.status, 'pending')
            )
        )
        .limit(1);

    console.log('[acceptVaultInvitation] invitation found:', invitation);

    if (invitation.length === 0) {
        if (anyInvitation.length === 0) {
            throw new Error('Invitation not found');
        }
        if (anyInvitation[0].userId !== userId) {
            throw new Error('This invitation is not for you');
        }
        if (anyInvitation[0].status !== 'pending') {
            throw new Error(`Invitation already ${anyInvitation[0].status}`);
        }
        throw new Error('Invitation not found or already processed');
    }

    // Accept the invitation
    const updatedMembership = await client
        .update(vaultMembers)
        .set({
            status: 'active',
            joinedAt: new Date().toISOString()
        })
        .where(eq(vaultMembers.id, invitationId))
        .returning();

    return updatedMembership[0];
};

// Decline vault invitation
export const declineVaultInvitation = async (userId: string, invitationId: string, db: D1Database) => {
    const client = drizzle(db, { schema });

    // Find the invitation
    const invitation = await client
        .select()
        .from(vaultMembers)
        .where(
            and(
                eq(vaultMembers.id, invitationId),
                eq(vaultMembers.userId, userId),
                eq(vaultMembers.status, 'pending')
            )
        )
        .limit(1);

    if (invitation.length === 0) {
        throw new Error('Invitation not found or already processed');
    }

    // Decline the invitation
    const updatedMembership = await client
        .update(vaultMembers)
        .set({
            status: 'declined'
        })
        .where(eq(vaultMembers.id, invitationId))
        .returning();

    return updatedMembership[0];
};

// Remove user from vault
export const removeUserFromVault = async (
    removerId: string,
    vaultId: string,
    userId: string,
    db: D1Database
) => {
    const client = drizzle(db, { schema });

    // Check if remover has permission (owner or admin)
    const canRemove = await client
        .select({ id: vaults.id })
        .from(vaults)
        .leftJoin(vaultMembers, eq(vaults.id, vaultMembers.vaultId))
        .where(
            and(
                eq(vaults.id, vaultId),
                or(
                    eq(vaults.ownerId, removerId), // Owner
                    and(
                        eq(vaultMembers.userId, removerId),
                        eq(vaultMembers.permissions, 'admin'),
                        eq(vaultMembers.status, 'active')
                    ) // Admin member
                )
            )
        )
        .limit(1);

    if (canRemove.length === 0) {
        throw new Error('Permission denied: Cannot remove users from this vault');
    }

    // Cannot remove vault owner
    const vault = await client
        .select()
        .from(vaults)
        .where(eq(vaults.id, vaultId))
        .limit(1);

    if (vault[0].ownerId === userId) {
        throw new Error('Cannot remove vault owner');
    }

    // Remove the user
    const removedMembership = await client
        .update(vaultMembers)
        .set({
            status: 'removed'
        })
        .where(
            and(
                eq(vaultMembers.vaultId, vaultId),
                eq(vaultMembers.userId, userId)
            )
        )
        .returning();

    return removedMembership[0];
};

// Update member role/permissions
export const updateVaultMember = async (
    updaterId: string,
    vaultId: string,
    userId: string,
    updates: { role?: string; permissions?: string },
    db: D1Database
) => {
    const client = drizzle(db, { schema });

    // Check if updater has permission (owner or admin)
    const canUpdate = await client
        .select({ id: vaults.id })
        .from(vaults)
        .leftJoin(vaultMembers, eq(vaults.id, vaultMembers.vaultId))
        .where(
            and(
                eq(vaults.id, vaultId),
                or(
                    eq(vaults.ownerId, updaterId), // Owner
                    and(
                        eq(vaultMembers.userId, updaterId),
                        eq(vaultMembers.permissions, 'admin'),
                        eq(vaultMembers.status, 'active')
                    ) // Admin member
                )
            )
        )
        .limit(1);

    if (canUpdate.length === 0) {
        throw new Error('Permission denied: Cannot update member permissions');
    }

    // Cannot update vault owner role
    const vault = await client
        .select()
        .from(vaults)
        .where(eq(vaults.id, vaultId))
        .limit(1);

    if (vault[0].ownerId === userId) {
        throw new Error('Cannot update vault owner role');
    }

    // Update the member
    const updatedMembership = await client
        .update(vaultMembers)
        .set(updates)
        .where(
            and(
                eq(vaultMembers.vaultId, vaultId),
                eq(vaultMembers.userId, userId),
                eq(vaultMembers.status, 'active')
            )
        )
        .returning();

    return updatedMembership[0];
};

// Get user's vault invitations by email
export const getUserVaultInvitationsByEmail = async (userEmail: string, db: D1Database) => {
    const client = drizzle(db, { schema });

    // First, find the user by email
    const user = await client
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, userEmail))
        .limit(1);

    if (user.length === 0) {
        throw new Error('User not found');
    }

    // Then get their invitations using the existing function
    return getUserVaultInvitations(user[0].id, db);
};

// Get user's vault invitations
export const getUserVaultInvitations = async (userId: string, db: D1Database) => {
    const client = drizzle(db, { schema });

    const invitations = await client
        .select({
            invitation: {
                id: vaultMembers.id,
                role: vaultMembers.role,
                permissions: vaultMembers.permissions,
                invitedAt: vaultMembers.invitedAt,
                status: vaultMembers.status
            },
            vault: {
                id: vaults.id,
                name: vaults.name,
                description: vaults.description,
                color: vaults.color,
                icon: vaults.icon,
                iconType: vaults.iconType
            },
            inviter: {
                id: users.id,
                name: users.name,
                email: users.email
            }
        })
        .from(vaultMembers)
        .leftJoin(vaults, eq(vaultMembers.vaultId, vaults.id))
        .leftJoin(users, eq(vaultMembers.invitedBy, users.id))
        .where(
            and(
                eq(vaultMembers.userId, userId),
                eq(vaultMembers.status, 'pending')
            )
        )
        .orderBy(vaultMembers.invitedAt);

    return invitations;
};