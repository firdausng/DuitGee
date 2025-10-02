import { Hono } from 'hono';
import * as v from "valibot";
import { vValidator } from "@hono/valibot-validator";
import {
	createCategoryGroup,
	deleteCategoryGroup,
	getCategoryGroups,
	getCategoryGroup,
	updateCategoryGroup,
	getCategoryGroupsWithCategories
} from "$lib/server/api/category-groups/handlers";
import { describeRoute, resolver } from 'hono-openapi';

const categoryGroupSchema = v.object({
	name: v.pipe(v.string(), v.minLength(1, 'Name must be 1 or more characters long.')),
	description: v.optional(v.string()),
	color: v.pipe(v.string(), v.minLength(1, 'Color must be 1 or more characters long.'), v.regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')),
	icon: v.optional(v.string())
});

const updateCategoryGroupSchema = v.partial(categoryGroupSchema);

const CATEGORY_GROUP_TAG = ['Category Group'];
const commonCategoryGroupConfig = {
	tags: CATEGORY_GROUP_TAG,
};

export const categoryGroupsApi = new Hono<App.Api>()
	.get(
		'/vaults/:vaultId/category-groups',
		describeRoute({
			...commonCategoryGroupConfig,
			description: 'Get category groups list',
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
		const userId = c.get('userEmail') as string;
		const vaultId = c.req.param('vaultId');
		console.log('userId', userId);
		const groupsList = await getCategoryGroups(userId, vaultId, c.env.DB);

		return c.json(groupsList);
	})
	.get(
		'/vaults/:vaultId/category-groups/with-categories',
		describeRoute({
			...commonCategoryGroupConfig,
			description: 'Get category groups with their categories',
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
		const userId = c.get('userEmail') as string;
		const vaultId = c.req.param('vaultId');
		const groupsWithCategories = await getCategoryGroupsWithCategories(userId, vaultId, c.env.DB);

		return c.json(groupsWithCategories);
	})
	.post(
		'/vaults/:vaultId/category-groups',
		describeRoute({
			...commonCategoryGroupConfig,
			description: 'Create category group',
			responses: {
				201: {
					description: 'Successful response',
					content: {
						'application/json': { schema: resolver(categoryGroupSchema) },
					},
				},
			},
		}),
		vValidator('json', categoryGroupSchema),
		async (c) => {
		const userId = c.get('userEmail') as string;
		const vaultId = c.req.param('vaultId');
		const data = c.req.valid('json');

		const group = await createCategoryGroup(userId, vaultId, data, c.env.DB);

		if (!group) {
			return c.json({ error: 'Failed to create category group' }, 500);
		}

		return c.json(group, 201);
	})
	.get(
		'/vaults/:vaultId/category-groups/:id',
		describeRoute({
			...commonCategoryGroupConfig,
			description: 'Get category group by id',
			responses: {
				200: {
					description: 'Successful response',
					content: {
						'application/json': { schema: resolver(categoryGroupSchema) },
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

		const group = await getCategoryGroup(userId, id, vaultId, c.env.DB);

		if (!group) {
			return c.json({ error: 'Category group not found' }, 404);
		}

		return c.json(group);
	})
	.put(
		'/vaults/:vaultId/category-groups/:id',
		describeRoute({
			...commonCategoryGroupConfig,
			description: 'Update category group',
			responses: {
				200: {
					description: 'Successful response',
					content: {
						'application/json': { schema: resolver(categoryGroupSchema) },
					},
				},
				404: {
					description: 'Not Found response',
				},
			},
		}),
		vValidator('json', updateCategoryGroupSchema),
		async (c) => {
		const userId = c.get('userEmail') as string;
		const vaultId = c.req.param('vaultId');
		const id = c.req.param('id');
		const data = c.req.valid('json');

		const group = await updateCategoryGroup(userId, id, vaultId, data, c.env.DB);

		if (!group) {
			return c.json({ error: 'Category group not found' }, 404);
		}

		return c.json(group);
	})
	.delete(
		'/vaults/:vaultId/category-groups/:id',
		describeRoute({
			...commonCategoryGroupConfig,
			description: 'Delete category group',
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

		const isDeleted = await deleteCategoryGroup(userId, id, vaultId, c.env.DB);

		if (!isDeleted) {
			return c.json({ error: 'Category group not found' }, 404);
		}

		return c.json({ message: 'Category group deleted successfully' });
	});