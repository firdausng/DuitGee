import { drizzle } from "drizzle-orm/d1";
import * as schema from "$lib/server/db/schema";
import { expenseTemplates, expenseTemplateTags, tags, categories } from "$lib/server/db/schema";
import { and, eq, desc, isNull, inArray } from "drizzle-orm";
import { initialAuditFields, updateAuditFields } from "$lib/server/utils/audit";
import { createId } from '@paralleldrive/cuid2';
import { getOrCreateTag, incrementTagUsage, decrementTagUsage } from "$lib/server/api/tags/handlers";

export type ExpenseTemplate = typeof expenseTemplates.$inferSelect & {
	category?: typeof categories.$inferSelect | null;
	tags?: Array<typeof tags.$inferSelect>;
};

export const getTemplates = async (
	userId: string,
	vaultId: string,
	db: D1Database
): Promise<ExpenseTemplate[]> => {
	const client = drizzle(db, { schema });

	// Get templates with category
	const templatesList = await client
		.select({
			template: expenseTemplates,
			category: categories
		})
		.from(expenseTemplates)
		.leftJoin(categories, eq(expenseTemplates.categoryId, categories.id))
		.where(
			and(
				eq(expenseTemplates.userId, userId),
				eq(expenseTemplates.vaultId, vaultId),
				isNull(expenseTemplates.deletedAt)
			)
		)
		.orderBy(desc(expenseTemplates.usageCount), desc(expenseTemplates.lastUsedAt));

	// Get template IDs
	const templateIds = templatesList.map(t => t.template.id);

	// Get all tags for these templates
	const templateTagsList = templateIds.length > 0
		? await client
			.select({
				templateId: expenseTemplateTags.templateId,
				tag: tags
			})
			.from(expenseTemplateTags)
			.innerJoin(tags, eq(expenseTemplateTags.tagName, tags.name))
			.where(inArray(expenseTemplateTags.templateId, templateIds))
		: [];

	// Group tags by template
	const tagsByTemplate = new Map<string, Array<typeof tags.$inferSelect>>();
	for (const { templateId, tag } of templateTagsList) {
		if (!tagsByTemplate.has(templateId)) {
			tagsByTemplate.set(templateId, []);
		}
		tagsByTemplate.get(templateId)!.push(tag);
	}

	// Combine templates with their tags
	return templatesList.map(({ template, category }) => ({
		...template,
		category,
		tags: tagsByTemplate.get(template.id) || []
	}));
};

export const getTemplate = async (
	userId: string,
	templateId: string,
	db: D1Database
): Promise<ExpenseTemplate | undefined> => {
	const client = drizzle(db, { schema });

	const result = await client
		.select({
			template: expenseTemplates,
			category: categories
		})
		.from(expenseTemplates)
		.leftJoin(categories, eq(expenseTemplates.categoryId, categories.id))
		.where(
			and(
				eq(expenseTemplates.id, templateId),
				eq(expenseTemplates.userId, userId),
				isNull(expenseTemplates.deletedAt)
			)
		)
		.limit(1);

	if (!result[0]) return undefined;

	// Get tags for this template
	const templateTagsList = await client
		.select({ tag: tags })
		.from(expenseTemplateTags)
		.innerJoin(tags, eq(expenseTemplateTags.tagName, tags.name))
		.where(eq(expenseTemplateTags.templateId, templateId));

	return {
		...result[0].template,
		category: result[0].category,
		tags: templateTagsList.map(t => t.tag)
	};
};

export const createTemplate = async (
	userId: string,
	data: {
		vaultId: string;
		name: string;
		description?: string;
		categoryId?: string;
		defaultAmount?: number;
		paymentTypeId?: string;
		paymentProviderId?: string;
		note?: string;
		icon?: string;
		iconType?: string;
		tagNames?: string[];
	},
	db: D1Database
) => {
	const client = drizzle(db, { schema });

	const { tagNames, ...templateData } = data;
	const templateId = createId();

	const template = await client
		.insert(expenseTemplates)
		.values({
			id: templateId,
			...templateData,
			userId,
			...initialAuditFields({ userId })
		})
		.returning();

	// Add tags if provided
	if (tagNames && tagNames.length > 0) {
		// Get or create tags and increment usage
		for (const tagName of tagNames) {
			await getOrCreateTag(tagName, userId, db);
			await incrementTagUsage(tagName, db);
		}

		// Insert junction table entries
		await client
			.insert(expenseTemplateTags)
			.values(
				tagNames.map(tagName => ({
					templateId,
					tagName,
					color: '#6B7280', // Default color
					createdAt: new Date().toISOString()
				}))
			);
	}

	return template[0];
};

export const updateTemplate = async (
	userId: string,
	templateId: string,
	data: {
		name?: string;
		description?: string;
		categoryId?: string;
		defaultAmount?: number;
		paymentTypeId?: string;
		paymentProviderId?: string;
		note?: string;
		icon?: string;
		iconType?: string;
		tagNames?: string[];
	},
	db: D1Database
) => {
	const client = drizzle(db, { schema });

	const { tagNames, ...templateData } = data;

	const updatedTemplate = await client
		.update(expenseTemplates)
		.set({
			...templateData,
			...updateAuditFields({ userId })
		})
		.where(
			and(
				eq(expenseTemplates.id, templateId),
				eq(expenseTemplates.userId, userId),
				isNull(expenseTemplates.deletedAt)
			)
		)
		.returning();

	// Update tags if provided
	if (tagNames !== undefined) {
		// Get old tags to decrement their usage
		const oldTags = await client
			.select({ tagName: expenseTemplateTags.tagName })
			.from(expenseTemplateTags)
			.where(eq(expenseTemplateTags.templateId, templateId));

		// Decrement usage for old tags
		for (const { tagName } of oldTags) {
			await decrementTagUsage(tagName, db);
		}

		// Remove existing tags
		await client
			.delete(expenseTemplateTags)
			.where(eq(expenseTemplateTags.templateId, templateId));

		// Add new tags
		if (tagNames.length > 0) {
			// Get or create tags and increment usage
			for (const tagName of tagNames) {
				await getOrCreateTag(tagName, userId, db);
				await incrementTagUsage(tagName, db);
			}

			// Insert junction table entries
			await client
				.insert(expenseTemplateTags)
				.values(
					tagNames.map(tagName => ({
						templateId,
						tagName,
						color: '#6B7280', // Default color
						createdAt: new Date().toISOString()
					}))
				);
		}
	}

	return updatedTemplate[0];
};

export const deleteTemplate = async (
	userId: string,
	templateId: string,
	db: D1Database
) => {
	const client = drizzle(db, { schema });

	// Get tags to decrement their usage
	const templateTags = await client
		.select({ tagName: expenseTemplateTags.tagName })
		.from(expenseTemplateTags)
		.where(eq(expenseTemplateTags.templateId, templateId));

	// Decrement usage for all tags
	for (const { tagName } of templateTags) {
		await decrementTagUsage(tagName, db);
	}

	// Delete tag associations
	await client
		.delete(expenseTemplateTags)
		.where(eq(expenseTemplateTags.templateId, templateId));

	// Soft delete template
	const deletedTemplate = await client
		.update(expenseTemplates)
		.set({
			deletedAt: new Date().toISOString(),
			deletedBy: userId
		})
		.where(
			and(
				eq(expenseTemplates.id, templateId),
				eq(expenseTemplates.userId, userId)
			)
		)
		.returning();

	return deletedTemplate[0];
};

export const incrementTemplateUsage = async (
	templateId: string,
	db: D1Database
) => {
	const client = drizzle(db, { schema });

	await client
		.update(expenseTemplates)
		.set({
			usageCount: schema.sql`${expenseTemplates.usageCount} + 1`,
			lastUsedAt: new Date().toISOString()
		})
		.where(eq(expenseTemplates.id, templateId));
};
