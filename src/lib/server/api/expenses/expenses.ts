import { Hono } from 'hono';
import * as v from "valibot";
import { vValidator } from "@hono/valibot-validator";
import {
	createExpense,
	deleteExpense,
	getExpenses,
	getExpense,
	updateExpense,
	getExpensesSummary
} from "$lib/server/api/expenses/handlers";

const expenseSchema = v.object({
	note: v.optional(v.string()),
	amount: v.pipe(v.number(), v.minValue(0.01, 'Amount must be positive')),
	categoryId: v.pipe(v.string(), v.minLength(1, 'Category is required')),
	date: v.optional(v.pipe(v.string(), v.isoDateTime()))
});

const updateExpenseSchema = v.partial(expenseSchema);

export const expensesApi = new Hono<App.Api>()
	.get('/vaults/:vaultId/expenses', async (c) => {
		const userId = c.get('userId') as string;
		const vaultId = c.req.param('vaultId');
		const page = parseInt(c.req.query('page') || '1');
		const limit = parseInt(c.req.query('limit') || '10');
		const categoryId = c.req.query('categoryId');

		console.log('userId', userId);
		const result = await getExpenses(userId, c.env.DB, {
			page,
			limit,
			categoryId,
			vaultId
		});

		return c.json(result);
	})
	.post('/vaults/:vaultId/expenses', vValidator('json', expenseSchema), async (c) => {
		const userId = c.get('userId') as string;
		const vaultId = c.req.param('vaultId');
		const data = c.req.valid('json');

		const expense = await createExpense(userId, { ...data, vaultId }, c.env.DB);

		return c.json(expense, 201);
	})
	.get('/vaults/:vaultId/expenses/:id', async (c) => {
		const userId = c.get('userId') as string;
		const vaultId = c.req.param('vaultId');
		const id = c.req.param('id');

		const expense = await getExpense(vaultId, id, c.env.DB);

		if (!expense) {
			return c.json({ error: 'Expense not found' }, 404);
		}

		return c.json(expense);
	})
	.put('/vaults/:vaultId/expenses/:id', vValidator('json', updateExpenseSchema), async (c) => {
		const userId = c.get('userId') as string;
		const vaultId = c.req.param('vaultId');
		const id = c.req.param('id');
		const data = c.req.valid('json');

		const expense = await updateExpense(userId, vaultId, id, data, c.env.DB);

		if (!expense) {
			return c.json({ error: 'Expense not found' }, 404);
		}

		return c.json(expense);
	})
	.delete('/vaults/:vaultId/expenses/:id', async (c) => {
		const userId = c.get('userId') as string;
		const vaultId = c.req.param('vaultId');
		const id = c.req.param('id');

		const isDeleted = await deleteExpense(userId, vaultId, id, c.env.DB);

		if (!isDeleted) {
			return c.json({ error: 'Expense not found' }, 404);
		}

		return c.json({ message: 'Expense deleted successfully' });
	})
	.get('/vaults/:vaultId/expenses/stats/summary', async (c) => {
		const userId = c.get('userId') as string;
		const vaultId = c.req.param('vaultId');
		const startDate = c.req.query('startDate');
		const endDate = c.req.query('endDate');

		const result = await getExpensesSummary(userId, c.env.DB, {
			startDate,
			endDate,
			vaultId
		});

		return c.json(result);
	});