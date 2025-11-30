import { drizzle } from "drizzle-orm/d1";
import * as schema from "$lib/server/db/schema";
import { vaultMembers } from "$lib/server/db/schema";
import { and, eq } from "drizzle-orm";

export const setDefaultVault = async (
    vaultId: string,
    session: App.AuthSession,
    env: Cloudflare.Env
) => {
    const client = drizzle(env.DB, { schema });
    const userId = session.user.id;

    // Verify user is an active member of this vault
    const [membership] = await client
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

    if (!membership) {
        throw new Error('You are not a member of this vault');
    }

    // Toggle behavior: if already default, unset it; otherwise set it as default
    const newDefaultState = !membership.isDefault;

    // If setting as default, unset any current default vault for this user
    if (newDefaultState) {
        await client
            .update(vaultMembers)
            .set({ isDefault: false })
            .where(
                and(
                    eq(vaultMembers.userId, userId),
                    eq(vaultMembers.isDefault, true)
                )
            );
    }

    // Toggle the default state for this vault
    const [updatedMember] = await client
        .update(vaultMembers)
        .set({ isDefault: newDefaultState })
        .where(eq(vaultMembers.id, membership.id))
        .returning();

    return {
        member: updatedMember,
    };
};
