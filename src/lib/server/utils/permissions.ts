import { drizzle } from "drizzle-orm/d1";
import * as schema from "$lib/server/db/schema";
import { vaults, vaultMembers } from "$lib/server/db/schema";
import { and, eq, or } from "drizzle-orm";

export type VaultRole = 'owner' | 'admin' | 'member';

export interface VaultPermissions {
    canCreateExpenses: boolean;
    canEditExpenses: boolean;
    canDeleteExpenses: boolean;
    canCreateTemplateExpenses: boolean;
    canEditTemplateExpenses: boolean;
    canDeleteTemplateExpenses: boolean;
    canCreateCategories: boolean;
    canEditCategories: boolean;
    canDeleteCategories: boolean;
    canCreateCategoryGroups: boolean;
    canEditCategoryGroups: boolean;
    canDeleteCategoryGroups: boolean;
    canManageMembers: boolean;
    canViewVault: boolean;
    canEditVault: boolean;
    canDeleteVault: boolean;
    canInviteMemberToVault: boolean;
    canRemoveMemberFromVault: boolean;
    canUpdateMemberInVault: boolean;
}

// Get user's role and permissions for a specific vault
export const getUserVaultRole = async (userId: string, vaultId: string, db: D1Database): Promise<VaultRole | null> => {
    const client = drizzle(db, { schema });

    // Check vault membership
    const membership = await client
        .select({ role: vaultMembers.role, permissions: vaultMembers.permissions })
        .from(vaultMembers)
        .where(
            and(
                eq(vaultMembers.vaultId, vaultId),
                eq(vaultMembers.userId, userId),
                eq(vaultMembers.status, 'active')
            )
        )
        .limit(1);

    if (membership.length > 0) {
        return membership[0].role as VaultRole;
    }

    return null; // No access
};

// Get detailed permissions based on role
export const getVaultPermissions = (role: VaultRole | null): VaultPermissions => {
    if (!role) {
        // No access
        return {
            canCreateExpenses: false,
            canEditExpenses: false,
            canDeleteExpenses: false,
            canCreateTemplateExpenses: false,
            canEditTemplateExpenses: false,
            canDeleteTemplateExpenses: false,
            canCreateCategories: false,
            canEditCategories: false,
            canDeleteCategories: false,
            canCreateCategoryGroups: false,
            canEditCategoryGroups: false,
            canDeleteCategoryGroups: false,
            canManageMembers: false,
            canViewVault: false,
            canEditVault: false,
            canDeleteVault: false,
            canInviteMemberToVault: false,
            canRemoveMemberFromVault: false,
            canUpdateMemberInVault: false,
        };
    }

    switch (role) {
        case 'owner':
            // Owner can do everything
            return {
                canCreateExpenses: true,
                canEditExpenses: true,
                canDeleteExpenses: true,
                canCreateTemplateExpenses: true,
                canEditTemplateExpenses: true,
                canDeleteTemplateExpenses: true,
                canCreateCategories: true,
                canEditCategories: true,
                canDeleteCategories: true,
                canCreateCategoryGroups: true,
                canEditCategoryGroups: true,
                canDeleteCategoryGroups: true,
                canManageMembers: true,
                canViewVault: true,
                canEditVault: true,
                canDeleteVault: true,
                canInviteMemberToVault: true,
                canRemoveMemberFromVault: true,
                canUpdateMemberInVault: true,
            };

        case 'admin':
            // Admin can do everything except delete vault
            return {
                canCreateExpenses: true,
                canEditExpenses: true,
                canDeleteExpenses: true,
                canCreateTemplateExpenses: true,
                canEditTemplateExpenses: true,
                canDeleteTemplateExpenses: true,
                canCreateCategories: true,
                canEditCategories: true,
                canDeleteCategories: true,
                canCreateCategoryGroups: true,
                canEditCategoryGroups: true,
                canDeleteCategoryGroups: true,
                canManageMembers: true,
                canViewVault: true,
                canEditVault: true,
                canDeleteVault: false,
                canInviteMemberToVault: true,
                canRemoveMemberFromVault: true,
                canUpdateMemberInVault: true,
            };

        case 'member':
            // Member can only create expenses
            return {
                canCreateExpenses: true,
                canEditExpenses: false,
                canDeleteExpenses: false,
                canCreateTemplateExpenses: true,
                canEditTemplateExpenses: true,
                canDeleteTemplateExpenses: true,
                canCreateCategories: false,
                canEditCategories: false,
                canDeleteCategories: false,
                canCreateCategoryGroups: false,
                canEditCategoryGroups: false,
                canDeleteCategoryGroups: false,
                canManageMembers: false,
                canViewVault: true,
                canEditVault: false,
                canDeleteVault: false,
                canInviteMemberToVault: false,
                canRemoveMemberFromVault: false,
                canUpdateMemberInVault: false,
            };

        default:
            return getVaultPermissions(null);
    }
};

// Check if user has specific permission for vault
export const checkVaultPermission = async (
    userId: string,
    vaultId: string,
    permission: keyof VaultPermissions,
    db: D1Database
): Promise<boolean> => {
    const role = await getUserVaultRole(userId, vaultId, db);
    const permissions = getVaultPermissions(role);
    return permissions[permission];
};

// Middleware function to enforce permissions
export const requireVaultPermission = async (
    userId: string,
    vaultId: string,
    permission: keyof VaultPermissions,
    db: D1Database
): Promise<void> => {
    console.log('[requireVaultPermission]', userId, vaultId, permission)
    const hasPermission = await checkVaultPermission(userId, vaultId, permission, db);

    if (!hasPermission) {
        const role = await getUserVaultRole(userId, vaultId, db);
        throw new Error(`Permission denied: ${role || 'No access'} role cannot ${permission}`);
    }
};