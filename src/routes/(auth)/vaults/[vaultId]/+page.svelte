<script lang="ts">
	import {onMount} from "svelte";
    import {goto} from "$app/navigation";
    import { useSearchParams } from "runed/kit";
    import {ofetch} from "ofetch";
    import type {VaultWithMember} from "$lib/schemas/read/vaultWithMember";
    import { Button } from "$lib/components/ui/button";
    import { Card, CardContent } from "$lib/components/ui/card";
    import {filterSchema} from "./schemas";
    import VaultHeader from "./VaultHeader.svelte";
    import ExpenseFilters from "./ExpenseFilters.svelte";
    import VaultStatistics from "./VaultStatistics.svelte";
    import ExpenseList from "./ExpenseList.svelte";
    import InviteForm from "./InviteForm.svelte";

    let { data } = $props();
    let { url, vaultId } = data;

    // Initialize filter from URL query params, default to 'today'
    const params = useSearchParams(filterSchema);

    type Expense = {
        id: string;
        vaultId: string;
        note: string | null;
        amount: number;
        category: {
            name: string;
            description: string;
            icon: string;
            iconType: string;
            color: string;
            isPublic: boolean,
            group: string;
        }
        paidBy: string | null;
        paidByName: string | null;
        date: string;
        createdAt: string | null;
        createdBy: string;
        updatedAt: string | null;
        updatedBy: string | null;
        deletedAt: string | null;
        deletedBy: string | null;
    };

    type VaultStatistics = {
        total: {
            amount: number;
            count: number;
        };
        byTemplate: Array<{
            templateId: string | null;
            templateName: string;
            templateIcon: string;
            totalAmount: number;
            count: number;
        }>;
        byCategory: Array<{
            categoryName: string;
            totalAmount: number;
            count: number;
        }>;
        byMember: Array<{
            userId: string | null;
            displayName: string;
            totalAmount: number;
            count: number;
        }>;
    };

    let currentVault = $state<VaultWithMember>();
    let expenses = $state<Expense[]>([]);
    let statistics = $state<VaultStatistics | null>(null);
    let isLoadingVault = $state(true);
    let isLoadingExpenses = $state(true);
    let isLoadingStats = $state(true);
    let showInviteForm = $state(false);
    let inviteEmail = $state('');
    let inviteRole = $state<'admin' | 'member'>('member');
    let isInviting = $state(false);

    // Filter state - derived from URL query params
    let filterType = $derived(params.filter);

    function getDateRange(): { startDate?: string; endDate?: string } {
        const now = new Date();

        switch (filterType) {
            case 'all':
                return {};

            case 'today': {
                const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
                const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
                return {
                    startDate: start.toISOString(),
                    endDate: end.toISOString()
                };
            }

            case 'week': {
                const dayOfWeek = now.getDay();
                const start = new Date(now);
                start.setDate(now.getDate() - dayOfWeek);
                start.setHours(0, 0, 0, 0);

                const end = new Date(start);
                end.setDate(start.getDate() + 6);
                end.setHours(23, 59, 59, 999);

                return {
                    startDate: start.toISOString(),
                    endDate: end.toISOString()
                };
            }

            case 'month': {
                const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
                const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                return {
                    startDate: start.toISOString(),
                    endDate: end.toISOString()
                };
            }

            case 'year': {
                const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
                const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
                return {
                    startDate: start.toISOString(),
                    endDate: end.toISOString()
                };
            }

            case 'custom': {
                if (!params.startDate || !params.endDate) return {};
                return {
                    startDate: new Date(params.startDate).toISOString(),
                    endDate: new Date(params.endDate).toISOString()
                };
            }

            default:
                return {};
        }
    }

    async function loadExpenses() {
        isLoadingExpenses = true;
        try {
            const dateRange = getDateRange();
            const params = new URLSearchParams({
                vaultId,
                page: '1',
                limit: '50'
            });

            if (dateRange.startDate) params.append('startDate', dateRange.startDate);
            if (dateRange.endDate) params.append('endDate', dateRange.endDate);

            const response = await ofetch<{expenses: Expense[], pagination: any}>(`/api/getExpenses?${params.toString()}`);
            expenses = response.expenses || [];
        } catch (error) {
            console.error('Failed to fetch expenses:', error);
        } finally {
            isLoadingExpenses = false;
        }
    }

    async function loadStatistics() {
        isLoadingStats = true;
        try {
            const dateRange = getDateRange();
            const params = new URLSearchParams({ vaultId });

            if (dateRange.startDate) params.append('startDate', dateRange.startDate);
            if (dateRange.endDate) params.append('endDate', dateRange.endDate);

            const response = await ofetch<{success: boolean, data: VaultStatistics}>(`/api/getVaultStatistics?${params.toString()}`);
            statistics = response.data;
        } catch (error) {
            console.error('Failed to fetch statistics:', error);
        } finally {
            isLoadingStats = false;
        }
    }

    async function handleFilterChange() {
        await Promise.all([
            loadExpenses(),
            loadStatistics()
        ]);
    }

    onMount(async()=>{
        // Load vault data
        try {
            const response = await ofetch<{success: boolean, data: VaultWithMember}>(`/api/getVault?vaultId=${vaultId}`);
            currentVault = response.data;
        } catch (error) {
            console.error('Failed to fetch vault:', error);
        } finally {
            isLoadingVault = false;
        }

        // Load expenses and statistics
        await Promise.all([
            loadExpenses(),
            loadStatistics()
        ]);
    });

    function handleCreateExpense() {
        goto(`/vaults/${vaultId}/expenses/new`);
    }

    function handleEditExpense(expenseId: string) {
        goto(`/vaults/${vaultId}/expenses/${expenseId}/edit`);
    }

    async function handleDeleteExpense(expenseId: string) {
        if (!confirm('Are you sure you want to delete this expense?')) return;

        try {
            await ofetch('/api/deleteExpense', {
                method: 'POST',
                body: JSON.stringify({ id: expenseId, vaultId }),
                headers: { 'Content-Type': 'application/json' }
            });

            // Refresh expenses and statistics with current filter
            await Promise.all([
                loadExpenses(),
                loadStatistics()
            ]);
        } catch (error) {
            console.error('Failed to delete expense:', error);
            alert('Failed to delete expense. Please try again.');
        }
    }

    function handleBack() {
        goto('/vaults');
    }

    function formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function toggleInviteForm() {
        showInviteForm = !showInviteForm;
        if (!showInviteForm) {
            // Reset form when closing
            inviteEmail = '';
            inviteRole = 'member';
        }
    }

    async function handleInviteUser() {
        if (!inviteEmail.trim()) {
            alert('Please enter an email address');
            return;
        }

        isInviting = true;

        try {
            const response = await ofetch('/api/createInvitation', {
                method: 'POST',
                body: {
                    vaultId,
                    inviteeEmail: inviteEmail.trim(),
                    role: inviteRole
                },
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.success) {
                alert(`Invitation sent to ${inviteEmail}`);
                // Reset form
                inviteEmail = '';
                inviteRole = 'member';
                showInviteForm = false;
            } else {
                throw new Error(response.error || 'Failed to send invitation');
            }
        } catch (error: any) {
            console.error('Failed to invite user:', error);
            const errorMessage = error?.data?.error || error?.message || 'Failed to send invitation. Please try again.';
            alert(errorMessage);
        } finally {
            isInviting = false;
        }
    }

    async function handleSetDefaultVault() {
        try {
            await ofetch('/api/setDefaultVault', {
                method: 'POST',
                body: JSON.stringify({ vaultId }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Reload vault data to update isDefault status
            // await loadVault();
        } catch (error) {
            console.error('Failed to set default vault:', error);
            alert('Failed to set default vault. Please try again.');
        }
    }

</script>

<svelte:head>
	<title>{currentVault?.vaults.name || 'Vault'} - DuitGee</title>
</svelte:head>

<div class="container mx-auto py-8 px-4 max-w-7xl">
    {#if isLoadingVault}
        <!-- Loading State -->
        <div class="flex flex-col items-center justify-center py-16">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p class="mt-4 text-muted-foreground">Loading vault...</p>
        </div>
    {:else if !currentVault}
        <!-- Error State -->
        <Card class="border-destructive">
            <CardContent class="flex flex-col items-center justify-center py-16 px-4">
                <div class="rounded-full bg-destructive/10 p-6 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 class="text-2xl font-semibold mb-2">Vault not found</h2>
                <p class="text-muted-foreground text-center max-w-md mb-6">
                    The vault you're looking for doesn't exist or you don't have access to it.
                </p>
                <Button onclick={handleBack}>
                    Back to Vaults
                </Button>
            </CardContent>
        </Card>
    {:else}
        <!-- Vault Header -->
        <VaultHeader
            vault={currentVault}
            onSetDefaultVault={handleSetDefaultVault}
            onToggleInviteForm={toggleInviteForm}
            onCreateExpense={handleCreateExpense}
        />

        <!-- Expense Filters -->
        <ExpenseFilters
            filterType={filterType}
            startDate={params.startDate}
            endDate={params.endDate}
            onFilterChange={(filter) => { params.filter = filter; handleFilterChange(); }}
            onApplyCustomFilter={handleFilterChange}
            onStartDateChange={(value) => params.startDate = value}
            onEndDateChange={(value) => params.endDate = value}
        />

        <!-- Vault Statistics -->
        <VaultStatistics
            statistics={statistics}
            isLoading={isLoadingStats}
            formatCurrency={formatCurrency}
        />

        <!-- Invite User Form -->
        <InviteForm
            show={showInviteForm}
            email={inviteEmail}
            role={inviteRole}
            isInviting={isInviting}
            onEmailChange={(value) => inviteEmail = value}
            onRoleChange={(role) => inviteRole = role}
            onSubmit={handleInviteUser}
            onCancel={toggleInviteForm}
        />

        <!-- Expenses List -->
        <ExpenseList
            expenses={expenses}
            isLoading={isLoadingExpenses}
            filterType={filterType}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
            onCreateExpense={handleCreateExpense}
        />
    {/if}
</div>