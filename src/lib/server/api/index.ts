import {Hono} from 'hono';
import {cors} from 'hono/cors';
import {
    trimTrailingSlash,
} from 'hono/trailing-slash'
import {logger} from 'hono/logger';
import {prettyJSON} from 'hono/pretty-json';
import {expensesApi} from './expenses/expenses';
import {categoriesApi} from './categories/categories';
import {categoryGroupsApi} from './category-groups/category-groups';
import {vaultsApi} from './vaults/vaults';
import {vaultMembersApi} from './vault-members/vault-members';
import {notificationApi} from "$lib/server/api/notifications/notifications";
import {templatesApi} from "$lib/server/api/templates/templates";
import {jwk} from "hono/jwk";
import {openAPIRouteHandler} from 'hono-openapi'
import {Scalar} from "@scalar/hono-api-reference";
import {auth} from "$lib/server/better-auth";

const router = new Hono<App.Api>()
    // .use('*', cors())
    .use('*', trimTrailingSlash())
    .use(logger())
    .use('*', prettyJSON())
    // .use('*', async (c, next) => {
    // 	// Extract bearer token and verify it
    // 	const authHeader = c.req.header('Authorization');
    // 	if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // 		return c.json({ error: 'Missing or invalid authorization header' }, 401);
    // 	}
    //
    // 	const accessToken = authHeader.substring(7); // Remove "Bearer " prefix
    //
    // 	// Create a hash of the token for KV key (tokens can be long)
    //
    //     const tokenHash = await hashSHA256(accessToken);
    // 	const cacheKey = `token:${tokenHash}`;
    //
    // 	// Check KV cache first
    // 	try {
    // 		const cached = await c.env.KV.get(cacheKey);
    // 		if (cached) {
    // 			c.set('userEmail', cached);
    // 			await next();
    // 			return;
    // 		}
    // 	} catch (kvError) {
    // 		console.warn('KV cache read failed, continuing with verification:', kvError);
    // 	}
    //
    // 	try {
    // 		const authService = new AuthService(
    // 			c.env.WORKOS_API_KEY,
    // 			c.env.WORKOS_CLIENT_ID,
    // 			c.env.BASE_PATH,
    // 			c.env.WORKOS_COOKIE_PASSWORD
    // 		);
    //
    // 		// Verify the JWT token
    // 		const verifiedToken = await authService.verifiedSession(accessToken);
    // 		// Extract user ID from the token payload
    // 		const workOsUserId = verifiedToken.payload.sub as string; // 'sub' (subject) typically contains the user ID
    //
    // 		if (!workOsUserId) {
    // 			return c.json({ error: 'Invalid token: no user ID found' }, 401);
    // 		}
    //
    //         const user = await authService.getUser(workOsUserId);
    //         if (!user) {
    //             return c.json({ error: 'Not authenticated' }, 401);
    //         }
    //
    // 		// Cache the result in KV for 5 minutes (300 seconds)
    // 		try {
    // 			await c.env.KV.put(cacheKey, user.email, {
    // 				expirationTtl: 300 // 5 minutes
    // 			});
    // 		} catch (kvError) {
    // 			console.warn('KV cache write failed, continuing without caching:', kvError);
    // 		}
    //
    // 		// Set the user ID in the context
    // 		c.set('userEmail', user.email);
    // 		await next();
    // 	} catch (error) {
    // 		console.error('JWT verification failed:', error);
    // 		return c.json({ error: 'Invalid or expired token' }, 401);
    // 	}
    // })
    // .use('*', async (c, next) => {
    //     const a = await auth(c.env).handler(c.req.raw);
    //     console.log('asa', a)
    //     await next();
    // })
    // .on(['GET', 'POST'], '/*', (c) => {
    //     return auth(c.env).handler(c.req.raw);
    // })
    // .get('/auth', (c)=>{
    //     return c.json({
    //         name: 'test'
    //     })
    // })
    .on(["POST", "GET"], "/auth/*", (c) => auth(c.env).handler(c.req.raw))
    .use("*", async (c, next) => {
        const session = await auth(c.env).api.getSession({headers: c.req.raw.headers});
        if (!session) {
            return c.body(null, 401);
        }
        c.set("currentSession", session);
        return next();
    })
    .route('/', expensesApi)
    .route('/', categoriesApi)
    .route('/', categoryGroupsApi)
    .route('/notifications', notificationApi)
    .route('/vaults', vaultsApi)
    .route('/vault-members', vaultMembersApi)
    .route('/', templatesApi);

export const api = new Hono<App.Api>().route('/api', router);

api.get(
    '/openapi.json',
    openAPIRouteHandler(router, {
        documentation: {
            info: {
                title: 'DuitGee API',
                version: '1.0.0',
                description: 'DuitGee API',
            },
            servers: [
                {url: 'http://localhost:5173/api', description: 'Local Server'},
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT",
                    },
                },
            },
            security: [
                {
                    bearerAuth: [],
                },
            ],
        },
    })
);

api.get(
    '/scalar',
    Scalar({
        url: '/openapi.json',
        theme: 'purple',
        pageTitle: 'DuitGee API',
    })
)


async function hashSHA256(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);

    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
