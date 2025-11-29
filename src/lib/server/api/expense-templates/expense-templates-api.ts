import { Hono } from 'hono';
import * as v from 'valibot';
import { describeRoute, resolver } from 'hono-openapi';
import { vValidator } from '@hono/valibot-validator';
import {
	createExpenseTemplateSchema,
	getExpenseTemplateQuerySchema,
	listExpenseTemplatesQuerySchema,
	updateExpenseTemplateSchema,
	deleteExpenseTemplateRequestSchema
} from '$lib/schemas/expenseTemplates';
import { createExpenseTemplate } from '$lib/server/api/expense-templates/createExpenseTemplateHandler';
import { getExpenseTemplates } from '$lib/server/api/expense-templates/getExpenseTemplatesHandler';
import { getExpenseTemplate } from '$lib/server/api/expense-templates/getExpenseTemplateHandler';
import { updateExpenseTemplate } from '$lib/server/api/expense-templates/updateExpenseTemplateHandler';
import { deleteExpenseTemplate } from '$lib/server/api/expense-templates/deleteExpenseTemplateHandler';

const TEMPLATE_TAG = ['Expense Template'];
const commonTemplateConfig = {
	tags: TEMPLATE_TAG
};

export const expenseTemplatesApi = new Hono<App.Api>()
	// Query: Get expense templates for a vault (GET)
	.get(
		'/getExpenseTemplates',
		describeRoute({
			...commonTemplateConfig,
			description: 'Get all expense templates for a vault',
			responses: {
				200: {
					description: 'Successful response',
					content: {
						'application/json': {
							schema: resolver(
								v.object({
									success: v.boolean(),
									data: v.object({
										templates: v.array(v.any())
									})
								})
							)
						}
					}
				}
			}
		}),
		vValidator('query', listExpenseTemplatesQuerySchema),
		async (c) => {
			const session = c.get('currentSession');
			const query = c.req.valid('query');

			try {
				const data = await getExpenseTemplates(session, query, c.env);
				return c.json({
					success: true,
					data
				});
			} catch (error) {
				console.error({
					message: 'Error fetching expense templates',
					error
				});
				return c.json(
					{
						success: false,
						error: error instanceof Error ? error.message : 'Failed to fetch expense templates'
					},
					500
				);
			}
		}
	)
	// Query: Get single expense template (GET)
	.get(
		'/getExpenseTemplate',
		describeRoute({
			...commonTemplateConfig,
			description: 'Get a specific expense template',
			responses: {
				200: {
					description: 'Successful response',
					content: {
						'application/json': {
							schema: resolver(
								v.object({
									success: v.boolean(),
									data: v.any()
								})
							)
						}
					}
				},
				404: {
					description: 'Template not found'
				}
			}
		}),
		vValidator('query', getExpenseTemplateQuerySchema),
		async (c) => {
			const session = c.get('currentSession');
			const query = c.req.valid('query');

			try {
				const template = await getExpenseTemplate(session, query, c.env);
				return c.json({
					success: true,
					data: template
				});
			} catch (error) {
				console.error({
					message: 'Error fetching expense template',
					error
				});
				const status = error instanceof Error && error.message.includes('not found') ? 404 : 500;
				return c.json(
					{
						success: false,
						error: error instanceof Error ? error.message : 'Failed to fetch expense template'
					},
					status
				);
			}
		}
	)
	// Command: Create expense template (POST)
	.post(
		'/createExpenseTemplate',
		describeRoute({
			...commonTemplateConfig,
			description: 'Create a new expense template',
			responses: {
				201: {
					description: 'Successful response',
					content: {
						'application/json': {
							schema: resolver(
								v.object({
									success: v.boolean(),
									data: v.any()
								})
							)
						}
					}
				}
			}
		}),
		vValidator('json', createExpenseTemplateSchema),
		async (c) => {
			const session = c.get('currentSession');
			const data = c.req.valid('json');

			try {
				const template = await createExpenseTemplate(session, data, c.env);
				return c.json(
					{
						success: true,
						data: template
					},
					201
				);
			} catch (error) {
				console.error({
					message: 'Error creating expense template',
					error
				});
				return c.json(
					{
						success: false,
						error: error instanceof Error ? error.message : 'Failed to create expense template'
					},
					500
				);
			}
		}
	)
	// Command: Update expense template (POST)
	.post(
		'/updateExpenseTemplate',
		describeRoute({
			...commonTemplateConfig,
			description: 'Update an existing expense template',
			responses: {
				200: {
					description: 'Successful response',
					content: {
						'application/json': {
							schema: resolver(
								v.object({
									success: v.boolean(),
									data: v.any()
								})
							)
						}
					}
				},
				404: {
					description: 'Template not found'
				}
			}
		}),
		vValidator('json', updateExpenseTemplateSchema),
		async (c) => {
			const session = c.get('currentSession');
			const data = c.req.valid('json');

			try {
				const template = await updateExpenseTemplate(session, data, c.env);
				return c.json({
					success: true,
					data: template
				});
			} catch (error) {
				console.error({
					message: 'Error updating expense template',
					error
				});
				const status = error instanceof Error && error.message.includes('not found') ? 404 : 500;
				return c.json(
					{
						success: false,
						error: error instanceof Error ? error.message : 'Failed to update expense template'
					},
					status
				);
			}
		}
	)
	// Command: Delete expense template (POST)
	.post(
		'/deleteExpenseTemplate',
		describeRoute({
			...commonTemplateConfig,
			description: 'Soft delete an expense template',
			responses: {
				200: {
					description: 'Successful response',
					content: {
						'application/json': {
							schema: resolver(
								v.object({
									success: v.boolean(),
									data: v.any()
								})
							)
						}
					}
				},
				404: {
					description: 'Template not found'
				}
			}
		}),
		vValidator('json', deleteExpenseTemplateRequestSchema),
		async (c) => {
			const session = c.get('currentSession');
			const data = c.req.valid('json');

			try {
				const template = await deleteExpenseTemplate(session, data, c.env);
				return c.json({
					success: true,
					data: template
				});
			} catch (error) {
				console.error({
					message: 'Error deleting expense template',
					error
				});
				const status = error instanceof Error && error.message.includes('not found') ? 404 : 500;
				return c.json(
					{
						success: false,
						error: error instanceof Error ? error.message : 'Failed to delete expense template'
					},
					status
				);
			}
		}
	);
