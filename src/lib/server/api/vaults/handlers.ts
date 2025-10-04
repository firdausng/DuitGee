import { drizzle } from "drizzle-orm/d1";
import * as schema from "$lib/server/db/schema";
import { vaults, vaultMembers, users } from "$lib/server/db/schema";
import { and, eq, or, desc, sql } from "drizzle-orm";
import { createId } from '@paralleldrive/cuid2';
import type {UserVault} from "$lib/types/vaults";
import {formatISO} from "date-fns";
import { getUserVaultsFromCache, setUserVaultsCache, invalidateUserVaultsCache, invalidateVaultMembersCache } from "$lib/server/utils/kv-cache";
import type {CreateVault, Vault} from "$lib/schemas/expense";
import { compareDesc } from "date-fns";

// Get all vaults for a user by email (owned + member of)
export const getUserVaultsByEmail = async (userEmail: string, db: D1Database): Promise<UserVault[]> => {
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

    // Then get their vaults using the existing function
    return getUserVaults(user[0].id, db);
};

// Get all vaults for a user (owned + member of)
export const getUserVaults = async (userId: string, db: D1Database, kv?: KVNamespace): Promise<UserVault[]> => {
    // Try to get from KV cache first
    const cached = await getUserVaultsFromCache(userId, kv);
    if (cached) {
        return cached;
    }

    const client = drizzle(db, { schema });

    // Get owned vaults
    const ownedVaults = await client
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
                role: sql`'owner'`.as('role'),
                permissions: sql`'admin'`.as('permissions'),
                status: sql`'active'`.as('status'),
                joinedAt: vaults.createdAt
            }
        })
        .from(vaults)
        .leftJoin(users, eq(vaults.ownerId, users.id))
        .where(eq(vaults.ownerId, userId))
        .orderBy(desc(vaults.createdAt));

    // Get member vaults (where user is not the owner)
    const memberVaults = await client
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
            and(
                eq(vaultMembers.userId, userId),
                eq(vaultMembers.status, 'active'),
                sql`${vaults.ownerId} != ${userId}` // Exclude vaults where user is owner
            )
        )
        .orderBy(desc(vaults.createdAt));

    // Combine and sort all vaults
    const allVaults = [...ownedVaults, ...memberVaults];
    allVaults.sort((a, b) =>
        compareDesc(new Date(a.vault.createdAt!), new Date(b.vault.createdAt!))
    );

    // Cache the result in KV
    await setUserVaultsCache(userId, allVaults, kv);

    return allVaults;
};

// Get a specific vault with member details by email
export const getVaultByEmail = async (userEmail: string, vaultId: string, db: D1Database) => {
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

    // Then get the vault using the existing function
    return getVault(user[0].id, vaultId, db);
};

// Get vault members (owner + active members)
export const getVaultMembers = async (vaultId: string, db: D1Database) => {
    const client = drizzle(db, { schema });

    // Get vault owner
    const vaultData = await client
        .select({
            ownerId: vaults.ownerId,
            ownerFirstName: users.firstName,
            ownerLastName: users.lastName,
            ownerEmail: users.email
        })
        .from(vaults)
        .leftJoin(users, eq(vaults.ownerId, users.id))
        .where(eq(vaults.id, vaultId))
        .limit(1);

    // Fetch vault members
    const vaultMembers_list = await client
        .select({
            userId: vaultMembers.userId,
            role: vaultMembers.role,
            status: vaultMembers.status,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email
        })
        .from(vaultMembers)
        .leftJoin(users, eq(vaultMembers.userId, users.id))
        .where(
            and(
                eq(vaultMembers.vaultId, vaultId),
                eq(vaultMembers.status, 'active')
            )
        );

    // Combine owner and members
    const membersMap = new Map();

    // Add owner first
    if (vaultData[0]) {
        membersMap.set(vaultData[0].ownerId, {
            userId: vaultData[0].ownerId,
            firstName: vaultData[0].ownerFirstName || undefined,
            lastName: vaultData[0].ownerLastName || undefined,
            email: vaultData[0].ownerEmail || '',
            role: 'owner' as const,
            status: 'active' as const
        });
    }

    // Add other members
    vaultMembers_list.forEach(m => {
        if (!membersMap.has(m.userId)) {
            membersMap.set(m.userId, {
                userId: m.userId,
                firstName: m.firstName || undefined,
                lastName: m.lastName || undefined,
                email: m.email || '',
                role: m.role,
                status: m.status
            });
        }
    });

    return Array.from(membersMap.values());
};

// Get a specific vault with member details
export const getVault = async (userId: string, vaultId: string, db: D1Database) => {
    console.log(`[getVault] Called with userId: ${userId}, vaultId: ${vaultId}`);
    const client = drizzle(db, { schema });

    // First check if user has access to this vault
    const hasAccess = await client
        .select()
        .from(vaultMembers)
        .where(
            and(
                eq(vaultMembers.vaultId, vaultId),
                eq(vaultMembers.userId, userId),
                eq(vaultMembers.status, 'active')
            )
        )
        .limit(1);

    console.log(`[getVault] Access check result:`, hasAccess);
    if (hasAccess.length === 0) {
        throw new Error('Vault not found or access denied');
    }

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

    // Get vault owner details
    const owner = await client
        .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email
        })
        .from(users)
        .where(eq(users.id, vault[0].ownerId))
        .limit(1);

    if (owner.length === 0) {
        throw new Error('Vault owner not found');
    }

    // Create owner member object
    const ownerMember = {
        id: `owner_${vault[0].id}`, // Unique ID for owner
        role: 'owner',
        permissions: 'admin',
        status: 'active',
        invitedAt: vault[0].createdAt,
        joinedAt: vault[0].createdAt,
        user: owner[0]
    };

    // Check if owner is already in members list (for non-personal vaults)
    const ownerInMembers = members.find(member => member.user?.id === vault[0].ownerId);

    // Build final members list
    let allMembers = [];
    if (!ownerInMembers) {
        // Owner not in members list (personal vault), add them first
        allMembers = [ownerMember, ...members];
    } else {
        // Owner in members list (non-personal vault), update their role
        allMembers = members.map(member =>
            member.user?.id === vault[0].ownerId
                ? { ...member, role: 'owner', permissions: 'admin' }
                : member
        );
    }

    return {
        vault: vault[0],
        members: allMembers
    };
};

// Create a new vault by email
export const createVaultByEmail = async (userEmail: string, data: Vault, db: D1Database, kv?: KVNamespace) => {
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

    // Then create the vault using the existing function
    return createVault(user[0].id, data, db, kv);
};

// Update vault by email
export const updateVaultByEmail = async (userEmail: string, vaultId: string, data: any, db: D1Database, kv?: KVNamespace) => {
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

    // Then update the vault using the existing function
    return updateVault(user[0].id, vaultId, data, db, kv);
};

// Delete vault by email
export const deleteVaultByEmail = async (userEmail: string, vaultId: string, db: D1Database, kv?: KVNamespace) => {
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

    // Then delete the vault using the existing function
    return deleteVault(user[0].id, vaultId, db, kv);
};

// Get vault stats by email
export const getVaultStatsByEmail = async (userEmail: string, vaultId: string, db: D1Database) => {
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

    // Then get stats using the existing function
    return getVaultStats(user[0].id, vaultId, db);
};

// Create a new vault
export const createVault = async (userId: string, data: CreateVault, db: D1Database, kv?: KVNamespace) => {
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

        // Invalidate user's vault cache
        await invalidateUserVaultsCache(userId, kv);

        console.log(`[createVault.handler] Successfully created vault`);
        return vault[0];
    } catch (error) {
        console.log(`[createVault.handler] Error creating vault: ${error}`);
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
            updatedAt: new Date()
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