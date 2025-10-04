import { Hono } from 'hono';
import * as v from "valibot";
import {
	getCategoryGroups,
	getCategoryGroup,
	getCategoryGroupsWithCategories
} from "$lib/server/api/category-groups/handlers";
import { describeRoute, resolver } from 'hono-openapi';
import {categoryGroupSchema, categoryGroupWithCategoriesSchema} from "$lib/schemas/expense";

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
						'application/json': { schema: resolver(v.array(categoryGroupSchema)) },
					},
				},
			},
		}),
		async (c) => {
		const groupsList = await getCategoryGroups();
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
						'application/json': { schema: resolver(v.array(categoryGroupWithCategoriesSchema)) },
					},
				},
			},
		}),
		async (c) => {
		const groupsWithCategories = await getCategoryGroupsWithCategories();

		return c.json(groupsWithCategories);
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
		const id = c.req.param('id');

		const group = await getCategoryGroup(id);

		if (!group) {
			return c.json({ error: 'Category group not found' }, 404);
		}

		return c.json(group);
	})
;