import { drizzle } from "drizzle-orm/d1";
import * as schema from "$lib/server/db/schema";
import { vaults, vaultMembers } from "$lib/server/db/schema";
import {and, eq, or, desc, sql, isNull} from "drizzle-orm";
import { createId } from '@paralleldrive/cuid2';
import type {UserVault} from "$lib/types/vaults";
import {formatISO} from "date-fns";
import { invalidateUserVaultsCache, invalidateVaultMembersCache } from "$lib/server/utils/kv-cache";
import type {CreateVault} from "$lib/schemas/expense";
import { compareDesc } from "date-fns";
import { UTCDate } from "@date-fns/utc";
import {requireVaultPermission} from "$lib/server/utils/permissions";


// Get all vaults for a user (owned + member of)
export const getUserVaults = async (userId: string, db: D1Database, kv?: KVNamespace): Promise<UserVault[]> => {
    // Try to get from KV cache first
    // const cached = await getUserVaultsFromCache(userId, kv);
    // if (cached) {
    //     return cached;
    // }

    const client = drizzle(db, { schema });

    // Get member vaults (where user is not the owner)
    const allVaults = await client
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
            owner: vaults.ownerId,
            membership: {
                role: vaultMembers.role,
                permissions: vaultMembers.permissions,
                status: vaultMembers.status,
                joinedAt: vaultMembers.joinedAt
            }
        })
        .from(vaults)
        .leftJoin(vaultMembers, eq(vaults.id, vaultMembers.vaultId))
        .where(
            and(
                eq(vaultMembers.userId, userId),
                eq(vaultMembers.status, 'active'),
                // sql`${vaults.ownerId} != ${userId}` // Exclude vaults where user is owner
            )
        )
        .orderBy(desc(vaults.createdAt));

    // Combine and sort all vaults
    // const allVaults = [...ownedVaults, ...memberVaults];
    allVaults.sort((a, b) =>
        compareDesc(new Date(a.vault.createdAt!), new Date(b.vault.createdAt!))
    );

    // console.log('allVaults', allVaults);
    // Cache the result in KV
    // await setUserVaultsCache(userId, allVaults, kv);

    return allVaults;
};


// Get vault members (owner + active members)
export const getVaultMembers = async (userId: string, vaultId: string, db: D1Database) => {
    const client = drizzle(db, { schema });

    // First check if user has access to this vault
    await requireVaultPermission(userId, vaultId, 'canViewVault', db);

    const results = await client
        .select({
            userId: sql<string>`COALESCE(${vaultMembers.userId}, ${vaults.ownerId})`,
            role: sql<string>`
                CASE 
                    WHEN ${vaultMembers.role} IS NULL THEN 'owner' 
                    ELSE ${vaultMembers.role} 
                END
            `,
            status: sql<string>`
                CASE 
                    WHEN ${vaultMembers.role} IS NULL THEN 'active' 
                    ELSE ${vaultMembers.status} 
                END
            `,
        })
        .from(vaults)
        .leftJoin(vaultMembers, eq(vaults.id, vaultMembers.vaultId))
        .where(
            and(
                eq(vaults.id, vaultId),
                or(
                    eq(vaultMembers.status, 'active'),
                    isNull(vaultMembers.status) // include owner
                )
            )
        );

    // Deduplicate and normalize (in case of multiple members)
    const membersMap = new Map<string, any>();

    results.forEach(row => {
        if (!membersMap.has(row.userId)) {
            membersMap.set(row.userId, {
                userId: row.userId,
                role: row.role,
                status: row.status
            });
        }
    });

    return Array.from(membersMap.values());
};

// Get a specific vault with member details
export const getVault = async (userId: string, vaultId: string, db: D1Database) => {
    const client = drizzle(db, { schema });

    // First check if user has access to this vault
    await requireVaultPermission(userId, vaultId, 'canViewVault', db);

    // Get vault details
    const vault = await client
        .select()
        .from(vaults)
        .where(eq(vaults.id, vaultId))
        .limit(1);


    // Get vault members from vaultMembers table
    const members = await client
        .select({
            id: vaultMembers.id,
            role: vaultMembers.role,
            permissions: vaultMembers.permissions,
            status: vaultMembers.status,
            invitedAt: vaultMembers.invitedAt,
            joinedAt: vaultMembers.joinedAt,
            userId: vaultMembers.userId
        })
        .from(vaultMembers)
        .where(eq(vaultMembers.vaultId, vaultId))
        .orderBy(vaultMembers.joinedAt);

    // Create owner member object (without user details)
    const ownerMember = {
        id: `owner_${vault[0].id}`, // Unique ID for owner
        role: 'owner',
        permissions: 'admin',
        status: 'active',
        invitedAt: vault[0].createdAt,
        joinedAt: vault[0].createdAt,
        userId: vault[0].ownerId,
        user: null
    };

    // Check if owner is already in members list (for non-personal vaults)
    const ownerInMembers = members.find(member => member.userId === vault[0].ownerId);

    // Build final members list
    let allMembers = [];
    if (!ownerInMembers) {
        // Owner not in members list (personal vault), add them first
        allMembers = [ownerMember, ...members.map(m => ({ ...m, user: null }))];
    } else {
        // Owner in members list (non-personal vault), update their role
        allMembers = members.map(member =>
            member.userId === vault[0].ownerId
                ? { ...member, role: 'owner', permissions: 'admin', user: null }
                : { ...member, user: null }
        );
    }

    return {
        vault: vault[0],
        members: allMembers
    };
};


// Create a new vault
export const createVault = async (userId: string, data: CreateVault, db: D1Database, kv?: KVNamespace) => {
    const client = drizzle(db, { schema });

    try {
        const vault = await client
            .insert(vaults)
            .values({
                id: createId(),
                ...data,
                ownerId: userId,
                createdBy: userId,
                createdAt: formatISO(new UTCDate()),
                updatedAt: formatISO(new UTCDate())
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
                    joinedAt: formatISO(new UTCDate()),
                    updatedAt: formatISO(new UTCDate())
                });
        }

        // Invalidate user's vault cache
        await invalidateUserVaultsCache(userId, kv);

        return vault[0];
    } catch (error) {
        console.log({
            message: `[createVault.handler] Error creating vault: ${error}`,
            error
        });
        throw error;
    }
};

// Update vault
export const updateVault = async (userId: string, vaultId: string, data: any, db: D1Database, kv?: KVNamespace) => {
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
            updatedAt: formatISO(new UTCDate())
        })
        .where(eq(vaults.id, vaultId))
        .returning();

    // Get all vault members to invalidate their caches
    const members = await client
        .select({ userId: vaultMembers.userId })
        .from(vaultMembers)
        .where(eq(vaultMembers.vaultId, vaultId));

    const memberIds = [updatedVault[0].ownerId, ...members.map(m => m.userId!)];
    await invalidateVaultMembersCache(memberIds, kv);

    return updatedVault[0];
};

// Delete vault
export const deleteVault = async (userId: string, vaultId: string, db: D1Database, kv?: KVNamespace) => {
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

    // Get all vault members before deletion
    const members = await client
        .select({ userId: vaultMembers.userId })
        .from(vaultMembers)
        .where(eq(vaultMembers.vaultId, vaultId));

    const deletedVault = await client
        .delete(vaults)
        .where(eq(vaults.id, vaultId))
        .returning();

    // Invalidate cache for owner and all members
    const memberIds = [userId, ...members.map(m => m.userId!)];
    await invalidateVaultMembersCache(memberIds, kv);

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