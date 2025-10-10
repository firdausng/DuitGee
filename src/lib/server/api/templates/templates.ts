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
import {createExpenseTemplateSchema, updateExpenseTemplateSchema} from "$lib/schemas/expense";

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
		const templatesList = await getTemplates(vaultId, c.env.DB);

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
		vValidator('json', createExpenseTemplateSchema),
		async (c) => {
		const vaultId = c.req.param('vaultId');
		const data = c.req.valid('json');

		const template = await createTemplate({ ...data, vaultId }, c.env.DB);

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
		const vaultId = c.req.param('vaultId');

		const template = await getTemplate(id, vaultId, c.env.DB);

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
		vValidator('json', updateExpenseTemplateSchema),
		async (c) => {
		const userId = c.get('userEmail') as string;
		const id = c.req.param('id');
        const vaultId = c.req.param('vaultId');
		const data = c.req.valid('json');

		const template = await updateTemplate(userId, id, vaultId, data, c.env.DB);

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
		const vaultId = c.req.param('vaultId');

		const isDeleted = await deleteTemplate(userId, id, vaultId, c.env.DB);

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
