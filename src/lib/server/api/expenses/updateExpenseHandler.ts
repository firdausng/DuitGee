import {drizzle} from "drizzle-orm/d1";
import * as schema from "$lib/server/db/schema";
import type {UpdateExpenseRequest} from "$lib/schemas/expenses";
import {expenses} from "$lib/server/db/schema";
import {and, eq, isNull} from "drizzle-orm";
import {updateAuditFields} from "$lib/server/utils/audit";
import {requireVaultPermission} from "$lib/server/utils/vaultPermissions";

export const updateExpense = async (
    session: App.AuthSession,
    data: UpdateExpenseRequest,
    env: Cloudflare.Env
) => {
    const client = drizzle(env.DB, { schema });

    const { id, vaultId, ...updateData } = data;

    // Enforce permission check
    await requireVaultPermission(session, vaultId, 'canEditExpenses', env);

    // Check if expense exists and is not deleted
    const existingExpense = await client
        .select()
        .from(expenses)
        .where(
            and(
                eq(expenses.id, id),
                eq(expenses.vaultId, vaultId),
                isNull(expenses.deletedAt)
            )
        )
        .limit(1);

    if (!existingExpense || existingExpense.length === 0) {
        throw new Error('Expense not found');
    }

    const [updatedExpense] = await client
        .update(expenses)
        .set({
            ...updateData,
            ...updateAuditFields({ userId: session.user.id })
        })
        .where(eq(expenses.id, id))
        .returning();

    return updatedExpense;
};
