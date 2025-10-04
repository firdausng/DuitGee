import { Hono } from 'hono';
import * as v from "valibot";
import {
    getCategories,
    getCategory,
} from "$lib/server/api/categories/handlers";
import { describeRoute, resolver } from 'hono-openapi'
import {categorySchema} from "$lib/schemas/expense";

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
            return c.json(getCategories());
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
		const id = c.req.param('id');

        const category = await getCategory(id)

		if (!category) {
			return c.json({ error: 'Category not found' }, 404);
		}

		return c.json(category);
	});