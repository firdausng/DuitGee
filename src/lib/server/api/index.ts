import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
    trimTrailingSlash,
} from 'hono/trailing-slash'
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { expensesApi } from './expenses/expenses';
import { categoriesApi } from './categories/categories';
import { categoryGroupsApi } from './category-groups/category-groups';
import { usersApi } from './users/users';
import { vaultsApi } from './vaults/vaults';
import { vaultMembersApi } from './vault-members/vault-members';
import {AuthService} from "$lib/server/auth-service.svelte";
import {jwk} from "hono/jwk";
import {notificationApi} from "$lib/server/api/notifications/notifications";
import {createRemoteJWKSet, jwtVerify} from "jose";

const router = new Hono<App.Api>()
	// .use('*', cors())
    .use('*', trimTrailingSlash())
	.use(logger())
	.use('*', prettyJSON())
	.use('*', async (c, next) => {
		// Extract bearer token and verify it
		const authHeader = c.req.header('Authorization');
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return c.json({ error: 'Missing or invalid authorization header' }, 401);
		}

		const accessToken = authHeader.substring(7); // Remove "Bearer " prefix

		try {
			const authService = new AuthService(
				c.env.WORKOS_API_KEY,
				c.env.WORKOS_CLIENT_ID,
				c.env.BASE_PATH,
				c.env.WORKOS_COOKIE_PASSWORD
			);

			// Verify the JWT token
			const verifiedToken = await authService.verifiedSession(accessToken);
            console.log('verifiedToken', verifiedToken)
			// Extract user ID from the token payload
			const workOsUserId = verifiedToken.payload.sub as string; // 'sub' (subject) typically contains the user ID

			if (!workOsUserId) {
				return c.json({ error: 'Invalid token: no user ID found' }, 401);
			}

            const user = await authService.getUser(workOsUserId);
            if (!user) {
                return c.json({ error: 'Not authenticated' }, 401);
            }
            console.log('verified user', user)
			// Set the user ID in the context
			c.set('userEmail', user.email);
			await next();
		} catch (error) {
			console.error('JWT verification failed:', error);
			return c.json({ error: 'Invalid or expired token' }, 401);
		}
	})
	.route('/expenses', expensesApi)
	.route('/categories', categoriesApi)
	.route('/category-groups', categoryGroupsApi)
	.route('/notifications', notificationApi)
	.route('/users', usersApi)
	.route('/vaults', vaultsApi)
	.route('/vault-members', vaultMembersApi);

export const api = new Hono<App.Api>().route('/api', router);
