import type {RequestIdVariables} from "hono/request-id";
import type {AuthService} from "$lib/server/auth-service.svelte";
import type {AuthenticateWithSessionCookieSuccessResponse} from "@workos-inc/node";
import type {User as AppUser} from "$lib/server/api/users/schema";
import type {UserVault} from "$lib/types";
import type {Category} from "$lib/server/api/categories/schema";
import type {CategoryData} from "$lib/configuration/categories";
import {PUBLIC_CATEGORIES_KEY} from "$lib/server/constants";

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
            currentUserVaults: UserVault[]
        }

        // interface Error {
        //     message: string,
        //     code: number,
        // }

        interface Api {
            Bindings: Cloudflare.Env,
            Variables: RequestIdVariables & {
                userEmail: string
                [PUBLIC_CATEGORIES_KEY]: CategoryData
            }
        }
    }

    namespace Client {
        interface SearchableSelectOption {
            id: string;
            name: string;
            icon: string|null;
            color: string|null;
            group: {
                name: string;
                color: string|null;
            }|null;
        }

        interface SearchableSelectProps {
            value?: string;
            placeholder?: string;
            options: Option[];
            disabled?: boolean;
            class?: string;
            name?: string;
            searchPlaceholder?: string;
            onSearch?: (term: string) => void;
            isLoading?: boolean;
        }
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
        KV: KVNamespace;
    }
}
interface Env extends Cloudflare.Env {}

export {};