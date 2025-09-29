import type {RequestIdVariables} from "hono/request-id";
import type {AuthService} from "$lib/server/auth-service.svelte";
import type {AuthenticateWithSessionCookieSuccessResponse} from "@workos-inc/node";
import type {User as AppUser} from "$lib/server/api/users/schema";
import type {GetUserVaultsResponse} from "$lib/types";

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
        interface Platform {
            env: Cloudflare.Env
            cf: CfProperties
            ctx: ExecutionContext
        }

        interface Locals {
            authService: AuthService,
            error: Error
            currentSession: AuthenticateWithSessionCookieSuccessResponse
            currentUser: AppUser
            isAdmin: boolean,
            currentUserVaults: GetUserVaultsResponse
        }

        // interface Error {
        //     message: string,
        //     code: number,
        // }

        interface Api {
            Bindings: Cloudflare.Env,
            Variables: RequestIdVariables & {
                userId: string
            }
        }
    }

    namespace Client {

    }
}

declare namespace Cloudflare {
    interface Env {
        DATABASE_URL: string;
        MY_VARIABLE: string;
        BASE_PATH: string;
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
        CLERK_SECRET_KEY: string;
        WORKOS_API_KEY: string;
        WORKOS_CLIENT_ID: string;
        WORKOS_COOKIE_PASSWORD: string;
        ADMIN_EMAILS: string;
        ASSETS: Fetcher;
        DB: D1Database;
    }
}
interface Env extends Cloudflare.Env {}

export {};