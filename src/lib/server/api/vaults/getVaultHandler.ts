import { drizzle } from "drizzle-orm/d1";
import * as schema from "$lib/server/db/schema";
import {vaults, vaultMembers} from "$lib/server/db/schema";
import {and, eq, isNull } from "drizzle-orm";

export const getVault = async (
    authSession: App.AuthSession,
    vaultId: string,
    env: Cloudflare.Env
) => {
    const client = drizzle(env.DB, { schema });

    const [vault] = await client
        .select()
        .from(vaults)
        .innerJoin(vaultMembers, eq(vaults.id, vaultMembers.vaultId))
        .where(and(
            eq(vaultMembers.userId, authSession.user.id),
            eq(vaults.id, vaultId),
            eq(vaultMembers.status, 'active'),
            isNull(vaults.deletedAt)
        ))
        .limit(1);

    return vault;
};
