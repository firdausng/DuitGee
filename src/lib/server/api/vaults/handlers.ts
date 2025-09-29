import { drizzle } from "drizzle-orm/d1";
import * as schema from "$lib/server/db/schema";
import { vaults, vaultMembers, users } from "$lib/server/db/schema";
import { and, eq, or, desc, sql } from "drizzle-orm";
import { createId } from '@paralleldrive/cuid2';
import type {Vault} from "$lib/server/api/vaults/schema";
import type { GetUserVaultsResponse } from "$lib/types/vaults";
import {formatISO} from "date-fns";

// Get all vaults for a user (owned + member of)
export const getUserVaults = async (userId: string, db: D1Database): Promise<GetUserVaultsResponse> => {
    const client = drizzle(db, { schema });

    const userVaults = await client
        .select({
            vault: {
                id: vaults.id,
                name: vaults.name,
                description: vaults.description,
                color: vaults.color,
                icon: vaults.icon,
                iconType: vaults.iconType,
                isPersonal: vaults.isPersonal,
                ownerId: vaults.ownerId,
                createdAt: vaults.createdAt
            },
            owner: {
                id: users.id,
                firstName: users.firstName,
                lastName: users.lastName,
                email: users.email
            },
            membership: {
                role: vaultMembers.role,
                permissions: vaultMembers.permissions,
                status: vaultMembers.status,
                joinedAt: vaultMembers.joinedAt
            }
        })
        .from(vaults)
        .leftJoin(users, eq(vaults.ownerId, users.id))
        .leftJoin(vaultMembers, eq(vaults.id, vaultMembers.vaultId))
        .where(
            or(
                eq(vaults.ownerId, userId), // Vaults owned by user
                and(
                    eq(vaultMembers.userId, userId),
                    eq(vaultMembers.status, 'active')
                )
            )
        )
        .orderBy(desc(vaults.createdAt));

    return userVaults;
};

// Get a specific vault with member details
export const getVault = async (userId: string, vaultId: string, db: D1Database) => {
    const client = drizzle(db, { schema });

    // First check if user has access to this vault
    const hasAccess = await client
        .select({ id: vaults.id })
        .from(vaults)
        .leftJoin(vaultMembers, eq(vaults.id, vaultMembers.vaultId))
        .where(
            and(
                eq(vaults.id, vaultId),
                or(
                    eq(vaults.ownerId, userId), // Owner
                    and(
                        eq(vaultMembers.userId, userId),
                        eq(vaultMembers.status, 'active')
                    ) // Active member
                )
            )
        )
        .limit(1);

    if (hasAccess.length === 0) {
        throw new Error('Vault not found or access denied');
    }

    // Get vault details
    const vault = await client
        .select()
        .from(vaults)
        .where(eq(vaults.id, vaultId))
        .limit(1);

    // Get vault members
    const members = await client
        .select({
            id: vaultMembers.id,
            role: vaultMembers.role,
            permissions: vaultMembers.permissions,
            status: vaultMembers.status,
            invitedAt: vaultMembers.invitedAt,
            joinedAt: vaultMembers.joinedAt,
            user: {
                id: users.id,
                firstName: users.firstName,
                lastName: users.lastName,
                email: users.email
            }
        })
        .from(vaultMembers)
        .leftJoin(users, eq(vaultMembers.userId, users.id))
        .where(eq(vaultMembers.vaultId, vaultId))
        .orderBy(vaultMembers.joinedAt);

    return {
        vault: vault[0],
        members
    };
};

// Create a new vault
export const createVault = async (userId: string, data: Vault, db: D1Database) => {
    const client = drizzle(db, { schema });

    console.log(`[createVault.handler] Creating vault: ${JSON.stringify({
        ...data,
        ownerId: userId
    }, null, 2)}`);

    try {
        const vault = await client
            .insert(vaults)
            .values({
                id: createId(),
                ...data,
                ownerId: userId,
                createdBy: userId,
                createdAt: formatISO(new Date()),
                updatedAt: formatISO(new Date())
            })
            .returning();

        // For non-personal vaults, add owner as admin member
        if (!data.isPersonal) {
            await client
                .insert(vaultMembers)
                .values({
                    id: createId(),
                    vaultId: vault[0].id,
                    userId: userId,
                    role: 'owner',
                    permissions: 'admin',
                    status: 'active',
                    joinedAt: formatISO(new Date()),
                    updatedAt: formatISO(new Date())
                });
        }

        console.log(`[createVault.handler] Successfully created vault`);
        return vault[0];
    } catch (error) {
        console.log(`[createVault.handler] Error creating vault: ${error}`);
        throw error;
    }
};

// Update vault
export const updateVault = async (userId: string, vaultId: string, data: any, db: D1Database) => {
    const client = drizzle(db, { schema });

    // Check if user is owner or has admin permissions
    const canEdit = await client
        .select({ id: vaults.id })
        .from(vaults)
        .leftJoin(vaultMembers, eq(vaults.id, vaultMembers.vaultId))
        .where(
            and(
                eq(vaults.id, vaultId),
                or(
                    eq(vaults.ownerId, userId), // Owner
                    and(
                        eq(vaultMembers.userId, userId),
                        eq(vaultMembers.permissions, 'admin'),
                        eq(vaultMembers.status, 'active')
                    ) // Admin member
                )
            )
        )
        .limit(1);

    if (canEdit.length === 0) {
        throw new Error('Permission denied: Cannot edit this vault');
    }

    const updatedVault = await client
        .update(vaults)
        .set({
            ...data,
            updatedAt: new Date()
        })
        .where(eq(vaults.id, vaultId))
        .returning();

    return updatedVault[0];
};

// Delete vault
export const deleteVault = async (userId: string, vaultId: string, db: D1Database) => {
    const client = drizzle(db, { schema });

    // Only owner can delete vault
    const vault = await client
        .select()
        .from(vaults)
        .where(
            and(
                eq(vaults.id, vaultId),
                eq(vaults.ownerId, userId)
            )
        )
        .limit(1);

    if (vault.length === 0) {
        throw new Error('Permission denied: Only vault owner can delete vault');
    }

    const deletedVault = await client
        .delete(vaults)
        .where(eq(vaults.id, vaultId))
        .returning();

    return deletedVault[0];
};

// Get vault statistics
export const getVaultStats = async (userId: string, vaultId: string, db: D1Database) => {
    const client = drizzle(db, { schema });

    // Check access first
    const hasAccess = await client
        .select({ id: vaults.id })
        .from(vaults)
        .leftJoin(vaultMembers, eq(vaults.id, vaultMembers.vaultId))
        .where(
            and(
                eq(vaults.id, vaultId),
                or(
                    eq(vaults.ownerId, userId),
                    and(
                        eq(vaultMembers.userId, userId),
                        eq(vaultMembers.status, 'active')
                    )
                )
            )
        )
        .limit(1);

    if (hasAccess.length === 0) {
        throw new Error('Vault not found or access denied');
    }

    // Get expense statistics for this vault
    const stats = await client
        .select({
            totalExpenses: sql<number>`COUNT(*)`.mapWith(Number),
            totalAmount: sql<number>`SUM(amount)`.mapWith(Number),
            avgAmount: sql<number>`AVG(amount)`.mapWith(Number)
        })
        .from(schema.expenses)
        .where(eq(schema.expenses.vaultId, vaultId));

    return stats[0];
};