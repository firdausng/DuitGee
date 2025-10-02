import { drizzle } from "drizzle-orm/d1";
import * as schema from "$lib/server/db/schema";
import { paymentTypes, paymentProviders } from "$lib/server/db/schema";
import { eq, isNull, or, asc } from "drizzle-orm";

export const getPaymentTypes = async (db: D1Database) => {
	const client = drizzle(db, { schema });

	return await client
		.select()
		.from(paymentTypes)
		.where(eq(paymentTypes.isPublic, true))
		.orderBy(asc(paymentTypes.name));
};

export const getPaymentProviders = async (db: D1Database, type?: string) => {
	const client = drizzle(db, { schema });

	let whereCondition = eq(paymentProviders.isPublic, true);

	if (type) {
		whereCondition = or(
			eq(paymentProviders.isPublic, true),
			eq(paymentProviders.type, type)
		) as any;
	}

	return await client
		.select()
		.from(paymentProviders)
		.where(whereCondition)
		.orderBy(asc(paymentProviders.name));
};
