import { drizzle } from "drizzle-orm/d1";
import * as schema from "$lib/server/db/schema";
import {vaults} from "$lib/server/db/schema";
import {and, eq} from "drizzle-orm";

export const getVault = async (
    session: App.AuthSession,
    vaultId: string,
    env: Cloudflare.Env
) => {
    const client = drizzle(env.DB, { schema });

    // Get vault details
    const vault = await client
        .select()
        .from(vaults)
        .where(and(
            eq(vaults.id, vaultId),
            eq(vaults.organizationId, session.session.activeOrganizationId)
        ))
        .limit(1);


    return {
        vault: vault[0],
    };
};
