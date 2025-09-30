import { Hono } from 'hono';
import * as v from "valibot";
import {vValidator} from "@hono/valibot-validator";
import {
    createCategory,
    deleteCategory,
    getCategories,
    getCategory,
    searchCategories,
    updateCategory
} from "$lib/server/api/categories/handlers";


const categorySchema = v.object({
    name: v.pipe(v.string(), v.minLength(1, 'Name must be 1 or more characters long.')),
    color: v.pipe(v.string(), v.minLength(1, 'Name must be 1 or more characters long.'), v.regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')),
});

const updateCategorySchema = v.partial(categorySchema);

export const categoriesApi = new Hono<App.Api>()
	.get('/vaults/:vaultId/categories', async (c) => {
		const userId = c.get('userEmail') as string;
		const vaultId = c.req.param('vaultId');
        console.log('userId', userId)
        const categoriesList = await getCategories(vaultId, c.env.DB)

		return c.json(categoriesList);
	})
	.get('/vaults/:vaultId/categories/search', async (c) => {
		const userId = c.get('userEmail') as string;
		const vaultId = c.req.param('vaultId');
		const searchTerm = c.req.query('q');

		if (!searchTerm || searchTerm.trim().length === 0) {
			return c.json({ error: 'Search term is required' }, 400);
		}

		const categoriesList = await searchCategories(userId, vaultId, searchTerm.trim(), c.env.DB);
		return c.json(categoriesList);
	})
	.post('/vaults/:vaultId/categories', vValidator('json', categorySchema), async (c) => {
		const userId = c.get('userEmail') as string;
		const vaultId = c.req.param('vaultId');
		const data = c.req.valid('json');

        const category = await createCategory(userId, data, vaultId, c.env.DB);

		return c.json(category, 201);
	})
	.get('/vaults/:vaultId/categories/:id', async (c) => {
		const userId = c.get('userEmail') as string;
		const vaultId = c.req.param('vaultId');
		const id = c.req.param('id');

        const category = await getCategory(userId, id, vaultId, c.env.DB)

		if (!category) {
			return c.json({ error: 'Category not found' }, 404);
		}

		return c.json(category);
	})
	.put('/vaults/:vaultId/categories/:id', vValidator('json', updateCategorySchema), async (c) => {
		const userId = c.get('userEmail') as string;
		const vaultId = c.req.param('vaultId');
		const id = c.req.param('id');
		const data = c.req.valid('json');

        const category = await updateCategory(userId, id, vaultId, data, c.env.DB)

		if (!category) {
			return c.json({ error: 'Category not found' }, 404);
		}

		return c.json(category);
	})
	.delete('/vaults/:vaultId/categories/:id', async (c) => {
		const userId = c.get('userEmail') as string;
		const vaultId = c.req.param('vaultId');
		const id = c.req.param('id');

        const isDeleted = await deleteCategory(userId, id, vaultId, c.env.DB)

		if (!isDeleted) {
			return c.json({ error: 'Category not found' }, 404);
		}

		return c.json({ message: 'Category deleted successfully' });
	});