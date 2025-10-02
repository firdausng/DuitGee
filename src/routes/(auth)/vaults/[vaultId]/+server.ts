import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getExpenses, getExpensesSummary, getMemberSpending } from '$lib/server/api/expenses/handlers';

async function calculateDateRange(timePeriod: string) {
    const now = new Date();
    let startDate: string | undefined;
    let endDate: string | undefined;

    switch (timePeriod) {
        case 'daily':
            const startOfDay = new Date(now);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(now);
            endOfDay.setHours(23, 59, 59, 999);
            startDate = startOfDay.toISOString();
            endDate = endOfDay.toISOString();
            break;
        case 'weekly':
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            startDate = startOfWeek.toISOString();
            endDate = endOfWeek.toISOString();
            break;
        case 'monthly':
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endOfMonth.setHours(23, 59, 59, 999);
            startDate = startOfMonth.toISOString();
            endDate = endOfMonth.toISOString();
            break;
        case 'yearly':
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const endOfYear = new Date(now.getFullYear(), 11, 31);
            endOfYear.setHours(23, 59, 59, 999);
            startDate = startOfYear.toISOString();
            endDate = endOfYear.toISOString();
            break;
        case 'all':
            startDate = undefined;
            endDate = undefined;
            break;
        default:
            const defaultStartOfDay = new Date(now);
            defaultStartOfDay.setHours(0, 0, 0, 0);
            const defaultEndOfDay = new Date(now);
            defaultEndOfDay.setHours(23, 59, 59, 999);
            startDate = defaultStartOfDay.toISOString();
            endDate = defaultEndOfDay.toISOString();
    }

    return { startDate, endDate };
}

export const GET: RequestHandler = async ({ locals, platform, url, params }) => {
    if (!platform?.env?.DB) {
        throw error(500, 'Database not available');
    }

    if (!locals.currentUser) {
        throw error(401, 'Unauthorized');
    }

    const { vaultId } = params;
    const timePeriod = url.searchParams.get('period') || 'monthly';
    const memberIdsParam = url.searchParams.get('memberIds');
    const memberIds = memberIdsParam ? memberIdsParam.split(',') : undefined;
    const limit = parseInt(url.searchParams.get('limit') || '10');

    try {
        const { startDate, endDate } = await calculateDateRange(timePeriod);

        const [expensesResult, summaryResult, memberSpendingResult] = await Promise.all([
            getExpenses(locals.currentUser.id, platform.env.DB, {
                vaultId,
                startDate,
                endDate,
                memberIds,
                limit
            }),
            getExpensesSummary(locals.currentUser.id, platform.env.DB, {
                vaultId,
                startDate,
                endDate,
                memberIds
            }),
            getMemberSpending(locals.currentUser.id, platform.env.DB, {
                vaultId,
                startDate,
                endDate,
                memberIds
            })
        ]);

        const stats = {
            totalExpenses: expensesResult.pagination.total,
            totalAmount: summaryResult.totalAmount,
            avgAmount: expensesResult.pagination.total > 0 ? summaryResult.totalAmount / expensesResult.pagination.total : 0,
            recentExpenses: expensesResult.expenses,
            memberSpending: memberSpendingResult
        };

        return json({ stats });
    } catch (err) {
        console.error('Error loading stats:', err);
        throw error(500, 'Failed to load stats');
    }
};
