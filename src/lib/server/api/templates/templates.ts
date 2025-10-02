import { Hono } from 'hono';
import * as v from "valibot";
import { vValidator } from "@hono/valibot-validator";
import {
	getTemplates,
	getTemplate,
	createTemplate,
	updateTemplate,
	deleteTemplate,
	incrementTemplateUsage
} from "$lib/server/api/templates/handlers";
import { describeRoute, resolver } from 'hono-openapi';

const templateSchema = v.object({
	name: v.pipe(v.string(), v.minLength(1, 'Name must be 1 or more characters long.')),
	description: v.optional(v.string()),
	categoryId: v.optional(v.string()),
	defaultAmount: v.optional(v.number()),
	paymentTypeId: v.optional(v.string()),
	paymentProviderId: v.optional(v.string()),
	note: v.optional(v.string()),
	icon: v.optional(v.string()),
	iconType: v.optional(v.string()),
	tagIds: v.optional(v.array(v.string()))
});

const updateTemplateSchema = v.partial(templateSchema);

const TEMPLATE_TAG = ['Template'];
const commonTemplateConfig = {
	tags: TEMPLATE_TAG,
};

export const templatesApi = new Hono<App.Api>()
	.get(
		'/vaults/:vaultId/templates',
		describeRoute({
			...commonTemplateConfig,
			description: 'Get expense templates list',
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
		const templatesList = await getTemplates(userId, vaultId, c.env.DB);

		return c.json(templatesList);
	})
	.post(
		'/vaults/:vaultId/templates',
		describeRoute({
			...commonTemplateConfig,
			description: 'Create expense template',
			responses: {
				201: {
					description: 'Successful response',
					content: {
						'application/json': { schema: resolver(v.any()) },
					},
				},
			},
		}),
		vValidator('json', templateSchema),
		async (c) => {
		const userId = c.get('userEmail') as string;
		const vaultId = c.req.param('vaultId');
		const data = c.req.valid('json');

		const template = await createTemplate(userId, { ...data, vaultId }, c.env.DB);

		return c.json(template, 201);
	})
	.get(
		'/vaults/:vaultId/templates/:id',
		describeRoute({
			...commonTemplateConfig,
			description: 'Get expense template by id',
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
		const id = c.req.param('id');

		const template = await getTemplate(userId, id, c.env.DB);

		if (!template) {
			return c.json({ error: 'Template not found' }, 404);
		}

		return c.json(template);
	})
	.put(
		'/vaults/:vaultId/templates/:id',
		describeRoute({
			...commonTemplateConfig,
			description: 'Update expense template',
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
		vValidator('json', updateTemplateSchema),
		async (c) => {
		const userId = c.get('userEmail') as string;
		const id = c.req.param('id');
		const data = c.req.valid('json');

		const template = await updateTemplate(userId, id, data, c.env.DB);

		if (!template) {
			return c.json({ error: 'Template not found' }, 404);
		}

		return c.json(template);
	})
	.delete(
		'/vaults/:vaultId/templates/:id',
		describeRoute({
			...commonTemplateConfig,
			description: 'Delete expense template',
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

		const isDeleted = await deleteTemplate(userId, id, c.env.DB);

		if (!isDeleted) {
			return c.json({ error: 'Template not found' }, 404);
		}

		return c.json({ message: 'Template deleted successfully' });
	})
	.post(
		'/vaults/:vaultId/templates/:id/increment-usage',
		describeRoute({
			...commonTemplateConfig,
			description: 'Increment template usage count',
			responses: {
				200: {
					description: 'Successful response',
					content: {
						'application/json': { schema: resolver(v.object({ message: v.string() })) },
					},
				},
			},
		}),
		async (c) => {
		const id = c.req.param('id');

		await incrementTemplateUsage(id, c.env.DB);

		return c.json({ message: 'Template usage incremented' });
	});
