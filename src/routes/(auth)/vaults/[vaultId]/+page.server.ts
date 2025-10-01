import {error} from '@sveltejs/kit';
import type { PageServerLoad } from "./$types";
import {getUserVaults, getVault} from "$lib/server/api/vaults/handlers";
import {getExpenses, getExpensesSummary, getMemberSpending} from "$lib/server/api/expenses/handlers";

export const load: PageServerLoad = async ({ locals, platform, url, cookies, params }) => {
    if(platform === undefined){
        throw new Error("No platform")
    }
    const { vaultId } = params;

    if (!locals.currentUser) {
        throw error(401, 'Unauthorized');
    }

    try {
        // Get time period from URL params
        const timePeriod = url.searchParams.get('period') || 'daily';
        const memberIdsParam = url.searchParams.get('memberIds');
        const memberIds = memberIdsParam ? memberIdsParam.split(',') : undefined;

        // Calculate date range based on time period
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
                // No date filtering for "All Time"
                startDate = undefined;
                endDate = undefined;
                break;
            default:
                // Default to daily
                const defaultStartOfDay = new Date(now);
                defaultStartOfDay.setHours(0, 0, 0, 0);
                const defaultEndOfDay = new Date(now);
                defaultEndOfDay.setHours(23, 59, 59, 999);
                startDate = defaultStartOfDay.toISOString();
                endDate = defaultEndOfDay.toISOString();
        }

        // Get user's available vaults
        const userVaults = await getUserVaults(locals.currentUser.id, platform?.env?.DB);

        // Find the current vault and user's role
        const currentVaultData = userVaults.find(v => v.vault.id === vaultId);

        if (!currentVaultData) {
            throw error(404, 'Vault not found or access denied');
        }

        const abc = await getVault(locals.currentUser.id, vaultId, platform?.env?.DB);

        // Format vaults for the store
        const availableVaults = userVaults.map(v => ({
            id: v.vault.id,
            name: v.vault.name,
            description: v.vault.description,
            color: v.vault.color,
            icon: v.vault.icon,
            iconType: v.vault.iconType as 'emoji' | 'phosphor',
            isPersonal: v.vault.isPersonal,
            role: v.vault.ownerId === locals.currentUser.id ? 'owner' : v.membership?.role as 'admin' | 'member'| 'owner',
            owner: v.owner,
            membership: v.membership,
        }));

        const currentVault = {
            id: currentVaultData.vault.id,
            name: currentVaultData.vault.name,
            description: currentVaultData.vault.description,
            color: currentVaultData.vault.color,
            icon: currentVaultData.vault.icon,
            iconType: currentVaultData.vault.iconType as 'emoji' | 'phosphor',
            isPersonal: currentVaultData.vault.isPersonal,
            role: currentVaultData.vault.ownerId === locals.currentUser.id ? 'owner' : currentVaultData.membership?.role as 'admin' | 'member'| 'owner',
            owner: currentVaultData.owner,
            membership: currentVaultData.membership,
            members: abc.members,
        };

        // Load dashboard stats data
        const [expensesResult, summaryResult, memberSpendingResult] = await Promise.all([
            getExpenses(locals.currentUser.id, platform.env.DB, {
                vaultId,
                startDate,
                endDate,
                memberIds,
                limit: 5
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
        console.log('expensesResult', expensesResult);
        console.log('summaryResult', summaryResult);
        console.log('memberSpendingResult', memberSpendingResult);

        return {
            currentVault,
            availableVaults,
            vaultId,
            url: url.pathname,
            currentPeriod: timePeriod,
            stats: {
                totalExpenses: expensesResult.pagination.total,
                totalAmount: summaryResult.totalAmount,
                avgAmount: expensesResult.pagination.total > 0 ? summaryResult.totalAmount / expensesResult.pagination.total : 0,
                recentExpenses: expensesResult.expenses,
                memberSpending: memberSpendingResult
            }
        };
    } catch (err) {
        console.error('Error loading vault data:', err);
        throw error(500, 'Failed to load vault data');
    }
};