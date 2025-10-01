import { drizzle } from "drizzle-orm/d1";
import * as schema from "$lib/server/db/schema";
import { users, vaults, vaultMembers } from "$lib/server/db/schema";
import { and, eq, desc, sql } from "drizzle-orm";
import { createId } from '@paralleldrive/cuid2';
import type {CreateUser, UpdateUser, User} from "$lib/server/api/users/schema";

export const getUsers = async (db: D1Database, options?: {
	page?: number;
	limit?: number;
}) => {
	const client = drizzle(db, { schema });
	const { page = 1, limit = 10 } = options || {};
	const offset = (page - 1) * limit;

	const usersList = await client
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			createdAt: users.createdAt,
			updatedAt: users.updatedAt
		})
		.from(users)
		.orderBy(desc(users.createdAt))
		.limit(limit)
		.offset(offset);

	const totalCount = await client
		.select({ count: sql`count(*)` })
		.from(users);

	return {
		users: usersList,
		pagination: {
			page,
			limit,
			total: totalCount[0].count as number,
			pages: Math.ceil((totalCount[0].count as number) / limit)
		}
	};
};

export const getUser = async (userId: string, db: D1Database) => {
	const client = drizzle(db, { schema });

	const user = await client
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			createdAt: users.createdAt,
			updatedAt: users.updatedAt
		})
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	return user[0];
};

export const getUserByEmail = async (email: string, db: D1Database) => {
    const client = drizzle(db, { schema });

    console.log(`[getUserByEmail.handler] get user by email: ${email}`);
    const user = await client
        .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt
        })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    return user[0];
};

export const createUser = async (data: CreateUser, db: D1Database) => {
	const client = drizzle(db, { schema });

	console.log(`[createUser.handler] create User ${JSON.stringify(data, null, 2)}`);

	try {
		const user = await client
			.insert(users)
			.values({
				...data,
			})
			.returning();

		console.log(`[createUser.handler] success create User`);

		return user[0];
	} catch (error) {
		console.log(`[createUser.handler] error creating User ${error}`);
		return null;
	}
};

export const updateUser = async (userId: string, data: UpdateUser, db: D1Database) => {
	const client = drizzle(db, { schema });

	const updatedUser = await client
		.update(users)
		.set({
			...data,
			updatedAt: new Date().toISOString()
		})
		.where(eq(users.id, userId))
		.returning();

	return updatedUser[0];
};

export const deleteUser = async (userId: string, db: D1Database) => {
	const client = drizzle(db, { schema });

	const deletedUser = await client
		.delete(users)
		.where(eq(users.id, userId))
		.returning();

	return deletedUser[0];
};

// Create user with default personal vault
export const createUserWithDefaultVault = async (userData: CreateUser, db: D1Database) => {
    const client = drizzle(db, { schema });

    try {
        // Create the user
        const [user] = await client
            .insert(users)
            .values({
                ...userData,
            })
            .returning();

        // Create default personal vault
        const [personalVault] = await client
            .insert(vaults)
            .values({
                name: 'Personal',
                description: 'Your personal expenses vault',
                color: '#3B82F6',
                icon: '👤',
                iconType: 'emoji',
                ownerId: user.id,
                isPersonal: true,
                createdBy: user.id,
            })
            .returning();

        // Add user as owner member of their personal vault
        await client
            .insert(vaultMembers)
            .values({
                vaultId: personalVault.id,
                userId: user.id,
                role: 'owner',
                permissions: 'admin',
                status: 'active',
            });

        console.log(`[createUserWithDefaultVault] Created user ${user.email} with personal vault ${personalVault.id}`);

        return {
            user,
            personalVault
        };
    } catch (error) {
        console.error(`[createUserWithDefaultVault] Error:`, error);
        throw error;
    }
};

// Get user's personal vault
export const getUserPersonalVault = async (userId: string, db: D1Database) => {
    const client = drizzle(db, { schema });

    const personalVault = await client
        .select()
        .from(vaults)
        .where(
            and(
                eq(vaults.ownerId, userId),
                eq(vaults.isPersonal, true)
            )
        )
        .limit(1);

    return personalVault[0];
};

// Ensure user has a personal vault (create if missing)
export const ensureUserPersonalVault = async (userId: string, db: D1Database) => {
    const client = drizzle(db, { schema });

    // Check if user already has a personal vault
    let personalVault = await getUserPersonalVault(userId, db);

    if (!personalVault) {
        // Create personal vault if it doesn't exist
        const [newVault] = await client
            .insert(vaults)
            .values({
                name: 'Personal',
                description: 'Your personal expenses vault',
                color: '#3B82F6',
                icon: '👤',
                iconType: 'emoji',
                ownerId: userId,
                isPersonal: true,
                createdBy: userId,
            })
            .returning();

        // Add user as owner member
        await client
            .insert(vaultMembers)
            .values({
                vaultId: newVault.id,
                userId: userId,
                role: 'owner',
                permissions: 'admin',
                status: 'active',
            });

        personalVault = newVault;
        console.log(`[ensureUserPersonalVault] Created personal vault for user ${userId}`);
    }

    return personalVault;
};