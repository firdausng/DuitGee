import { drizzle } from "drizzle-orm/d1";
import * as schema from "$lib/server/db/schema";
import { tags } from "$lib/server/db/schema";
import { and, eq, desc, isNull } from "drizzle-orm";
import { initialAuditFields, updateAuditFields } from "$lib/server/utils/audit";
import { createId } from '@paralleldrive/cuid2';

export const getTags = async (
	vaultId: string,
	db: D1Database
): Promise<Array<typeof tags.$inferSelect>> => {
	const client = drizzle(db, { schema });

	const tagsList = await client
		.select()
		.from(tags)
		.where(
			and(
				eq(tags.vaultId, vaultId),
				isNull(tags.deletedAt)
			)
		)
		.orderBy(tags.name);

	return tagsList;
};

export const getTag = async (
	tagId: string,
	db: D1Database
): Promise<typeof tags.$inferSelect | undefined> => {
	const client = drizzle(db, { schema });

	const tag = await client
		.select()
		.from(tags)
		.where(
			and(
				eq(tags.id, tagId),
				isNull(tags.deletedAt)
			)
		)
		.limit(1);

	return tag[0];
};

export const createTag = async (
	userId: string,
	data: {
		vaultId: string;
		name: string;
		color?: string;
		icon?: string;
		iconType?: string;
	},
	db: D1Database
) => {
	const client = drizzle(db, { schema });

	const tagId = createId();
	const tagData = {
		id: tagId,
		...data,
		...initialAuditFields({ userId })
	};

	const tag = await client
		.insert(tags)
		.values(tagData)
		.returning();

	return tag[0];
};

export const updateTag = async (
	userId: string,
	tagId: string,
	data: {
		name?: string;
		color?: string;
		icon?: string;
		iconType?: string;
	},
	db: D1Database
) => {
	const client = drizzle(db, { schema });

	const updatedTag = await client
		.update(tags)
		.set({
			...data,
			...updateAuditFields({ userId })
		})
		.where(
			and(
				eq(tags.id, tagId),
				isNull(tags.deletedAt)
			)
		)
		.returning();

	return updatedTag[0];
};

export const deleteTag = async (
	userId: string,
	tagId: string,
	db: D1Database
) => {
	const client = drizzle(db, { schema });

	// Soft delete
	const deletedTag = await client
		.update(tags)
		.set({
			deletedAt: new Date().toISOString(),
			deletedBy: userId
		})
		.where(eq(tags.id, tagId))
		.returning();

	return deletedTag[0];
};
