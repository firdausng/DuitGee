/**
 * User Context Pattern for Microservice Compatibility
 *
 * This pattern allows the application to work both as a monolith and as microservices.
 * When operating as microservices, user data would come from a separate User Service.
 */

export interface UserContext {
	id: string;
	email: string;
	name?: string;
	firstName?: string;
	lastName?: string;
}

export interface UserServiceInterface {
	getUserById(userId: string): Promise<UserContext | null>;
	getUserByEmail(email: string): Promise<UserContext | null>;
	validateUser(userId: string): Promise<boolean>;
}

/**
 * Monolith implementation - uses local database
 */
export class MonolithUserService implements UserServiceInterface {
	constructor(private db: D1Database) {}

	async getUserById(userId: string): Promise<UserContext | null> {
		// Implementation would query local users table
		// For now, return a mock implementation
		return {
			id: userId,
			email: `user-${userId}@example.com`,
			name: `User ${userId}`
		};
	}

	async getUserByEmail(email: string): Promise<UserContext | null> {
		// Implementation would query local users table
		// For now, return a mock implementation
		return {
			id: `user-${Date.now()}`,
			email,
			name: `User for ${email}`
		};
	}

	async validateUser(userId: string): Promise<boolean> {
		const user = await this.getUserById(userId);
		return user !== null;
	}
}

/**
 * Microservice implementation - calls external User Service
 */
export class MicroserviceUserService implements UserServiceInterface {
	constructor(private userServiceUrl: string, private apiKey: string) {}

	async getUserById(userId: string): Promise<UserContext | null> {
		try {
			const response = await fetch(`${this.userServiceUrl}/users/${userId}`, {
				headers: {
					'Authorization': `Bearer ${this.apiKey}`,
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				return null;
			}

			return await response.json();
		} catch (error) {
			console.error('Error fetching user from microservice:', error);
			return null;
		}
	}

	async getUserByEmail(email: string): Promise<UserContext | null> {
		try {
			const response = await fetch(`${this.userServiceUrl}/users/by-email/${encodeURIComponent(email)}`, {
				headers: {
					'Authorization': `Bearer ${this.apiKey}`,
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				return null;
			}

			return await response.json();
		} catch (error) {
			console.error('Error fetching user by email from microservice:', error);
			return null;
		}
	}

	async validateUser(userId: string): Promise<boolean> {
		const user = await this.getUserById(userId);
		return user !== null;
	}
}

/**
 * Factory function to create the appropriate user service based on environment
 */
export function createUserService(env: {
	USER_SERVICE_URL?: string;
	USER_SERVICE_API_KEY?: string;
	DB?: D1Database;
}): UserServiceInterface {
	// If microservice configuration is present, use microservice implementation
	if (env.USER_SERVICE_URL && env.USER_SERVICE_API_KEY) {
		return new MicroserviceUserService(env.USER_SERVICE_URL, env.USER_SERVICE_API_KEY);
	}

	// Otherwise, use monolith implementation
	if (env.DB) {
		return new MonolithUserService(env.DB);
	}

	throw new Error('No valid user service configuration found');
}

/**
 * Helper to get user context in handlers
 * This abstracts away whether we're in monolith or microservice mode
 */
export async function getUserContext(
	userId: string,
	userService: UserServiceInterface
): Promise<UserContext> {
	const user = await userService.getUserById(userId);
	if (!user) {
		throw new Error(`User not found: ${userId}`);
	}
	return user;
}