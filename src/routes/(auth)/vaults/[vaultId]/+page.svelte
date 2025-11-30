<script lang="ts">
	import {onMount} from "svelte";
    import {goto} from "$app/navigation";
    import {ofetch} from "ofetch";
    import type {VaultWithMember} from "$lib/schemas/read/vaultWithMember";
    import { Button } from "$lib/components/ui/button";
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";

    let { data } = $props();
    let { url, vaultId } = data;

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

    // Filter state
    let filterType = $state<'all' | 'today' | 'week' | 'month' | 'year' | 'custom'>('all');
    let customStartDate = $state('');
    let customEndDate = $state('');

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
                if (!customStartDate || !customEndDate) return {};
                return {
                    startDate: new Date(customStartDate).toISOString(),
                    endDate: new Date(customEndDate).toISOString()
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
        <!-- Minimal Header -->
        <div class="mb-6">
            <Button variant="ghost" onclick={handleBack} class="mb-4 -ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                </svg>
                Back to Vaults
            </Button>

            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div
                        class="text-3xl w-14 h-14 rounded-lg flex items-center justify-center"
                        style="background-color: {currentVault.vaults.color}20;"
                    >
                        {currentVault.vaults.icon || '🏦'}
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold">{currentVault.vaults.name}</h1>
                        {#if currentVault.vaults.description}
                            <p class="text-sm text-muted-foreground">{currentVault.vaults.description}</p>
                        {/if}
                    </div>
                </div>
                <div class="flex gap-2">
                    <Button variant="outline" onclick={toggleInviteForm}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                        </svg>
                        <span class="hidden sm:inline">Invite User</span>
                        <span class="sm:hidden">Invite</span>
                    </Button>
                    <Button onclick={handleCreateExpense}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                        </svg>
                        <span class="hidden sm:inline">Add Expense</span>
                        <span class="sm:hidden">Add</span>
                    </Button>
                </div>
            </div>
        </div>

        <!-- Filter Section -->
        <div class="mb-6 p-4 border rounded-lg bg-card">
            <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-medium">Filter</h3>
            </div>
            <div class="space-y-3">
                <!-- Preset Filters -->
                <div class="flex flex-wrap gap-2">
                    <button
                        class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors {filterType === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
                        onclick={() => { filterType = 'all'; handleFilterChange(); }}
                    >
                        All Time
                    </button>
                    <button
                        class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors {filterType === 'today' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
                        onclick={() => { filterType = 'today'; handleFilterChange(); }}
                    >
                        Today
                    </button>
                    <button
                        class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors {filterType === 'week' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
                        onclick={() => { filterType = 'week'; handleFilterChange(); }}
                    >
                        This Week
                    </button>
                    <button
                        class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors {filterType === 'month' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
                        onclick={() => { filterType = 'month'; handleFilterChange(); }}
                    >
                        This Month
                    </button>
                    <button
                        class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors {filterType === 'year' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
                        onclick={() => { filterType = 'year'; handleFilterChange(); }}
                    >
                        This Year
                    </button>
                    <button
                        class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors {filterType === 'custom' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
                        onclick={() => { filterType = 'custom'; }}
                    >
                        Custom Range
                    </button>
                </div>

                <!-- Custom Date Range -->
                {#if filterType === 'custom'}
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border rounded-lg bg-muted/50">
                        <div class="space-y-1.5">
                            <Label for="startDate" class="text-xs">Start Date & Time</Label>
                            <Input
                                id="startDate"
                                type="datetime-local"
                                bind:value={customStartDate}
                                class="h-9 text-sm"
                            />
                        </div>
                        <div class="space-y-1.5">
                            <Label for="endDate" class="text-xs">End Date & Time</Label>
                            <Input
                                id="endDate"
                                type="datetime-local"
                                bind:value={customEndDate}
                                class="h-9 text-sm"
                            />
                        </div>
                        <div class="md:col-span-2">
                            <Button onclick={handleFilterChange} size="sm" class="w-full md:w-auto">
                                Apply Filter
                            </Button>
                        </div>
                    </div>
                {/if}
            </div>
        </div>

        <!-- Statistics Section -->
        {#if !isLoadingStats && statistics}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <!-- Total Summary -->
                <Card>
                    <CardHeader class="pb-3">
                        <CardDescription>Total Expenses</CardDescription>
                        <CardTitle class="text-3xl">{formatCurrency(statistics.total.amount)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p class="text-sm text-muted-foreground">{statistics.total.count} expense{statistics.total.count !== 1 ? 's' : ''}</p>
                    </CardContent>
                </Card>
            </div>

            <!-- Expenses by Template -->
            {#if statistics.byTemplate.length > 0}
                <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-3">Expenses by Template</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {#each statistics.byTemplate as template}
                            <Card>
                                <CardHeader class="pb-3">
                                    <div class="flex items-center gap-2">
                                        <div class="text-2xl">{template.templateIcon}</div>
                                        <CardTitle class="text-base">{template.templateName}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div class="space-y-1">
                                        <div class="font-bold text-xl">{formatCurrency(template.totalAmount)}</div>
                                        <p class="text-sm text-muted-foreground">{template.count} expense{template.count !== 1 ? 's' : ''}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        {/each}
                    </div>
                </div>
            {/if}

            <!-- Expenses by Category and Member -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <!-- By Category -->
                {#if statistics.byCategory.length > 0}
                    <Card>
                        <CardHeader>
                            <CardTitle>By Category</CardTitle>
                            <CardDescription>Top spending categories</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div class="space-y-2">
                                {#each statistics.byCategory.slice(0, 5) as category}
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm font-medium">{category.categoryName}</span>
                                        <div class="text-right">
                                            <div class="font-semibold">{formatCurrency(category.totalAmount)}</div>
                                            <div class="text-xs text-muted-foreground">{category.count} item{category.count !== 1 ? 's' : ''}</div>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        </CardContent>
                    </Card>
                {/if}

                <!-- By Member -->
                {#if statistics.byMember.length > 0}
                    <Card>
                        <CardHeader>
                            <CardTitle>By Member</CardTitle>
                            <CardDescription>Expenses paid by each member</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div class="space-y-2">
                                {#each statistics.byMember as member}
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm font-medium">{member.displayName}</span>
                                        <div class="text-right">
                                            <div class="font-semibold">{formatCurrency(member.totalAmount)}</div>
                                            <div class="text-xs text-muted-foreground">{member.count} item{member.count !== 1 ? 's' : ''}</div>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        </CardContent>
                    </Card>
                {/if}
            </div>
        {/if}

        <!-- Invite User Form -->
        {#if showInviteForm}
            <Card class="mb-6">
                <CardHeader>
                    <CardTitle>Invite User to Vault</CardTitle>
                    <CardDescription>Send an invitation to collaborate on this vault</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onsubmit={(e) => { e.preventDefault(); handleInviteUser(); }} class="space-y-4">
                        <div class="space-y-2">
                            <Label for="inviteEmail">Email Address *</Label>
                            <Input
                                id="inviteEmail"
                                type="email"
                                bind:value={inviteEmail}
                                placeholder="user@example.com"
                                disabled={isInviting}
                                required
                            />
                        </div>

                        <div class="space-y-2">
                            <Label for="inviteRole">Role *</Label>
                            <select
                                id="inviteRole"
                                bind:value={inviteRole}
                                disabled={isInviting}
                                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                            </select>
                            <p class="text-xs text-muted-foreground">
                                Members can view and add expenses. Admins can also manage vault settings and invite users.
                            </p>
                        </div>

                        <div class="flex gap-3 pt-2">
                            <Button type="submit" disabled={isInviting} class="flex-1">
                                {#if isInviting}
                                    Sending...
                                {:else}
                                    Send Invitation
                                {/if}
                            </Button>
                            <Button type="button" variant="outline" onclick={toggleInviteForm} disabled={isInviting}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        {/if}

        <!-- Expenses Table -->
        <Card>
            <CardHeader>
                <CardTitle>Expenses</CardTitle>
                <CardDescription>
                    {#if filterType === 'all'}
                        All expenses in this vault
                    {:else if filterType === 'today'}
                        Expenses for today
                    {:else if filterType === 'week'}
                        Expenses for this week
                    {:else if filterType === 'month'}
                        Expenses for this month
                    {:else if filterType === 'year'}
                        Expenses for this year
                    {:else if filterType === 'custom'}
                        Expenses in selected date range
                    {/if}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {#if isLoadingExpenses}
                    <div class="flex justify-center py-8">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                {:else if expenses.length === 0}
                    <div class="text-center py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-muted-foreground mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                        </svg>
                        <p class="text-muted-foreground mb-4">No expenses yet</p>
                        <Button onclick={handleCreateExpense}>Create your first expense</Button>
                    </div>
                {:else}
                    <div class="space-y-3">
                        {#each expenses as expense (expense.id)}
                            <div class="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card">
                                <div class="flex items-start justify-between gap-4">
                                    <!-- Left section: Content -->
                                    <div class="flex-1 min-w-0">
                                        <!-- Amount and Date -->
                                        <div class="flex items-start justify-between gap-2 mb-2">
                                            <div class="text-2xl font-bold">
                                                {formatCurrency(expense.amount)}
                                            </div>
                                            <div class="text-sm text-muted-foreground whitespace-nowrap">
                                                {formatDate(expense.date)}
                                            </div>
                                        </div>

                                        <!-- Description -->
                                        <div class="font-medium mb-1 truncate">
                                            {expense.note || 'No description'}
                                        </div>

                                        <!-- Category and Paid By -->
                                        <div class="flex flex-wrap items-center gap-2 text-sm">
                                            {#if expense.category.name}
                                                <span class="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                                                    {expense.category.name}
                                                </span>
                                            {/if}
                                            {#if expense.paidBy}
                                                <span class="text-xs text-muted-foreground">
                                                    Paid by: {expense.paidByName}
                                                </span>
                                            {/if}
                                        </div>
                                    </div>

                                    <!-- Right section: Actions -->
                                    <div class="flex flex-col gap-1 flex-shrink-0">
                                        <button
                                            class="p-2 hover:bg-accent rounded-md transition-colors"
                                            onclick={() => handleEditExpense(expense.id)}
                                            aria-label="Edit expense"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                        </button>
                                        <button
                                            class="p-2 hover:bg-destructive/10 text-destructive rounded-md transition-colors"
                                            onclick={() => handleDeleteExpense(expense.id)}
                                            aria-label="Delete expense"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </CardContent>
        </Card>
    {/if}
</div>