import {error} from '@sveltejs/kit';
import type { PageServerLoad } from "./$types";
import {getExpenses} from "$lib/server/api/expenses/handlers";
import {getCategories} from "$lib/server/api/categories/handlers";
import {getVault} from "$lib/server/api/vaults/handlers";


export const load: PageServerLoad = async ({ locals, platform, url, cookies, params }) => {
    if(platform === undefined){
        throw new Error("No platform")
    }

    const { vaultId } = params;

    try {
        // Get time period from URL params
        const timePeriod = url.searchParams.get('period') || 'daily';
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '50');

        // Calculate date range based on time period
        const now = new Date();
        let startDate: string | undefined;
        let endDate: string | undefined;

        switch (timePeriod) {
            case 'daily':
                const startOfDay = new Date(now);
                startOfDay.setHours(0, 0, 0, 0);
                startDate = startOfDay.toISOString();
                endDate = now.toISOString();
                break;
            case 'weekly':
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                startOfWeek.setHours(0, 0, 0, 0);
                startDate = startOfWeek.toISOString();
                endDate = now.toISOString();
                break;
            case 'monthly':
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                startDate = startOfMonth.toISOString();
                endDate = now.toISOString();
                break;
            case 'yearly':
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                startDate = startOfYear.toISOString();
                endDate = now.toISOString();
                break;
            case 'all':
                // No date filtering for "All Time"
                startDate = undefined;
                endDate = undefined;
                break;
            default:
                // Default to daily for unknown periods
                const defaultStartOfDay = new Date(now);
                defaultStartOfDay.setHours(0, 0, 0, 0);
                startDate = defaultStartOfDay.toISOString();
                endDate = now.toISOString();
        }

        const expenses = await getExpenses(locals.currentUser.id, platform.env.DB, {
            page,
            limit,
            startDate,
            endDate,
            vaultId
        });

        const vault = await getVault(locals.currentUser.id, vaultId, platform.env.DB);
        const categories = await getCategories(vault.vault.id, platform.env.DB);

        return {
            activeUser: locals.currentUser,
            vaultId,
            expenses,
            categories,
            currentPeriod: timePeriod
        };
    } catch (err) {
        console.warn("[expenses.route] error on expense route", err);
        throw error(500, 'Failed to load category');
    }
};