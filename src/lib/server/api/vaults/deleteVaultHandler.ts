import {drizzle} from "drizzle-orm/d1";
import * as schema from "$lib/server/db/schema";
import type {DeleteVaultRequest} from "$lib/schemas/vaults";
import {vaults} from "$lib/server/db/schema";
import {eq} from "drizzle-orm";
import {deleteAuditFields} from "$lib/server/utils/audit";
import {requireVaultPermission} from "$lib/server/utils/vaultPermissions";

export const deleteVault = async (
    session: App.AuthSession,
    data: DeleteVaultRequest,
    env: Cloudflare.Env
) => {
    const client = drizzle(env.DB, { schema });

    const { id } = data;

    await requireVaultPermission(session, id, 'canDeleteVault', env);

    // Check if vault exists
    const existingVault = await client
        .select()
        .from(vaults)
        .where(eq(vaults.id, id))
        .limit(1);

    if (!existingVault || existingVault.length === 0) {
        throw new Error('Vault not found');
    }

    // Soft delete - mark as deleted with audit fields
    const [deletedVault] = await client
        .update(vaults)
        .set({
            ...deleteAuditFields({ userId: session.user.id })
        })
        .where(eq(vaults.id, id))
        .returning();

    return deletedVault;
};
