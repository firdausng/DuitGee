import type { UserVault } from "$lib/types/vaults";
import type { User } from "$lib/server/api/users/schema";

/**
 * KV Cache utilities for storing and retrieving cached data
 *
 * Cache Keys:
 * - user_vaults:{userId} - User's vault list with members
 * - expense:{expenseId} - Individual expense data
 * - user_by_email:{email} - User data by email
 */

const DEFAULT_TTL = 300; // 5 minutes

/**
 * Get user vaults from KV cache
 */
export async function getUserVaultsFromCache(userId: string, kv?: KVNamespace): Promise<UserVault[] | null> {
    if (!kv) return null;

    try {
        const cached = await kv.get(`user_vaults:${userId}`, 'json');
        if (cached) {
            console.log(`[KV Cache] HIT for user_vaults:${userId}`);
            return cached as UserVault[];
        }
        console.log(`[KV Cache] MISS for user_vaults:${userId}`);
        return null;
    } catch (error) {
        console.warn(`[KV Cache] Error reading user_vaults:${userId}`, error);
        return null;
    }
}

/**
 * Store user vaults in KV cache
 */
export async function setUserVaultsCache(userId: string, vaults: UserVault[], kv?: KVNamespace, ttl: number = DEFAULT_TTL): Promise<void> {
    if (!kv) return;

    try {
        await kv.put(`user_vaults:${userId}`, JSON.stringify(vaults), {
            expirationTtl: ttl
        });
        console.log(`[KV Cache] SET user_vaults:${userId} (TTL: ${ttl}s)`);
    } catch (error) {
        console.warn(`[KV Cache] Error writing user_vaults:${userId}`, error);
    }
}

/**
 * Invalidate user vaults cache
 */
export async function invalidateUserVaultsCache(userId: string, kv?: KVNamespace): Promise<void> {
    if (!kv) return;

    try {
        await kv.delete(`user_vaults:${userId}`);
        console.log(`[KV Cache] INVALIDATED user_vaults:${userId}`);
    } catch (error) {
        console.warn(`[KV Cache] Error invalidating user_vaults:${userId}`, error);
    }
}

/**
 * Invalidate all vault members' caches when vault data changes
 */
export async function invalidateVaultMembersCache(memberIds: string[], kv?: KVNamespace): Promise<void> {
    if (!kv) return;

    try {
        await Promise.all(
            memberIds.map(memberId => invalidateUserVaultsCache(memberId, kv))
        );
        console.log(`[KV Cache] INVALIDATED vaults for ${memberIds.length} members`);
    } catch (error) {
        console.warn(`[KV Cache] Error invalidating vault members cache`, error);
    }
}

/**
 * Store expense in KV cache (write-first for create operations)
 */
export async function setExpenseCache(expenseId: string, expense: any, kv?: KVNamespace, ttl: number = DEFAULT_TTL): Promise<void> {
    if (!kv) return;

    try {
        await kv.put(`expense:${expenseId}`, JSON.stringify(expense), {
            expirationTtl: ttl
        });
        console.log(`[KV Cache] SET expense:${expenseId} (TTL: ${ttl}s)`);
    } catch (error) {
        console.warn(`[KV Cache] Error writing expense:${expenseId}`, error);
    }
}

/**
 * Get expense from KV cache
 */
export async function getExpenseFromCache(expenseId: string, kv?: KVNamespace): Promise<any | null> {
    if (!kv) return null;

    try {
        const cached = await kv.get(`expense:${expenseId}`, 'json');
        if (cached) {
            console.log(`[KV Cache] HIT for expense:${expenseId}`);
            return cached;
        }
        console.log(`[KV Cache] MISS for expense:${expenseId}`);
        return null;
    } catch (error) {
        console.warn(`[KV Cache] Error reading expense:${expenseId}`, error);
        return null;
    }
}

/**
 * Invalidate expense cache
 */
export async function invalidateExpenseCache(expenseId: string, kv?: KVNamespace): Promise<void> {
    if (!kv) return;

    try {
        await kv.delete(`expense:${expenseId}`);
        console.log(`[KV Cache] INVALIDATED expense:${expenseId}`);
    } catch (error) {
        console.warn(`[KV Cache] Error invalidating expense:${expenseId}`, error);
    }
}

/**
 * Get user by email from KV cache
 */
export async function getUserByEmailFromCache(email: string, kv?: KVNamespace): Promise<User | null> {
    if (!kv) return null;

    try {
        const cached = await kv.get(`user_by_email:${email}`, 'json');
        if (cached) {
            console.log(`[KV Cache] HIT for user_by_email:${email}`);
            return cached as User;
        }
        console.log(`[KV Cache] MISS for user_by_email:${email}`);
        return null;
    } catch (error) {
        console.warn(`[KV Cache] Error reading user_by_email:${email}`, error);
        return null;
    }
}

/**
 * Store user by email in KV cache
 */
export async function setUserByEmailCache(email: string, user: User, kv?: KVNamespace, ttl: number = DEFAULT_TTL): Promise<void> {
    if (!kv) return;

    try {
        await kv.put(`user_by_email:${email}`, JSON.stringify(user), {
            expirationTtl: ttl
        });
        console.log(`[KV Cache] SET user_by_email:${email} (TTL: ${ttl}s)`);
    } catch (error) {
        console.warn(`[KV Cache] Error writing user_by_email:${email}`, error);
    }
}

/**
 * Invalidate user by email cache
 */
export async function invalidateUserByEmailCache(email: string, kv?: KVNamespace): Promise<void> {
    if (!kv) return;

    try {
        await kv.delete(`user_by_email:${email}`);
        console.log(`[KV Cache] INVALIDATED user_by_email:${email}`);
    } catch (error) {
        console.warn(`[KV Cache] Error invalidating user_by_email:${email}`, error);
    }
}
