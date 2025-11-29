import * as v from 'valibot';

export const expenseSchema = v.object({
    id: v.string(), // cuid-like id
    note: v.optional(v.string()), // nullable in DB
    amount: v.number(), // real, required
    categoryName: v.string(), // notNull
    date: v.string(), // ISO string date
    paidBy: v.optional(v.nullable(v.string())), // optional - vault-level expense
    vaultId: v.string(), // required, FK
    expenseTemplateId: v.optional(v.string()), // nullable in DB

    // Audit fields
    createdAt: v.string(),
    createdBy: v.string(), // required
    updatedAt: v.string(),
    updatedBy: v.optional(v.nullable(v.string())),
    deletedAt: v.optional(v.nullable(v.string())),
    deletedBy: v.optional(v.nullable(v.string())),
});

export type Expense = v.InferOutput<typeof expenseSchema>;

export const createExpenseSchema = v.object({
    ...v.pick(expenseSchema, ['note', 'amount', 'categoryName', 'paidBy', 'vaultId', 'date']).entries,
    templateId: v.string(),
})

export type CreateExpense = v.InferOutput<typeof createExpenseSchema>;

export const updateExpenseSchema = v.object({
    ...v.pick(createExpenseSchema, ['note', 'amount', 'categoryName', 'paidBy', 'date']).entries,
    templateId: v.string(),
})

export type UpdateExpense = v.InferOutput<typeof updateExpenseSchema>;

// RPC-style query schemas (for GET requests with query params)
export const listExpensesQuerySchema = v.object({
    vaultId: v.string(),
    page: v.optional(v.pipe(v.string(), v.transform(Number)), '1'),
    limit: v.optional(v.pipe(v.string(), v.transform(Number)), '10'),
    categoryId: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    memberIds: v.optional(v.string()), // comma-separated string
});
export type ListExpensesQuery = v.InferOutput<typeof listExpensesQuerySchema>;

export const getExpenseQuerySchema = v.object({
    vaultId: v.string(),
    id: v.string(),
});
export type GetExpenseQuery = v.InferOutput<typeof getExpenseQuerySchema>;

// RPC-style command schemas (for POST requests)
export const updateExpenseRequestSchema = v.object({
    id: v.string(),
    vaultId: v.string(),
    ...v.partial(v.pick(createExpenseSchema, ['note', 'amount', 'categoryName', 'paidBy', 'date'])).entries
});
export type UpdateExpenseRequest = v.InferOutput<typeof updateExpenseRequestSchema>;

export const deleteExpenseRequestSchema = v.object({
    id: v.string(),
    vaultId: v.string(),
});
export type DeleteExpenseRequest = v.InferOutput<typeof deleteExpenseRequestSchema>;

export const categoryGroupSchema = v.object({
    name: v.pipe(v.string(), v.minLength(1, 'Name must be 1 or more characters long.')),
    description: v.nullable(v.string()),
    color: v.pipe(v.string(), v.minLength(1, 'Color must be 1 or more characters long.'), v.regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')),
    icon: v.nullable(v.string()),
    iconType: v.nullable(v.string()),
    isPublic: v.boolean(),
});