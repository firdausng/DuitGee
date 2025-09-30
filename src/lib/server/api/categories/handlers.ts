import {drizzle} from "drizzle-orm/d1";
import * as schema from "$lib/server/db/schema";
import {categories, categoryGroups, vaults, vaultMembers} from "$lib/server/db/schema";
import {and, eq, or, isNotNull, like, sql} from "drizzle-orm";
import { requireVaultPermission } from "$lib/server/utils/permissions";
import { initialAuditFields, updateAuditFields } from "$lib/server/utils/audit";


export const getCategories = async (vaultId: string, db: D1Database) => {
    const client = drizzle(db, { schema });

    const categoriesList = await client
        .select({
            id: categories.id,
            name: categories.name,
            description: categories.description,
            keywords: categories.keywords,
            color: categories.color,
            icon: categories.icon,
            iconType: categories.iconType,
            groupId: categories.groupId,
            isPublic: categories.isPublic,
            vaultId: categories.vaultId,
            createdAt: categories.createdAt,
            group: {
                id: categoryGroups.id,
                name: categoryGroups.name,
                color: categoryGroups.color,
                icon: categoryGroups.icon,
                iconType: categoryGroups.iconType,
                isPublic: categoryGroups.isPublic,
                vaultId: categoryGroups.vaultId
            }
        })
        .from(categories)
        .leftJoin(categoryGroups, eq(categories.groupId, categoryGroups.id))
        .where(
            vaultId
                ? or(
                    eq(categories.isPublic, true), // Public categories available to all
                    and(isNotNull(categories.vaultId), eq(categories.vaultId, vaultId))  // Categories in specific vault
                )
                : eq(categories.isPublic, true) // Only public categories if no vault specified
        );

    // console.log(categoriesList)

    return categoriesList;
}

export const searchCategories = async (userId: string, vaultId: string, searchTerm: string, db: D1Database) => {
    const client = drizzle(db, { schema });

    // Search in name, description, and keywords
    const searchPattern = `%${searchTerm.toLowerCase()}%`;

    const categoriesList = await client
        .select({
            id: categories.id,
            name: categories.name,
            description: categories.description,
            keywords: categories.keywords,
            color: categories.color,
            icon: categories.icon,
            iconType: categories.iconType,
            groupId: categories.groupId,
            isPublic: categories.isPublic,
            vaultId: categories.vaultId,
            createdAt: categories.createdAt,
            group: {
                id: categoryGroups.id,
                name: categoryGroups.name,
                color: categoryGroups.color,
                icon: categoryGroups.icon,
                iconType: categoryGroups.iconType,
                isPublic: categoryGroups.isPublic,
                vaultId: categoryGroups.vaultId
            }
        })
        .from(categories)
        .leftJoin(categoryGroups, eq(categories.groupId, categoryGroups.id))
        .where(
            and(
                // Search criteria - case insensitive search across multiple fields
                or(
                    like(sql`LOWER(${categories.name})`, searchPattern),
                    like(sql`LOWER(${categories.description})`, searchPattern),
                    like(sql`LOWER(${categories.keywords})`, searchPattern),
                    like(sql`LOWER(${categoryGroups.name})`, searchPattern)
                ),
                // Visibility criteria
                vaultId
                    ? or(
                        eq(categories.isPublic, true), // Public categories available to all
                        and(isNotNull(categories.vaultId), eq(categories.vaultId, vaultId))  // Categories in specific vault
                    )
                    : eq(categories.isPublic, true) // Only public categories if no vault specified
            )
        )
        .orderBy(
            // Order by relevance: exact name matches first, then partial matches
            sql`CASE
                WHEN LOWER(${categories.name}) = LOWER(${searchTerm}) THEN 1
                WHEN LOWER(${categories.name}) LIKE ${`${searchTerm.toLowerCase()}%`} THEN 2
                WHEN LOWER(${categories.keywords}) LIKE ${searchPattern} THEN 3
                ELSE 4
            END`,
            categories.name
        );

    return categoriesList;
}

export const getCategory = async (userId: string, categoryId: string, vaultId: string, db: D1Database) => {
    const client = drizzle(db, { schema });

    const category = await client
        .select({
            id: categories.id,
            name: categories.name,
            color: categories.color,
            icon: categories.icon,
            iconType: categories.iconType,
            groupId: categories.groupId,
            isPublic: categories.isPublic,
            vaultId: categories.vaultId,
            createdAt: categories.createdAt,
            group: {
                id: categoryGroups.id,
                name: categoryGroups.name,
                color: categoryGroups.color,
                icon: categoryGroups.icon,
                iconType: categoryGroups.iconType,
                isPublic: categoryGroups.isPublic,
                vaultId: categoryGroups.vaultId
            }
        })
        .from(categories)
        .leftJoin(categoryGroups, eq(categories.groupId, categoryGroups.id))
        .where(
            and(
                eq(categories.id, categoryId),
                or(
                    eq(categories.isPublic, true), // Public categories available to all
                    and(isNotNull(categories.vaultId), eq(categories.vaultId, vaultId!))  // Categories in specific vault
                )
            )
        )
        .limit(1);

    return category[0];
}

export const createCategory = async (userId: string, data: any, vaultId: string, db: D1Database) => {
    const client = drizzle(db, { schema });

    // Check if user has admin permissions (only if vaultId is provided)
    if (vaultId) {
        await requireVaultPermission(userId, vaultId, 'canCreateCategories', db);
    }

    console.log(`[createCategory.handler] create Category ${JSON.stringify({
        ...data,
        vaultId
    }, null,2)}`);

    try {
        const category = await client
            .insert(categories)
            .values({
                ...data,
                vaultId,
                ...initialAuditFields({ userId })
            })
            .returning();

        console.log(`[createCategory.handler] success create Category`)

        return category[0];
    }catch(error) {
        console.log(`[createCategory.handler] error creating Category ${error}`)
        return null;
    }
};

export const deleteCategory = async (userId: string, categoryId: string, vaultId: string, db: D1Database) => {
    const client = drizzle(db, { schema });

    // Check if user has admin permissions (only if vaultId is provided)
    if (vaultId) {
        await requireVaultPermission(userId, vaultId, 'canDeleteCategories', db);
    }

    // Only allow deleting vault's own categories (not public ones)
    const deletedCategory = await client
        .delete(categories)
        .where(
            and(
                eq(categories.id, categoryId),
                vaultId ? eq(categories.vaultId, vaultId) : isNotNull(categories.vaultId),
                eq(categories.isPublic, false)
            )
        )
        .returning();

    return deletedCategory[0];
}

export const updateCategory = async (userId: string, categoryId: string, vaultId: string, data: any, db: D1Database) => {
    const client = drizzle(db, { schema });

    // Check if user has admin permissions
    await requireVaultPermission(userId, vaultId, 'canEditCategories', db);

    // Only allow updating vault's own categories (not public ones)
    const updatedCategory = await client
        .update(categories)
        .set({
            ...data,
            ...updateAuditFields({ userId })
        })
        .where(
            and(
                eq(categories.id, categoryId),
                vaultId ? eq(categories.vaultId, vaultId) : isNotNull(categories.vaultId),
                eq(categories.isPublic, false)
            )
        )
        .returning();

    return updatedCategory[0];
}