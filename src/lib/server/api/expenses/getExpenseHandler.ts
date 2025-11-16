import {drizzle} from "drizzle-orm/d1";
import * as schema from "$lib/server/db/schema";
import {expenses} from "$lib/server/db/schema";
import {and, eq} from "drizzle-orm";
import {paymentData} from "$lib/configurations/payments";
import {categoryData} from "$lib/configurations/categories";

export const getExpense = async (
    vaultId: string,
    expenseId: string,
    env: Cloudflare.Env,
) => {
    const client = drizzle(env.DB, { schema });

    // First get the expense to verify it belongs to the vault
    const expenseResult = await client
        .select()
        .from(expenses)
        // .leftJoin(schema.paymentTypes, eq(expenses.paymentTypeId, schema.paymentTypes.id))
        // .leftJoin(schema.paymentProviders, eq(expenses.paymentProviderId, schema.paymentProviders.id))
        .where(
            and(
                eq(expenses.id, expenseId),
                eq(expenses.vaultId, vaultId)
            )
        )
        .limit(1);

    if (!expenseResult[0]) {
        return undefined;
    }

    // expenseResult

    const row = expenseResult[0];

    // Transform to match our Expense type with additional fields
    return {
        id: row.id,
        note: row.note,
        amount: row.amount,
        date: row.date,
        createdAt: row.createdAt,
        vaultId: row.vaultId || undefined,
        paymentType: paymentData.paymentTypes.find(p => p.code === row.paymentType)?.code || null,
        vault: null, // Not included in this query
        category: categoryData.categories.find(c => c.name === row.categoryName) || null,
    };
};