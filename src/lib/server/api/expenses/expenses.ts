import { Hono } from 'hono';
import * as v from "valibot";
import { vValidator } from "@hono/valibot-validator";
import {
	getExpense,
	createExpenseByEmail,
	deleteExpenseByEmail,
	getExpensesByEmail,
	updateExpenseByEmail,
	getExpensesSummaryByEmail,
	getMemberSpendingByEmail
} from "$lib/server/api/expenses/handlers";
import { describeRoute, resolver } from 'hono-openapi';

const expenseSchema = v.object({
	note: v.optional(v.string()),
	amount: v.pipe(v.number(), v.minValue(0.01, 'Amount must be positive')),
	categoryId: v.pipe(v.string(), v.minLength(1, 'Category is required')),
	date: v.optional(v.pipe(v.string(), v.isoDateTime()))
});

const updateExpenseSchema = v.partial(expenseSchema);

const EXPENSE_TAG = ['Expense'];
const commonExpenseConfig = {
	tags: EXPENSE_TAG,
};

export const expensesApi = new Hono<App.Api>()
	.get(
		'/vaults/:vaultId/expenses',
		describeRoute({
			...commonExpenseConfig,
			description: 'Get expenses list with pagination and filters',
			responses: {
				200: {
					description: 'Successful response',
					content: {
						'application/json': { schema: resolver(v.object({
							data: v.array(v.any()),
							pagination: v.object({
								page: v.number(),
								limit: v.number(),
								total: v.number(),
								totalPages: v.number()
							})
						})) },
					},
				},
			},
		}),
		async (c) => {
		const userEmail = c.get('userEmail') as string;
		const vaultId = c.req.param('vaultId');
		const page = parseInt(c.req.query('page') || '1');
		const limit = parseInt(c.req.query('limit') || '10');
		const categoryId = c.req.query('categoryId');
		const startDate = c.req.query('startDate');
		const endDate = c.req.query('endDate');
		const memberIdsParam = c.req.query('memberIds');
		const memberIds = memberIdsParam ? memberIdsParam.split(',') : undefined;

		const result = await getExpensesByEmail(userEmail, c.env.DB, {
			page,
			limit,
			categoryId,
			startDate,
			endDate,
			vaultId,
			memberIds
		});

		return c.json(result);
	})
	.post(
		'/vaults/:vaultId/expenses',
		describeRoute({
			...commonExpenseConfig,
			description: 'Create expense',
			responses: {
				201: {
					description: 'Successful response',
					content: {
						'application/json': { schema: resolver(v.any()) },
					},
				},
			},
		}),
		vValidator('json', expenseSchema),
		async (c) => {
		const userEmail = c.get('userEmail') as string;
		const vaultId = c.req.param('vaultId');
		const data = c.req.valid('json');

		const expense = await createExpenseByEmail(userEmail, { ...data, vaultId }, c.env.DB, c.env.KV);

		return c.json(expense, 201);
	})
	.get(
		'/vaults/:vaultId/expenses/:id',
		describeRoute({
			...commonExpenseConfig,
			description: 'Get expense by id',
			responses: {
				200: {
					description: 'Successful response',
					content: {
						'application/json': { schema: resolver(v.any()) },
					},
				},
				404: {
					description: 'Not Found response',
				},
			},
		}),
		async (c) => {
		const userId = c.get('userEmail') as string;
		const vaultId = c.req.param('vaultId');
		const id = c.req.param('id');

		const expense = await getExpense(vaultId, id, c.env.DB);

		if (!expense) {
			return c.json({ error: 'Expense not found' }, 404);
		}

		return c.json(expense);
	})
	.put(
		'/vaults/:vaultId/expenses/:id',
		describeRoute({
			...commonExpenseConfig,
			description: 'Update expense',
			responses: {
				200: {
					description: 'Successful response',
					content: {
						'application/json': { schema: resolver(v.any()) },
					},
				},
				404: {
					description: 'Not Found response',
				},
			},
		}),
		vValidator('json', updateExpenseSchema),
		async (c) => {
		const userEmail = c.get('userEmail') as string;
		const vaultId = c.req.param('vaultId');
		const id = c.req.param('id');
		const data = c.req.valid('json');

		const expense = await updateExpenseByEmail(userEmail, vaultId, id, data, c.env.DB, c.env.KV);

		if (!expense) {
			return c.json({ error: 'Expense not found' }, 404);
		}

		return c.json(expense);
	})
	.delete(
		'/vaults/:vaultId/expenses/:id',
		describeRoute({
			...commonExpenseConfig,
			description: 'Delete expense',
			responses: {
				200: {
					description: 'Successful response',
					content: {
						'application/json': { schema: resolver(v.object({ message: v.string() })) },
					},
				},
				404: {
					description: 'Not Found response',
				},
			},
		}),
		async (c) => {
		const userEmail = c.get('userEmail') as string;
		const vaultId = c.req.param('vaultId');
		const id = c.req.param('id');

		const isDeleted = await deleteExpenseByEmail(userEmail, vaultId, id, c.env.DB, c.env.KV);

		if (!isDeleted) {
			return c.json({ error: 'Expense not found' }, 404);
		}

		return c.json({ message: 'Expense deleted successfully' });
	})
	.get(
		'/vaults/:vaultId/expenses/stats/summary',
		describeRoute({
			...commonExpenseConfig,
			description: 'Get expenses summary statistics',
			responses: {
				200: {
					description: 'Successful response',
					content: {
						'application/json': { schema: resolver(v.any()) },
					},
				},
			},
		}),
		async (c) => {
		const userEmail = c.get('userEmail') as string;
		const vaultId = c.req.param('vaultId');
		const startDate = c.req.query('startDate');
		const endDate = c.req.query('endDate');
		const memberIdsParam = c.req.query('memberIds');
		const memberIds = memberIdsParam ? memberIdsParam.split(',') : undefined;

		const result = await getExpensesSummaryByEmail(userEmail, c.env.DB, {
			startDate,
			endDate,
			vaultId,
			memberIds
		});

		return c.json(result);
	})
	.get(
		'/vaults/:vaultId/expenses/stats/members',
		describeRoute({
			...commonExpenseConfig,
			description: 'Get member spending statistics',
			responses: {
				200: {
					description: 'Successful response',
					content: {
						'application/json': { schema: resolver(v.array(v.any())) },
					},
				},
			},
		}),
		async (c) => {
		const userEmail = c.get('userEmail') as string;
		const vaultId = c.req.param('vaultId');
		const startDate = c.req.query('startDate');
		const endDate = c.req.query('endDate');
		const memberIdsParam = c.req.query('memberIds');
		const memberIds = memberIdsParam ? memberIdsParam.split(',') : undefined;

		const result = await getMemberSpendingByEmail(userEmail, c.env.DB, {
			startDate,
			endDate,
			vaultId,
			memberIds
		});

		return c.json(result);
	});