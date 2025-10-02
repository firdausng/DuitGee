import { drizzle } from "drizzle-orm/d1";
import * as schema from "$lib/server/db/schema";
import { tags } from "$lib/server/db/schema";
import { eq, desc, like, sql } from "drizzle-orm";
import { normalizeTagName } from "$lib/server/api/tags/schema";

/**
 * Get all tags ordered by usage count (most popular first)
 */
export const getTags = async (
	db: D1Database,
	options?: { limit?: number }
): Promise<Array<typeof tags.$inferSelect>> => {
	const client = drizzle(db, { schema });

	let query = client
		.select()
		.from(tags)
		.orderBy(desc(tags.usageCount), tags.name);

	if (options?.limit) {
		query = query.limit(options.limit);
	}

	return await query;
};

/**
 * Search tags by name prefix (for autocomplete/suggestions)
 */
export const searchTags = async (
	db: D1Database,
	query?: string,
	limit: number = 20
): Promise<Array<typeof tags.$inferSelect>> => {
	const client = drizzle(db, { schema });

	let dbQuery = client
		.select()
		.from(tags)
		.orderBy(desc(tags.usageCount), tags.name)
		.limit(limit);

	if (query) {
		const normalizedQuery = normalizeTagName(query);
		dbQuery = dbQuery.where(like(tags.name, `${normalizedQuery}%`));
	}

	return await dbQuery;
};

/**
 * Get a specific tag by name (case-insensitive)
 */
export const getTag = async (
	name: string,
	db: D1Database
): Promise<typeof tags.$inferSelect | undefined> => {
	const client = drizzle(db, { schema });
	const normalizedName = normalizeTagName(name);

	const result = await client
		.select()
		.from(tags)
		.where(eq(tags.name, normalizedName))
		.limit(1);

	return result[0];
};

/**
 * Create or get existing tag (Twitter-style auto-creation)
 * If tag exists, returns existing tag. If not, creates it.
 */
export const getOrCreateTag = async (
	name: string,
	userId: string,
	db: D1Database
): Promise<typeof tags.$inferSelect> => {
	const client = drizzle(db, { schema });
	const normalizedName = normalizeTagName(name);

	// Try to get existing tag
	const existingTag = await getTag(normalizedName, db);
	if (existingTag) {
		return existingTag;
	}

	// Create new tag
	const tagData = {
		name: normalizedName,
		usageCount: 0,
		createdAt: new Date().toISOString(),
		createdBy: userId,
	};

	const result = await client
		.insert(tags)
		.values(tagData)
		.returning();

	return result[0];
};

/**
 * Increment tag usage count
 * Call this whenever a tag is used on an expense/template
 */
export const incrementTagUsage = async (
	name: string,
	db: D1Database
): Promise<void> => {
	const client = drizzle(db, { schema });
	const normalizedName = normalizeTagName(name);

	await client
		.update(tags)
		.set({
			usageCount: sql`${tags.usageCount} + 1`
		})
		.where(eq(tags.name, normalizedName));
};

/**
 * Decrement tag usage count
 * Call this when a tag is removed from an expense/template
 */
export const decrementTagUsage = async (
	name: string,
	db: D1Database
): Promise<void> => {
	const client = drizzle(db, { schema });
	const normalizedName = normalizeTagName(name);

	await client
		.update(tags)
		.set({
			usageCount: sql`${tags.usageCount} - 1`
		})
		.where(eq(tags.name, normalizedName));
};

/**
 * Delete unused tags (usageCount = 0)
 * Can be run as a cleanup task
 */
export const deleteUnusedTags = async (
	db: D1Database
): Promise<number> => {
	const client = drizzle(db, { schema });

	const result = await client
		.delete(tags)
		.where(eq(tags.usageCount, 0))
		.returning();

	return result.length;
};
