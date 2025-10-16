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
import {openAPIRouteHandler} from 'hono-openapi'
import {Scalar} from "@scalar/hono-api-reference";
import {auth} from "$lib/server/better-auth";
import {adminVaultsApi} from "$lib/server/api/admin/vaults/adminVaults";
import {adminOrganizationApi} from "$lib/server/api/admin/organizations/adminOrganization";

const router = new Hono<App.Api>()
    .use('*', trimTrailingSlash())
    .use(logger())
    .use('*', prettyJSON())
    .on(["POST", "GET"], "/auth/*", (c) => auth(c.env).handler(c.req.raw))
    .use("*", async (c, next) => {
        const session = await auth(c.env).api.getSession({headers: c.req.raw.headers});
        if (!session) {
            return c.body(null, 401);
        }
        c.set("currentSession", session);
        console.log({
            message: `[Set Session] ${session}`,
            session
        })
        return next();
    })
    .route('/', expensesApi)
    .route('/', categoriesApi)
    .route('/', categoryGroupsApi)
    .route('/notifications', notificationApi)
    .route('/vaults', vaultsApi)
    .route('/admin/vaults', adminVaultsApi)
    .route('/admin/organizations', adminOrganizationApi)
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
