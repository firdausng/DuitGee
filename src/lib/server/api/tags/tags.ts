import { Hono } from 'hono';
import * as v from "valibot";
import { vValidator } from "@hono/valibot-validator";
import {
	getTags,
	getTag,
	createTag,
	updateTag,
	deleteTag
} from "$lib/server/api/tags/handlers";
import { describeRoute, resolver } from 'hono-openapi';

const tagSchema = v.object({
	name: v.pipe(v.string(), v.minLength(1, 'Name must be 1 or more characters long.')),
	color: v.optional(v.pipe(v.string(), v.regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'))),
	icon: v.optional(v.string()),
	iconType: v.optional(v.string())
});

const updateTagSchema = v.partial(tagSchema);

const TAG_TAG = ['Tag'];
const commonTagConfig = {
	tags: TAG_TAG,
};

export const tagsApi = new Hono<App.Api>()
	.get(
		'/vaults/:vaultId/tags',
		describeRoute({
			...commonTagConfig,
			description: 'Get tags list',
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
		const vaultId = c.req.param('vaultId');
		const tagsList = await getTags(vaultId, c.env.DB);

		return c.json(tagsList);
	})
	.post(
		'/vaults/:vaultId/tags',
		describeRoute({
			...commonTagConfig,
			description: 'Create tag',
			responses: {
				201: {
					description: 'Successful response',
					content: {
						'application/json': { schema: resolver(v.any()) },
					},
				},
			},
		}),
		vValidator('json', tagSchema),
		async (c) => {
		const userId = c.get('userEmail') as string;
		const vaultId = c.req.param('vaultId');
		const data = c.req.valid('json');

		const tag = await createTag(userId, { ...data, vaultId }, c.env.DB);

		return c.json(tag, 201);
	})
	.get(
		'/vaults/:vaultId/tags/:id',
		describeRoute({
			...commonTagConfig,
			description: 'Get tag by id',
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
		const id = c.req.param('id');

		const tag = await getTag(id, c.env.DB);

		if (!tag) {
			return c.json({ error: 'Tag not found' }, 404);
		}

		return c.json(tag);
	})
	.put(
		'/vaults/:vaultId/tags/:id',
		describeRoute({
			...commonTagConfig,
			description: 'Update tag',
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
		vValidator('json', updateTagSchema),
		async (c) => {
		const userId = c.get('userEmail') as string;
		const id = c.req.param('id');
		const data = c.req.valid('json');

		const tag = await updateTag(userId, id, data, c.env.DB);

		if (!tag) {
			return c.json({ error: 'Tag not found' }, 404);
		}

		return c.json(tag);
	})
	.delete(
		'/vaults/:vaultId/tags/:id',
		describeRoute({
			...commonTagConfig,
			description: 'Delete tag',
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
		const id = c.req.param('id');

		const isDeleted = await deleteTag(userId, id, c.env.DB);

		if (!isDeleted) {
			return c.json({ error: 'Tag not found' }, 404);
		}

		return c.json({ message: 'Tag deleted successfully' });
	});
