import { Hono } from 'hono';
import * as v from "valibot";
import { vValidator } from "@hono/valibot-validator";
import {
	getTags,
	getTag,
	searchTags,
	deleteUnusedTags
} from "$lib/server/api/tags/handlers";
import { describeRoute, resolver } from 'hono-openapi';
import { tagSchema } from "$lib/server/api/tags/schema";

const TAG_TAG = ['Tag'];
const commonTagConfig = {
	tags: TAG_TAG,
};

export const tagsApi = new Hono<App.Api>()
	// Get all tags (ordered by popularity)
	.get(
		'/tags',
		describeRoute({
			...commonTagConfig,
			description: 'Get all tags ordered by usage count (most popular first)',
			responses: {
				200: {
					description: 'Successful response',
					content: {
						'application/json': { schema: resolver(v.array(tagSchema)) },
					},
				},
			},
		}),
		async (c) => {
		const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : undefined;
		const tagsList = await getTags(c.env.DB, { limit });

		return c.json(tagsList);
	})
	// Search/autocomplete tags
	.get(
		'/tags/search',
		describeRoute({
			...commonTagConfig,
			description: 'Search tags by name prefix (for autocomplete)',
			responses: {
				200: {
					description: 'Successful response',
					content: {
						'application/json': { schema: resolver(v.array(tagSchema)) },
					},
				},
			},
		}),
		async (c) => {
		const query = c.req.query('q');
		const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : 20;

		const tagsList = await searchTags(c.env.DB, query, limit);

		return c.json(tagsList);
	})
	// Get specific tag by name
	.get(
		'/tags/:name',
		describeRoute({
			...commonTagConfig,
			description: 'Get tag by name (case-insensitive)',
			responses: {
				200: {
					description: 'Successful response',
					content: {
						'application/json': { schema: resolver(tagSchema) },
					},
				},
				404: {
					description: 'Tag not found',
				},
			},
		}),
		async (c) => {
		const name = c.req.param('name');

		const tag = await getTag(name, c.env.DB);

		if (!tag) {
			return c.json({ error: 'Tag not found' }, 404);
		}

		return c.json(tag);
	})
	// Cleanup unused tags (admin/maintenance endpoint)
	.delete(
		'/tags/cleanup',
		describeRoute({
			...commonTagConfig,
			description: 'Delete all unused tags (usageCount = 0)',
			responses: {
				200: {
					description: 'Successful response',
					content: {
						'application/json': { schema: resolver(v.object({
							message: v.string(),
							deletedCount: v.number()
						})) },
					},
				},
			},
		}),
		async (c) => {
		const deletedCount = await deleteUnusedTags(c.env.DB);

		return c.json({
			message: `Successfully deleted ${deletedCount} unused tags`,
			deletedCount
		});
	});
