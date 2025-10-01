<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { page, navigating } from '$app/state';
	import { useVaultStore } from '$lib/stores/vault.svelte.js';
	import { authManager } from '$lib/stores/current-session.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import AlertDialog from '$lib/components/ui/AlertDialog.svelte';
	import IconDisplay from '$lib/components/IconDisplay.svelte';
	import { Plus, Receipt, Tag, TrendUp, Calendar, Vault, Users, Gear, Lock, Globe, Pencil, Trash } from 'phosphor-svelte';
    import {goto} from "$app/navigation";
	import type { Expense } from '$lib/types/expenses';

	let { data } = $props();

	// Delete dialog state
	let showDeleteDialog = $state(false);
	let expenseToDelete = $state<string | null>(null);

	// const vaultStore = useVaultStore();

	let stats = $state({
		totalExpenses: 0,
		totalAmount: 0,
		avgAmount: 0,
		recentExpenses: [] as Expense[],
		memberSpending: [] as Array<{
			userId: string;
			userName: string;
			totalAmount: number;
			expenseCount: number;
		}>
	});

	// Time period management
	const timePeriods = [
		{ id: 'daily', label: 'Today', icon: '📅' },
		{ id: 'weekly', label: 'This Week', icon: '📊' },
		{ id: 'monthly', label: 'This Month', icon: '📈' },
		{ id: 'yearly', label: 'This Year', icon: '📆' },
		{ id: 'all', label: 'All Time', icon: '🌍' }
	];

	// Get period from URL or default to daily
	let currentPeriod = $state(page.url.searchParams.get('period') || 'daily');

	// Get member filter from URL
	let selectedMemberIds = $state<string[]>(page.url.searchParams.get('memberIds')?.split(',').filter(Boolean) || []);

	// Track loading state for stats API calls
	let isLoading = $state(false);

	// Track if stats have been loaded to prevent duplicate calls
	let statsLoaded = $state(false);

	// Get all vault members (owner + active members)
	let allMembers = $derived.by(() => {
		if (!data.currentVault) return [];

		const members = [];
		// Add owner
		if (data.currentVault.owner) {
			members.push({
				id: data.currentVault.owner.id,
				name: data.currentVault.owner.firstName && data.currentVault.owner.lastName
					? `${data.currentVault.owner.firstName} ${data.currentVault.owner.lastName}`
					: data.currentVault.owner.email,
				email: data.currentVault.owner.email,
				isOwner: true
			});
		}
		// Add active members
		if (data.currentVault.members) {
			data.currentVault.members.forEach(member => {
				if (member.status === 'active' && member.user) {
					members.push({
						id: member.user.id,
						name: member.user.firstName && member.user.lastName
							? `${member.user.firstName} ${member.user.lastName}`
							: member.user.email,
						email: member.user.email,
						isOwner: false
					});
				}
			});
		}
		return members;
	});

	// Single effect to handle both URL changes and initial load
	$effect(() => {
		// React to URL changes - access the URL to create dependency
		const url = page.url;
		const urlPeriod = url.searchParams.get('period') || 'daily';
		const urlMemberIds = url.searchParams.get('memberIds')?.split(',').filter(Boolean) || [];

		// Use untrack to read current state without creating dependency
		untrack(() => {
			console.log('[effect] triggered - urlPeriod:', urlPeriod, 'currentPeriod:', currentPeriod);
			console.log('[effect] triggered - urlMemberIds:', urlMemberIds, 'selectedMemberIds:', selectedMemberIds);
			console.log('[effect] statsLoaded:', statsLoaded);

			// Only update and reload if period or member filter actually changed or first load
			const periodChanged = urlPeriod !== currentPeriod;
			const membersChanged = JSON.stringify(urlMemberIds.sort()) !== JSON.stringify(selectedMemberIds.sort());

			if (periodChanged || membersChanged || !statsLoaded) {
				console.log('[effect] loading stats - periodChanged:', periodChanged, 'membersChanged:', membersChanged, 'statsLoaded:', statsLoaded);
				currentPeriod = urlPeriod;
				selectedMemberIds = urlMemberIds;
				loadVaultStats();
				statsLoaded = true;
			}
		});
	});

	// Calculate date range based on time period
	function calculateDateRange(period: string) {
		const now = new Date();
		let startDate: string | undefined;
		let endDate: string | undefined;

		switch (period) {
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

		return { startDate, endDate };
	}

	async function loadVaultStats() {
		isLoading = true;
		try {
			// Get date range for current period
			const { startDate, endDate } = calculateDateRange(currentPeriod);

			console.log('[loadVaultStats] currentPeriod:', currentPeriod);
			console.log('[loadVaultStats] startDate:', startDate);
			console.log('[loadVaultStats] endDate:', endDate);
			console.log('[loadVaultStats] selectedMemberIds:', selectedMemberIds);

			// Build query parameters
			const queryParams = new URLSearchParams();
			if (startDate && endDate) {
				queryParams.set('startDate', startDate);
				queryParams.set('endDate', endDate);
			}
			if (selectedMemberIds.length > 0) {
				queryParams.set('memberIds', selectedMemberIds.join(','));
			}

			console.log('[loadVaultStats] queryParams:', queryParams.toString());

			// Make parallel API calls for better performance
			const [summaryResponse, expensesResponse, memberStatsResponse] = await Promise.all([
				// Get summary statistics
				fetch(`/api/expenses/vaults/${data.vaultId}/expenses/stats/summary?${queryParams}`, {
					headers: { 'Authorization': `Bearer ${authManager.authState?.accessToken}` }
				}),
				// Get recent expenses with pagination info (contains total count)
				fetch(`/api/expenses/vaults/${data.vaultId}/expenses?limit=5&${queryParams}`, {
					headers: { 'Authorization': `Bearer ${authManager.authState?.accessToken}` }
				}),
				// Get member spending stats
				fetch(`/api/expenses/vaults/${data.vaultId}/expenses/stats/members?${queryParams}`, {
					headers: { 'Authorization': `Bearer ${authManager.authState?.accessToken}` }
				})
			]);

			// Process summary data
			if (summaryResponse.ok) {
				const summaryResult = await summaryResponse.json();
				stats.totalAmount = summaryResult.totalAmount || 0;
			}

			// Process expenses data (contains both expenses and count)
			if (expensesResponse.ok) {
				const expensesResult = await expensesResponse.json();
				stats.recentExpenses = expensesResult.expenses || [];
				stats.totalExpenses = expensesResult.pagination?.total || 0;
				stats.avgAmount = stats.totalExpenses > 0 ? stats.totalAmount / stats.totalExpenses : 0;
			}

			// Process member spending data
			if (memberStatsResponse.ok) {
				const memberStatsResult = await memberStatsResponse.json();
				stats.memberSpending = memberStatsResult || [];
			}

		} catch (error) {
			console.error('Failed to load vault stats:', error);
		} finally {
			isLoading = false;
		}
	}

	function switchPeriod(period: string) {
		console.log('[switchPeriod] switching to period:', period, 'current:', currentPeriod);
		if (period === currentPeriod) {
			console.log('[switchPeriod] same period, skipping');
			return; // Don't reload if same period
		}

		const newUrl = new URL(page.url);
		newUrl.searchParams.set('period', period);
		console.log('[switchPeriod] navigating to:', newUrl.pathname + newUrl.search);
		goto(newUrl.pathname + newUrl.search);
	}

	function toggleMemberFilter(memberId: string) {
		const newUrl = new URL(page.url);
		let newSelectedIds: string[];

		if (selectedMemberIds.includes(memberId)) {
			// Remove member
			newSelectedIds = selectedMemberIds.filter(id => id !== memberId);
		} else {
			// Add member
			newSelectedIds = [...selectedMemberIds, memberId];
		}

		if (newSelectedIds.length > 0) {
			newUrl.searchParams.set('memberIds', newSelectedIds.join(','));
		} else {
			newUrl.searchParams.delete('memberIds');
		}

		goto(newUrl.pathname + newUrl.search);
	}

	function clearMemberFilter() {
		const newUrl = new URL(page.url);
		newUrl.searchParams.delete('memberIds');
		goto(newUrl.pathname + newUrl.search);
	}

	function confirmDeleteExpense(expenseId: string) {
		expenseToDelete = expenseId;
		showDeleteDialog = true;
	}

	async function deleteExpense() {
		if (!expenseToDelete) return;

		try {
			const response = await fetch(`/api/expenses/vaults/${data.vaultId}/expenses/${expenseToDelete}`, {
				method: 'DELETE',
				headers: { 'Authorization': `Bearer ${authManager.authState?.accessToken}` }
			});

			if (response.ok) {
				showDeleteDialog = false;
				expenseToDelete = null;
				// Reload the expenses list
				await loadVaultStats();
			} else {
				const error = await response.json();
				alert(`Failed to delete expense: ${error.error || 'Unknown error'}`);
			}
		} catch (error) {
			console.error('Failed to delete expense:', error);
			alert('Failed to delete expense. Please try again.');
		}
	}

	function getPeriodLabel(period: string) {
		const now = new Date();
		switch (period) {
			case 'daily':
				return `Today (${now.toLocaleDateString()})`;
			case 'weekly':
				const startOfWeek = new Date(now);
				startOfWeek.setDate(now.getDate() - now.getDay());
				const endOfWeek = new Date(startOfWeek);
				endOfWeek.setDate(startOfWeek.getDate() + 6);
				return `This Week (${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()})`;
			case 'monthly':
				return `${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
			case 'yearly':
				return `${now.getFullYear()}`;
			case 'all':
				return 'All Time';
			default:
				return 'All Time';
		}
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-MY', {
			style: 'currency',
			currency: 'MYR'
		}).format(amount);
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-MY', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	let canCreateExpenses = $derived.by(() =>{
        return data.currentVault?.role === 'owner' ||
            data.currentVault?.role === 'admin' ||
            data.currentVault?.role === 'member';
    })

    let canManageCategories= $derived.by(() =>{
        return data.currentVault?.role === 'owner' ||
            data.currentVault?.role === 'admin';
    })
</script>

<svelte:head>
	<title>{data.currentVault?.name ? `${data.currentVault.name} - ` : ''}Dashboard - DuitGee</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 theme-transition">
	<!-- Time Period Selector -->
	<div class="mb-6">
		<!-- Mobile Dropdown -->
		<div class="sm:hidden">
			<label for="period-select" class="sr-only">Select time period</label>
			<select
				value={currentPeriod}
				onchange={(e) => switchPeriod(e.target.value)}
				disabled={isLoading}
				class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
			>
				{#each timePeriods as period}
					<option value={period.id}>
						{period.icon} {period.label}
					</option>
				{/each}
			</select>
		</div>

		<!-- Desktop Tabs -->
		<div class="hidden sm:block">
			<div class="border-b border-border">
				<nav class="-mb-px flex space-x-8">
					{#each timePeriods as period}
						<button
							onclick={() => {
								console.log('[tab click] period.id:', period.id, 'period.label:', period.label);
								switchPeriod(period.id);
							}}
							disabled={isLoading}
							class="py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 relative {
								currentPeriod === period.id
									? 'border-primary text-primary'
									: 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
							} {isLoading ? 'opacity-50 cursor-not-allowed' : ''}"
						>
							{#if isLoading && currentPeriod === period.id}
								<div class="absolute inset-0 flex items-center justify-center">
									<div class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
								</div>
								<span class="invisible">
									<span class="mr-2">{period.icon}</span>
									{period.label}
								</span>
							{:else}
								<span class="mr-2">{period.icon}</span>
								{period.label}
							{/if}
						</button>
					{/each}
				</nav>
			</div>
		</div>
	</div>

	<!-- Member Filter -->
	{#if allMembers.length > 1}
		<div class="mb-6">
			<div class="flex items-center justify-between mb-3">
				<h3 class="text-sm font-medium text-foreground">Filter by Member</h3>
				{#if selectedMemberIds.length > 0}
					<Button variant="ghost" size="sm" onclick={clearMemberFilter} class="h-7 text-xs">
						Clear
					</Button>
				{/if}
			</div>
			<div class="flex flex-wrap gap-2">
				{#each allMembers as member}
					<button
						onclick={() => toggleMemberFilter(member.id)}
						disabled={isLoading}
						class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all {
							selectedMemberIds.includes(member.id)
								? 'bg-primary text-primary-foreground'
								: 'bg-muted text-muted-foreground hover:bg-muted/80'
						} {isLoading ? 'opacity-50 cursor-not-allowed' : ''}"
					>
						<span class="truncate max-w-[200px]">{member.name}</span>
						{#if member.isOwner}
							<span class="text-xs opacity-70">(Owner)</span>
						{/if}
					</button>
				{/each}
			</div>
			{#if selectedMemberIds.length > 0}
				<p class="text-xs text-muted-foreground mt-2">
					Showing expenses from {selectedMemberIds.length} {selectedMemberIds.length === 1 ? 'member' : 'members'}
				</p>
			{/if}
		</div>
	{/if}

	{#if isLoading}
		<div class="flex items-center justify-center py-12">
			<div class="flex items-center space-x-3 text-muted-foreground">
				<div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
				<span class="text-sm font-medium">Loading expenses...</span>
			</div>
		</div>
	{:else}
		<!-- Period Summary Header -->
		<div class="bg-gradient-to-r from-primary to-accent rounded-lg p-4 sm:p-6 mb-6 text-primary-foreground shadow-lg">
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h2 class="text-base sm:text-lg font-semibold">Expenses for {getPeriodLabel(currentPeriod)}</h2>
					<p class="text-primary-foreground/80 mt-1 text-sm">
						{stats.totalExpenses} {stats.totalExpenses === 1 ? 'expense' : 'expenses'}
					</p>
				</div>
				<div class="text-left sm:text-right">
					<p class="text-xl sm:text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
					<p class="text-primary-foreground/80 text-sm">Total spent</p>
				</div>
			</div>

			<!-- Member Spending Breakdown -->
			{#if stats.memberSpending.length > 0}
				<div class="mt-4 pt-4 border-t border-primary-foreground/20">
					<h3 class="text-sm font-medium mb-3 text-primary-foreground/90">Spending by Member</h3>
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
						{#each stats.memberSpending as member}
							<div class="bg-primary-foreground/10 rounded-lg p-3 backdrop-blur-sm border border-primary-foreground/20">
								<div class="flex justify-between items-start">
									<div class="min-w-0 flex-1">
										<p class="text-sm font-medium text-primary-foreground truncate">{member.userName}</p>
										<p class="text-xs text-primary-foreground/70 mt-0.5">{member.expenseCount} {member.expenseCount === 1 ? 'expense' : 'expenses'}</p>
									</div>
									<p class="text-sm font-semibold text-primary-foreground ml-2">{formatCurrency(member.totalAmount)}</p>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Recent Expenses -->
		<!-- Recent Expenses -->
		<div class="bg-background shadow-card rounded-card border theme-transition mb-8">
			<div class="px-4 py-3 sm:px-6 sm:py-4">
				<div class="flex items-center justify-between mb-3">
					<h3 class="text-base font-medium text-foreground">Recent Expenses</h3>
					<Button variant="ghost" size="sm" onclick={() => goto(`/vaults/${data.vaultId}/expenses`) }>
						View All
					</Button>
				</div>

				{#if stats.recentExpenses.length === 0}
					<div class="text-center py-8">
						<Receipt class="mx-auto h-12 w-12 text-muted-foreground" />
						<h3 class="mt-2 text-sm font-medium text-foreground">No expenses yet</h3>
						<p class="mt-1 text-sm text-muted-foreground">Get started by creating your first expense.</p>
						{#if canCreateExpenses}
							<div class="mt-6">
								<Button variant="default" onclick={() => goto(`/vaults/${data.vaultId}/expenses/new`) }>
									<Plus class="w-4 h-4 mr-2" />
									Add Expense
								</Button>
							</div>
						{/if}
					</div>
				{:else}
					<div class="divide-y divide-border">
						{#each stats.recentExpenses as expense}
							<div class="py-2 hover:bg-accent/50 transition-colors">
								<!-- Desktop Layout -->
								<div class="hidden sm:flex items-center justify-between gap-3">
									<div class="flex items-center gap-2 flex-1 min-w-0">
										<div class="flex items-center gap-1.5 flex-shrink-0">
											<div class="w-3 h-3 rounded-full" style="background-color: {expense.category?.color}"></div>
											{#if expense.category?.icon}
												<IconDisplay icon={expense.category.icon} iconType={expense.category.iconType} size="xs" />
											{/if}
										</div>
										<div class="flex-1 min-w-0">
											<div class="flex items-center gap-2">
												<span class="text-sm font-medium text-foreground truncate">
													{expense.note || ''}
												</span>
												<span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground flex-shrink-0">
													{expense.category?.name}
												</span>
											</div>
											<div class="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
												<span>{formatDate(expense.date)}</span>
												{#if expense.creator}
													<span>•</span>
													<span class="truncate">by {expense.creator.firstName && expense.creator.lastName ? `${expense.creator.firstName} ${expense.creator.lastName} (${expense.creator.email})` : expense.creator.email}</span>
												{/if}
											</div>
										</div>
									</div>
									<div class="flex items-center gap-2 flex-shrink-0">
										<p class="text-sm font-semibold text-foreground">
											{formatCurrency(expense.amount)}
										</p>
										<Button
											variant="ghost"
											size="sm"
											onclick={() => goto(`/vaults/${data.vaultId}/expenses/${expense.id}/edit`)}
											class="h-7 w-7 p-0"
										>
											<Pencil class="w-3.5 h-3.5" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onclick={() => confirmDeleteExpense(expense.id)}
											class="h-7 w-7 p-0"
										>
											<Trash class="w-3.5 h-3.5 text-destructive" />
										</Button>
									</div>
								</div>

								<!-- Mobile Layout -->
								<div class="sm:hidden">
									<div class="flex items-start justify-between gap-2">
										<div class="flex items-start gap-2 flex-1 min-w-0">
											<div class="flex items-center gap-1 flex-shrink-0 mt-0.5">
												<div class="w-2.5 h-2.5 rounded-full" style="background-color: {expense.category?.color}"></div>
												{#if expense.category?.icon}
													<IconDisplay icon={expense.category.icon} iconType={expense.category.iconType} size="xs" />
												{/if}
											</div>
											<div class="flex-1 min-w-0">
												<h3 class="text-sm font-medium text-foreground truncate leading-tight">
													{expense.note || ''}
												</h3>
												<div class="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
													<span>{expense.category?.name}</span>
													<span>•</span>
													<span>{new Date(expense.date).toLocaleDateString()}</span>
												</div>
												{#if expense.creator}
													<div class="text-xs text-muted-foreground mt-0.5 truncate">
														by {expense.creator.firstName && expense.creator.lastName ? `${expense.creator.firstName} ${expense.creator.lastName} (${expense.creator.email})` : expense.creator.email}
													</div>
												{/if}
											</div>
										</div>
										<div class="flex items-center gap-1.5 flex-shrink-0">
											<p class="text-sm font-semibold text-foreground">
												{formatCurrency(expense.amount)}
											</p>
											<Button
												variant="ghost"
												size="sm"
												onclick={() => goto(`/vaults/${data.vaultId}/expenses/${expense.id}/edit`)}
												class="h-7 w-7 p-0"
											>
												<Pencil class="w-3 h-3" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onclick={() => confirmDeleteExpense(expense.id)}
												class="h-7 w-7 p-0"
											>
												<Trash class="w-3 h-3 text-destructive" />
											</Button>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<!-- Delete Confirmation Dialog -->
<AlertDialog
	bind:open={showDeleteDialog}
	title="Delete Expense"
	description="Are you sure you want to delete this expense? This action cannot be undone."
	confirmText="Delete"
	cancelText="Cancel"
	variant="destructive"
	onConfirm={deleteExpense}
/>