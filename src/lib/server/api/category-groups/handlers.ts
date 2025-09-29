import { drizzle } from "drizzle-orm/d1";
import * as schema from "$lib/server/db/schema";
import { categoryGroups, categories } from "$lib/server/db/schema";
import { and, eq, desc, sql, or } from "drizzle-orm";
import { requireVaultPermission } from "$lib/server/utils/permissions";

export const getCategoryGroups = async (userId: string, vaultId: string, db: D1Database) => {
	const client = drizzle(db, { schema });

	const groupsList = await client
		.select({
			id: categoryGroups.id,
			name: categoryGroups.name,
			description: categoryGroups.description,
			color: categoryGroups.color,
			icon: categoryGroups.icon,
			iconType: categoryGroups.iconType,
			isPublic: categoryGroups.isPublic,
			vaultId: categoryGroups.vaultId,
			createdAt: categoryGroups.createdAt,
			// Count categories in this group
			categoryCount: sql<number>`(
				SELECT COUNT(*)
				FROM ${categories}
				WHERE ${categories.groupId} = ${categoryGroups.id}
			)`.mapWith(Number)
		})
		.from(categoryGroups)
		.where(
			or(
				eq(categoryGroups.isPublic, true), // Public groups available to all
				eq(categoryGroups.vaultId, vaultId)  // Groups in specific vault
			)
		)
		.orderBy(desc(categoryGroups.createdAt));

	return groupsList;
};

export const getCategoryGroup = async (userId: string, groupId: string, vaultId: string, db: D1Database) => {
	const client = drizzle(db, { schema });

	const group = await client
		.select()
		.from(categoryGroups)
		.where(
			and(
				eq(categoryGroups.id, groupId),
				or(
					eq(categoryGroups.isPublic, true), // Public groups available to all
					eq(categoryGroups.vaultId, vaultId)  // Groups in specific vault
				)
			)
		)
		.limit(1);

	return group[0];
};

export const createCategoryGroup = async (userId: string, vaultId: string, data: any, db: D1Database) => {
	const client = drizzle(db, { schema });

	// Check if user has admin permissions (only if vaultId is provided)
	if (vaultId) {
		await requireVaultPermission(userId, vaultId, 'canCreateCategoryGroups', db);
	}

	console.log(`[createCategoryGroup.handler] create Category Group ${JSON.stringify({
		...data,
		vaultId
	}, null, 2)}`);

	try {
		const group = await client
			.insert(categoryGroups)
			.values({
				...data,
				vaultId
			})
			.returning();

		console.log(`[createCategoryGroup.handler] success create Category Group`);

		return group[0];
	} catch (error) {
		console.log(`[createCategoryGroup.handler] error creating Category Group ${error}`);
		return null;
	}
};

export const updateCategoryGroup = async (userId: string, groupId: string, vaultId: string, data: any, db: D1Database) => {
	const client = drizzle(db, { schema });

	// Check if user has admin permissions (only if vaultId is provided)
	if (vaultId) {
		await requireVaultPermission(userId, vaultId, 'canEditCategoryGroups', db);
	}

	// Only allow updating vault's own groups (not public ones)
	const updatedGroup = await client
		.update(categoryGroups)
		.set(data)
		.where(
			and(
				eq(categoryGroups.id, groupId),
				eq(categoryGroups.vaultId, vaultId),
				eq(categoryGroups.isPublic, false)
			)
		)
		.returning();

	return updatedGroup[0];
};

export const deleteCategoryGroup = async (userId: string, groupId: string, vaultId: string, db: D1Database) => {
	const client = drizzle(db, { schema });

	// Check if user has admin permissions (only if vaultId is provided)
	if (vaultId) {
		await requireVaultPermission(userId, vaultId, 'canDeleteCategoryGroups', db);
	}

	// Only allow deleting vault's own groups (not public ones)
	const deletedGroup = await client
		.delete(categoryGroups)
		.where(
			and(
				eq(categoryGroups.id, groupId),
				eq(categoryGroups.vaultId, vaultId),
				eq(categoryGroups.isPublic, false)
			)
		)
		.returning();

	return deletedGroup[0];
};

export const getCategoryGroupsWithCategories = async (userId: string, vaultId: string, db: D1Database) => {
	const client = drizzle(db, { schema });

	// Get all groups with their categories (both public and vault's)
	const groupsWithCategories = await client
		.select({
			group: {
				id: categoryGroups.id,
				name: categoryGroups.name,
				description: categoryGroups.description,
				color: categoryGroups.color,
				icon: categoryGroups.icon,
				iconType: categoryGroups.iconType,
				isPublic: categoryGroups.isPublic,
				vaultId: categoryGroups.vaultId,
				createdAt: categoryGroups.createdAt
			},
			category: {
				id: categories.id,
				name: categories.name,
				color: categories.color,
				icon: categories.icon,
				iconType: categories.iconType,
				isPublic: categories.isPublic,
				vaultId: categories.vaultId,
				createdAt: categories.createdAt
			}
		})
		.from(categoryGroups)
		.leftJoin(categories, eq(categoryGroups.id, categories.groupId))
		.where(
			or(
				eq(categoryGroups.isPublic, true), // Public groups available to all
				eq(categoryGroups.vaultId, vaultId)  // Groups in specific vault
			)
		)
		.orderBy(desc(categoryGroups.createdAt), categories.name);

	// Group the results
	const grouped = groupsWithCategories.reduce((acc, row) => {
		const groupId = row.group.id;
		if (!acc[groupId]) {
			acc[groupId] = {
				...row.group,
				categories: []
			};
		}
		if (row.category?.id) {
			acc[groupId].categories.push(row.category);
		}
		return acc;
	}, {} as Record<string, any>);

	return Object.values(grouped);
};