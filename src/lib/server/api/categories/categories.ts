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
import { describeRoute, resolver } from 'hono-openapi'
import {addCategorySchema, categorySchema} from "$lib/server/api/categories/schema";

const CATEGORY_TAG = ['Category'];
const commonCategoryConfig = {
    tags: CATEGORY_TAG,
};

export const categoriesApi = new Hono<App.Api>()
	.get(
        '/vaults/:vaultId/categories',
        describeRoute({
            ...commonCategoryConfig,
            description: 'Get Category list',
            responses: {
                200: {
                    description: 'Successful response',
                    content: {
                        'application/json': { schema: resolver( v.array(categorySchema)) },
                    },
                },
            },
        }),
        async (c) => {
		const vaultId = c.req.param('vaultId');
        const categoriesList = await getCategories(vaultId, c.env.DB)

		return c.json(categoriesList);
	})
	.get(
        '/vaults/:vaultId/categories/search',
        describeRoute({
            ...commonCategoryConfig,
            description: 'Search Category',
            responses: {
                200: {
                    description: 'Successful response',
                    content: {
                        'application/json': { schema: resolver( v.array(categorySchema)) },
                    },
                },
            },
        }),
        async (c) => {
		const userId = c.get('userEmail') as string;
		const vaultId = c.req.param('vaultId');
		const searchTerm = c.req.query('q');

		if (!searchTerm || searchTerm.trim().length === 0) {
			return c.json({ error: 'Search term is required' }, 400);
		}

		const categoriesList = await searchCategories(userId, vaultId, searchTerm.trim(), c.env.DB);
		return c.json(categoriesList);
	})
	.post(
        '/vaults/:vaultId/categories',
        describeRoute({
            ...commonCategoryConfig,
            description: 'Create Category',
            responses: {
                201: {
                    description: 'Successful response',
                    content: {
                        'application/json': { schema: resolver(categorySchema) },
                    },
                },
            },
        }),
        vValidator('json', categorySchema),
        async (c) => {
		const userId = c.get('userEmail') as string;
		const vaultId = c.req.param('vaultId');
		const data = c.req.valid('json');

        const category = await createCategory(userId, data, vaultId, c.env.DB);

		return c.json(category, 201);
	})
	.get(
        '/vaults/:vaultId/categories/:id',
        describeRoute({
            ...commonCategoryConfig,
            description: 'Get Category by id',
            responses: {
                200: {
                    description: 'Successful response',
                    content: {
                        'application/json': { schema: resolver( categorySchema) },
                    },
                },
            },
        }),
        async (c) => {
		const userId = c.get('userEmail') as string;
		const vaultId = c.req.param('vaultId');
		const id = c.req.param('id');

        const category = await getCategory(userId, id, vaultId, c.env.DB)

		if (!category) {
			return c.json({ error: 'Category not found' }, 404);
		}

		return c.json(category);
	})
	.put(
        '/vaults/:vaultId/categories/:id',
        describeRoute({
            ...commonCategoryConfig,
            description: 'Update Category',
            responses: {
                200: {
                    description: 'Successful response',
                    content: {
                        'application/json': { schema: resolver(categorySchema) },
                    },
                },
                404: {
                    description: 'Not Found response',
                },
            },
        }),
        vValidator('json', addCategorySchema),
        async (c) => {
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
	.delete(
        '/vaults/:vaultId/categories/:id',
        describeRoute({
            ...commonCategoryConfig,
            description: 'Update Category',
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
		const userId = c.get('userEmail') as string;
		const vaultId = c.req.param('vaultId');
		const id = c.req.param('id');

        const isDeleted = await deleteCategory(userId, id, vaultId, c.env.DB)

		if (!isDeleted) {
			return c.json({ error: 'Category not found' }, 404);
		}

		return c.json({ message: 'Category deleted successfully' });
	});