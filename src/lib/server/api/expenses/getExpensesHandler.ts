import {drizzle} from "drizzle-orm/d1";
import * as schema from "$lib/server/db/schema";
import {expenses, vaults} from "$lib/server/db/schema";
import {and, desc, eq, sql} from "drizzle-orm";
import {categoryData} from "$lib/configurations/categories";
import {createSelectSchema} from "drizzle-valibot";
import {parse} from "valibot";

export const getExpenses = async (
    userId: string,
    vaultId: string,
    env: Cloudflare.Env,
    options?: App.GetVaultExpensesOptions
) => {
    const client = drizzle(env.DB, { schema });
    const { page = 1, limit = 10, categoryId, startDate, endDate, memberIds } = options || {};
    const offset = (page - 1) * limit;

    const vault = await client
        .select()
        .from(vaults)
        // .leftJoin(vaultMembers, eq(vaults.id, vaultMembers.vaultId))
        .where(
            and(
                eq(vaults.id, vaultId),
                // or(
                //     eq(vaults.ownerId, userId),
                //     and(
                //         eq(vaultMembers.userId, userId),
                //         eq(vaultMembers.status, 'active')
                //     )
                // )
            )
        )
        .limit(1);

    if(!vault[0].isPublic){

    }

    let whereClause = and(eq(expenses.vaultId, vaultId));

    if (startDate && endDate) {
        whereClause = and(
            whereClause,
            sql`${expenses.date} >= ${startDate}`,
            sql`${expenses.date} <= ${endDate}`
        );
    }

    const expensesList = await client
        .select()
        .from(expenses)
        .where(whereClause)
        .orderBy(desc(expenses.date))
        .limit(limit)
        .offset(offset);

    const totalCount = await client
        .select({ count: sql`count(*)` })
        .from(expenses)
        .where(whereClause);

    const transformedExpenses = expensesList.map(row => {
        const parsedExpense = parse(createSelectSchema(expenses), row);
        return {
            id: parsedExpense.id,
            note: parsedExpense.note,
            amount: parsedExpense.amount,
            date: parsedExpense.date,
            createdAt: parsedExpense.createdAt,
            paidBy: parsedExpense.paidBy || undefined,
            vaultId: parsedExpense.vaultId || undefined,
            category: categoryData.categories.find(c => c.name === parsedExpense.categoryName) || null,
        }
    });

    return {
        expenses: transformedExpenses,
        pagination: {
            page,
            limit,
            total: totalCount[0].count as number,
            pages: Math.ceil((totalCount[0].count as number) / limit)
        }
    };
};