import { drizzle } from "drizzle-orm/d1";
import * as schema from "$lib/server/db/schema";
import { paymentTypes, paymentProviders } from "$lib/server/db/schema";
import { eq, isNull, or } from "drizzle-orm";

export const getPaymentTypes = async (db: D1Database) => {
	const client = drizzle(db, { schema });

	return await client
		.select()
		.from(paymentTypes)
		.where(
			eq(paymentTypes.isPublic, true)
		)
		.orderBy(paymentTypes.name);
};

export const getPaymentProviders = async (db: D1Database, type?: string) => {
	const client = drizzle(db, { schema });

	const conditions = [eq(paymentProviders.isPublic, true)];

	if (type) {
		conditions.push(eq(paymentProviders.type, type));
	}

	return await client
		.select()
		.from(paymentProviders)
		.where(or(...conditions))
		.orderBy(paymentProviders.name);
};
