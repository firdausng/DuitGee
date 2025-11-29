import {drizzle} from "drizzle-orm/d1";
import * as schema from "$lib/server/db/schema";
import type {UpdateVaultRequest} from "$lib/schemas/vaults";
import {vaults} from "$lib/server/db/schema";
import {eq} from "drizzle-orm";
import {updateAuditFields} from "$lib/server/utils/audit";
import {requireVaultPermission} from "$lib/server/utils/vaultPermissions";

export const updateVault = async (
    session: App.AuthSession,
    data: UpdateVaultRequest,
    env: Cloudflare.Env
) => {
    const client = drizzle(env.DB, { schema });

    const { id, ...updateData } = data;
    await requireVaultPermission(session, id, 'canEditVault', env);

    // Check if vault exists and user has permission
    const existingVault = await client
        .select()
        .from(vaults)
        .where(eq(vaults.id, id))
        .limit(1);

    if (!existingVault || existingVault.length === 0) {
        throw new Error('Vault not found');
    }

    const [updatedVault] = await client
        .update(vaults)
        .set({
            ...updateData,
            ...updateAuditFields({ userId: session.user.id })
        })
        .where(eq(vaults.id, id))
        .returning();

    return updatedVault;
};
