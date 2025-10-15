import type {RequestIdVariables} from "hono/request-id";
import type {AuthService} from "$lib/server/auth-service.svelte";
import type {User as AppUser} from "$lib/server/api/users/schema";
import type {UserVault} from "$lib/types";
import type {CategoryData} from "$lib/configuration/categories";
import {PUBLIC_CATEGORIES_KEY} from "$lib/server/constants";


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
            currentSession: AuthSession
            currentUser: User
            isAdmin: boolean,
            currentUserVaults: UserVault[]
            isVaultLimitReach: boolean
        }

        // interface Error {
        //     message: string,
        //     code: number,
        // }

        interface Api {
            Bindings: Cloudflare.Env,
            Variables: RequestIdVariables & {
                currentSession: AuthSession
                [PUBLIC_CATEGORIES_KEY]: CategoryData
            }
        }

        interface AuthSession {
            user:User
            session:Session
        }

        interface User {
            id: string
            createdAt: Date
            updatedAt: Date
            email: string
            emailVerified: boolean
            name: string
            role: string
            image?: string | null | undefined
            banned: boolean,
            banReason: string | null | undefined,
            banExpires: string | null | undefined,
        }

        interface Session {
            id: string
            createdAt: Date
            updatedAt: Date
            userId: string
            expiresAt: Date
            token: string
            ipAddress?: string | null | undefined
            userAgent?: string | null | undefined
            activeOrganizationId: string,
            activeTeamId: string,
            impersonatedBy: null,
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

export {};