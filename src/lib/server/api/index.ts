import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { expensesApi } from './expenses/expenses';
import { categoriesApi } from './categories/categories';
import { categoryGroupsApi } from './category-groups/category-groups';
import { usersApi } from './users/users';
import {AuthService} from "$lib/server/auth-service.svelte";
import {jwk} from "hono/jwk";

const api = new Hono<App.Api>()
    .use(async (c, next) => {
        const authService = new AuthService(c.env.WORKOS_API_KEY, c.env.WORKOS_CLIENT_ID, c.env.BASE_PATH, c.env.WORKOS_COOKIE_PASSWORD);
        const handler = jwk({
            jwks_uri: authService.getJwksUrl()
        });

        await handler(c, next);
    })
	// .use('*', cors())
	.use('*', logger())
	.use('*', prettyJSON())
	.use('*', async (c, next) => {
		// Mock user ID for now - replace with actual auth
		c.set('userId', 'user_123');
		await next();
	})
	.route('/expenses', expensesApi)
	.route('/categories', categoriesApi)
	.route('/category-groups', categoryGroupsApi)
	.route('/users', usersApi);

export default api;