<script lang="ts">
	import { page, navigating } from '$app/state';
	import Button from '$lib/components/ui/Button.svelte';
	import AlertDialog from '$lib/components/ui/AlertDialog.svelte';
	import IconDisplay from '$lib/components/IconDisplay.svelte';
	import Plus from 'phosphor-svelte/lib/Plus';
	import Receipt from 'phosphor-svelte/lib/Receipt';
	import Pencil from 'phosphor-svelte/lib/Pencil';
	import Trash from 'phosphor-svelte/lib/Trash';
    import {goto, pushState } from "$app/navigation";
	import { fade, slide } from 'svelte/transition';
    import {ofetch} from "ofetch";
    import {onMount} from "svelte";

    type Period = 'daily' | 'yesterday' | 'weekly' | 'monthly' | 'yearly' | 'all';
    type TimePeriod = { id: Period, label: string, icon: string}

	let { data } = $props();
    console.log(data);

	// Delete dialog state
	let showDeleteDialog = $state(false);
	let expenseToDelete = $state<string | null>(null);

	// Time period management
	const timePeriods : TimePeriod[] = [
		{ id: 'daily', label: 'Today', icon: '📅' },
		{ id: 'yesterday', label: 'Yesterday', icon: '📆' },
		{ id: 'weekly', label: 'This Week', icon: '📊' },
		{ id: 'monthly', label: 'This Month', icon: '📈' },
		{ id: 'yearly', label: 'This Year', icon: '📆' },
		{ id: 'all', label: 'All Time', icon: '🌍' }
	];

	// Filter state
	let currentPeriod = $state<Period>(page.url.searchParams.get('period') as Period || 'daily');
	let selectedMemberIds = $state<string[]>(page.url.searchParams.get('memberIds')?.split(',').filter(Boolean) || []);
	let expenseLimit = $state<number>(parseInt(page.url.searchParams.get('limit') || '10'));
	let isLoadingStats = $state(false);
	let statsData = $state<any>();

    onMount(async ()=>{
        await fetchStats();
    })

	// Get all vault members (owner + active members) - without user details
	let allMembers = $derived.by(() => {
		if (!data.currentVault) return [];

		const members = [];
		// Add active members by userId only (no user details available)
		if (data.currentVault.members) {
			data.currentVault.members.forEach(member => {
				if (member.status === 'active' && member.userId) {
					members.push({
						id: member.userId,
						name: member.userId, // Use userId as fallback since we don't have user details
						email: '',
						isOwner: member.role === 'owner'
					});
				}
			});
		}
		return members;
	});

	// Generate consistent background color for each member
	function getMemberColor(userId: string): string {
		const colors = [
			'bg-blue-50 dark:bg-blue-950/20',
			'bg-green-50 dark:bg-green-950/20',
			'bg-purple-50 dark:bg-purple-950/20',
			'bg-orange-50 dark:bg-orange-950/20',
			'bg-pink-50 dark:bg-pink-950/20',
			'bg-cyan-50 dark:bg-cyan-950/20',
			'bg-yellow-50 dark:bg-yellow-950/20',
			'bg-indigo-50 dark:bg-indigo-950/20',
			'bg-red-50 dark:bg-red-950/20',
			'bg-teal-50 dark:bg-teal-950/20',
			'bg-lime-50 dark:bg-lime-950/20',
			'bg-violet-50 dark:bg-violet-950/20',
			'bg-fuchsia-50 dark:bg-fuchsia-950/20',
			'bg-rose-50 dark:bg-rose-950/20',
			'bg-sky-50 dark:bg-sky-950/20',
			'bg-emerald-50 dark:bg-emerald-950/20',
			'bg-amber-50 dark:bg-amber-950/20',
			'bg-slate-50 dark:bg-slate-950/20',
			'bg-zinc-50 dark:bg-zinc-950/20',
			'bg-stone-50 dark:bg-stone-950/20',
		];

		// Simple hash function to map user ID to color index
		let hash = 0;
		for (let i = 0; i < userId.length; i++) {
			hash = ((hash << 5) - hash) + userId.charCodeAt(i);
			hash = hash & hash;
		}
		return colors[Math.abs(hash) % colors.length];
	}

	// Calculate date range based on period in user's timezone
	function calculateDateRange(period: Period): { startDate?: string, endDate?: string } {
		const now = new Date();
		let startDate: Date | undefined;
		let endDate: Date | undefined;

		switch (period) {
			case 'daily':
				startDate = new Date(now);
				startDate.setHours(0, 0, 0, 0);
				endDate = new Date(now);
				endDate.setHours(23, 59, 59, 999);
				break;
			case 'yesterday':
				const yesterday = new Date(now);
				yesterday.setDate(now.getDate() - 1);
				startDate = new Date(yesterday);
				startDate.setHours(0, 0, 0, 0);
				endDate = new Date(yesterday);
				endDate.setHours(23, 59, 59, 999);
				break;
			case 'weekly':
				startDate = new Date(now);
				startDate.setDate(now.getDate() - now.getDay());
				startDate.setHours(0, 0, 0, 0);
				endDate = new Date(startDate);
				endDate.setDate(startDate.getDate() + 6);
				endDate.setHours(23, 59, 59, 999);
				break;
			case 'monthly':
				startDate = new Date(now.getFullYear(), now.getMonth(), 1);
				endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
				endDate.setHours(23, 59, 59, 999);
				break;
			case 'yearly':
				startDate = new Date(now.getFullYear(), 0, 1);
				endDate = new Date(now.getFullYear(), 11, 31);
				endDate.setHours(23, 59, 59, 999);
				break;
			case 'all':
				// No date filtering
				return {};
		}

		return {
			startDate: startDate?.toISOString(),
			endDate: endDate?.toISOString()
		};
	}

	// Fetch filtered stats from API
	async function fetchStats() {
		isLoadingStats = true;
		try {
			const { startDate, endDate } = calculateDateRange(currentPeriod);

			const params = new URLSearchParams({
				limit: expenseLimit.toString()
			});

			if (startDate) params.set('startDate', startDate);
			if (endDate) params.set('endDate', endDate);
			if (selectedMemberIds.length > 0) {
				params.set('memberIds', selectedMemberIds.join(','));
			}

			const response = await ofetch(`/api/vaults/${data.vaultId}/stats?${params.toString()}`, {
				headers: {
					'Accept': 'application/json',
					// 'Authorization': `Bearer ${authManager.authState?.accessToken}`
				}
			});
            console.log('response.ok', response)
			if (response.success) {
                statsData = response.data;
			}
		} catch (error) {
			console.error('Failed to fetch stats:', error);
		} finally {
			isLoadingStats = false;
		}
	}

	async function switchPeriod(period: string) {
		if (period === currentPeriod) return;

		// Update URL
		const params = new URLSearchParams(page.url.searchParams);
		params.set('period', period);
		if (selectedMemberIds.length > 0) {
			params.set('memberIds', selectedMemberIds.join(','));
		}
		const newUrl = `${page.url.pathname}?${params.toString()}`;
		pushState(newUrl, '');

		currentPeriod = period as Period;
		await fetchStats();
	}

	async function toggleMemberFilter(memberId: string) {
		// If clicking the same member, deselect it (clear filter)
		if (selectedMemberIds.length === 1 && selectedMemberIds.includes(memberId)) {
			selectedMemberIds = [];
			const params = new URLSearchParams(page.url.searchParams);
			params.delete('memberIds');
			params.set('period', currentPeriod);
			const newUrl = `${page.url.pathname}?${params.toString()}`;
			pushState(newUrl, '');
		} else {
			// Replace selection with this member (single selection only)
			selectedMemberIds = [memberId];
			const params = new URLSearchParams(page.url.searchParams);
			params.set('period', currentPeriod);
			params.set('memberIds', memberId);
			const newUrl = `${page.url.pathname}?${params.toString()}`;
			pushState(newUrl, '');
		}
		await fetchStats();
	}

	async function clearMemberFilter() {
		selectedMemberIds = [];
		const params = new URLSearchParams(page.url.searchParams);
		params.delete('memberIds');
		params.set('period', currentPeriod);
		const newUrl = `${page.url.pathname}?${params.toString()}`;
		pushState(newUrl, '');
		await fetchStats();
	}

	function confirmDeleteExpense(expenseId: string) {
		expenseToDelete = expenseId;
		showDeleteDialog = true;
	}

	async function deleteExpense() {
		if (!expenseToDelete) return;

		try {
			const response = await fetch(`/api/vaults/${data.vaultId}/expenses/${expenseToDelete}`, {
				method: 'DELETE',
				// headers: { 'Authorization': `Bearer ${authManager.authState?.accessToken}` }
			});

			if (response.ok) {
				showDeleteDialog = false;
				expenseToDelete = null;
				// Reload the page to refresh the expense list
				window.location.reload();
			} else {
				const error = await response.json() as { error: string };
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
			case 'yesterday':
				const yesterday = new Date(now);
				yesterday.setDate(now.getDate() - 1);
				return `Yesterday (${yesterday.toLocaleDateString()})`;
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

<div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 theme-transition">
	<!-- Time Period Selector -->
	<div class="mb-4 sm:mb-6">
		<!-- Mobile: Horizontal Scrollable Pills -->
		<div class="sm:hidden overflow-x-auto -mx-4 px-4">
			<div class="flex gap-2 pb-2">
				{#each timePeriods as period}
					<button
						onclick={() => switchPeriod(period.id)}
						class="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all {
							currentPeriod === period.id
								? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30  text-green-600 dark:text-green-300 my-1'
								: 'bg-muted text-muted-foreground active:bg-muted/80'
						}"
					>
						<span class="mr-1.5">{period.icon}</span>
						{period.label}
					</button>
				{/each}
			</div>
		</div>

		<!-- Desktop Tabs -->
		<div class="hidden sm:block">
			<div class="border-b border-border">
				<nav class="-mb-px flex space-x-8">
					{#each timePeriods as period}
						<button
							onclick={() => switchPeriod(period.id)}
							class="py-4 px-1 border-b-2 font-semibold text-sm whitespace-nowrap transition-all duration-200 cursor-pointer {
								currentPeriod === period.id
									? 'border-primary text-primary border-b-[3px] text-green-600 dark:text-green-300'
									: 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
							}"
						>
							<span class="mr-2">{period.icon}</span>
							{period.label}
						</button>
					{/each}
				</nav>
			</div>
		</div>
	</div>


	{#if isLoadingStats}
		<div class="flex items-center justify-center py-12">
			<div class="flex items-center space-x-3 text-muted-foreground">
				<div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
				<span class="text-sm font-medium">Loading expenses...</span>
			</div>
		</div>
	{:else if statsData}
		<!-- Period Summary Header -->
		<div class="bg-gradient-to-r from-primary to-accent rounded-lg p-3 sm:p-6 mb-4 sm:mb-6 text-primary-foreground shadow-lg">
			<div class="flex flex-col gap-3 sm:gap-4">
				<!-- Title and More Details Button -->
				<div class="flex items-center justify-between">
					<h2 class="text-sm sm:text-lg font-semibold">Expenses for {getPeriodLabel(currentPeriod)}</h2>
					<Button
						onclick={() => goto(`/vaults/${data.vaultId}/statistics`)}
						variant="ghost"
						size="sm"
						class="text-primary-foreground hover:bg-primary-foreground/10 text-xs sm:text-sm"
					>
						More Details
					</Button>
				</div>

				<!-- Stats Grid - Mobile Optimized -->
				<div class="grid grid-cols-2 gap-3">
					<div class="bg-primary-foreground/10 rounded-lg p-3 backdrop-blur-sm">
						<p class="text-xs text-primary-foreground/70 mb-1">Total Spent</p>
						<p class="text-lg sm:text-2xl font-bold">{formatCurrency(statsData.totalAmount)}</p>
					</div>
					<div class="bg-primary-foreground/10 rounded-lg p-3 backdrop-blur-sm">
						<p class="text-xs text-primary-foreground/70 mb-1">Expenses</p>
						<p class="text-lg sm:text-2xl font-bold">{statsData.totalExpenses}</p>
					</div>
				</div>
			</div>

			<!-- Member Spending Breakdown -->
			{#if statsData.memberSpending.length > 0}
				<div class="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-primary-foreground/20">
					<div class="flex items-center justify-between mb-2 sm:mb-3">
						<h3 class="text-xs sm:text-sm font-medium text-primary-foreground/90">Spending by Member</h3>
						{#if selectedMemberIds.length > 0}
							<button
								onclick={clearMemberFilter}
								class="text-xs text-primary-foreground/70 hover:text-primary-foreground underline cursor-pointer active:text-primary-foreground"
							>
								Clear
							</button>
						{/if}
					</div>
					<!-- Mobile: Horizontal Scrollable -->
					<div class="sm:hidden overflow-x-auto -mx-3 px-3">
						<div class="flex gap-2 pb-2">
							{#each statsData.memberSpending as member}
								<button
									onclick={() => toggleMemberFilter(member.userId)}
									class="flex-shrink-0 w-36 bg-primary-foreground/10 rounded-lg p-2.5 backdrop-blur-sm border-2 transition-all active:scale-95 {
										selectedMemberIds.includes(member.userId)
											? 'border-primary-foreground ring-2 ring-primary-foreground/30 bg-primary-foreground/20'
											: 'border-primary-foreground/20'
									}"
								>
									<div class="flex flex-col gap-1">
										<p class="text-sm font-medium text-primary-foreground truncate text-left">{member.userName}</p>
										<p class="text-lg font-bold text-primary-foreground text-left">{formatCurrency(member.totalAmount)}</p>
										<p class="text-xs text-primary-foreground/70 text-left">{member.expenseCount} {member.expenseCount === 1 ? 'expense' : 'expenses'}</p>
									</div>
								</button>
							{/each}
						</div>
					</div>
					<!-- Desktop: Grid -->
					<div class="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
						{#each statsData.memberSpending as member}
							<button
								onclick={() => toggleMemberFilter(member.userId)}
								class="bg-primary-foreground/10 rounded-lg p-3 backdrop-blur-sm border-2 transition-all cursor-pointer {
									selectedMemberIds.includes(member.userId)
										? 'border-primary-foreground ring-4 ring-primary-foreground/30 bg-primary-foreground/20'
										: 'border-primary-foreground/20 hover:border-primary-foreground/40 hover:bg-primary-foreground/15'
								}"
							>
								<div class="flex justify-between items-start">
									<div class="min-w-0 flex-1 text-left">
										<p class="text-sm font-medium text-primary-foreground truncate">{member.userName}</p>
										<p class="text-xs text-primary-foreground/70 mt-0.5">{member.expenseCount} {member.expenseCount === 1 ? 'expense' : 'expenses'}</p>
									</div>
									<p class="text-sm font-semibold text-primary-foreground ml-2">{formatCurrency(member.totalAmount)}</p>
								</div>
							</button>
						{/each}
					</div>
					{#if selectedMemberIds.length > 0}
						<p class="text-xs text-primary-foreground/70 mt-2 sm:mt-3">
							Filtering by 1 member
						</p>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Recent Expenses -->
		<div class="bg-background shadow-card rounded-card border theme-transition mb-8">
			<div class="px-3 py-3 sm:px-6 sm:py-4">
				<!-- Header - Mobile Optimized -->
				<div class="flex items-center justify-between mb-3 gap-2">
					<h3 class="text-sm sm:text-base font-medium text-foreground">Recent Expenses</h3>
					<div class="flex items-center gap-1 sm:gap-2">
						<!-- Mobile: Compact Selector -->
						<div class="flex items-center gap-1 sm:hidden">
							<select
								id="expense-limit"
								bind:value={expenseLimit}
								onchange={() => fetchStats()}
								class="text-xs border rounded px-1.5 py-1 bg-background text-foreground"
							>
								<option value={5}>5</option>
								<option value={10}>10</option>
								<option value={20}>20</option>
								<option value={50}>50</option>
							</select>
						</div>
						<!-- Desktop: Full Selector -->
						<div class="hidden sm:flex items-center gap-2">
							<label for="expense-limit-desktop" class="text-sm text-muted-foreground">Show:</label>
							<select
								id="expense-limit-desktop"
								bind:value={expenseLimit}
								onchange={() => fetchStats()}
								class="text-sm border rounded-md px-2 py-1 bg-background text-foreground"
							>
								<option value={5}>5</option>
								<option value={10}>10</option>
								<option value={20}>20</option>
								<option value={50}>50</option>
							</select>
						</div>
						<Button variant="ghost" size="sm" onclick={() => goto(`/vaults/${data.vaultId}/expenses`) }>
							<span class="hidden sm:inline">View All</span>
							<span class="sm:hidden text-xs">All</span>
						</Button>
					</div>
				</div>

				{#if statsData.recentExpenses.length === 0}
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
						{#each statsData.recentExpenses as expense (expense.id)}
							<div class="py-2 px-3 -mx-3 rounded-md transition-colors {expense.userId ? getMemberColor(expense.userId) : 'bg-background'}" transition:slide={{ duration: 200 }}>
								<!-- Desktop Layout -->
								<div class="hidden sm:block">
									<div class="flex items-start justify-between gap-4 mb-2">
										<div class="flex items-start gap-2 flex-1">
											<div class="w-3 h-3 rounded-full flex-shrink-0 mt-0.5" style="background-color: {expense.category?.color}"></div>
											{#if expense.note}
												<p class="text-sm text-foreground flex-1">{expense.note}</p>
											{:else}
												<div class="flex-1"></div>
											{/if}
										</div>
										<span class="text-xs text-muted-foreground flex-shrink-0">{formatDate(expense.date)}</span>
									</div>
									<div class="flex items-center gap-2 mb-2">
										<div class="flex items-center gap-1.5 flex-shrink-0">
											{#if expense.category?.icon}
												<IconDisplay icon={expense.category.icon} iconType={expense.category.iconType} />
											{/if}
										</div>
										<div class="flex-1 min-w-0">
											<div class="flex items-center gap-2">
												<span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground flex-shrink-0">
													{expense.category?.name}
												</span>
											</div>
										</div>
									</div>
									<div class="flex items-center justify-between">
										<p class="text-sm font-semibold text-foreground">
											{formatCurrency(expense.amount)}
										</p>
										<div class="flex gap-2">
											<Button
												variant="ghost"
												size="sm"
												onclick={() => goto(`/vaults/${data.vaultId}/expenses/${expense.id}/edit`)}
												class="h-8 w-8 p-0"
											>
												<Pencil class="w-4 h-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onclick={() => confirmDeleteExpense(expense.id)}
												class="h-8 w-8 p-0"
											>
												<Trash class="w-4 h-4 text-destructive" />
											</Button>
										</div>
									</div>
								</div>

								<!-- Mobile Layout -->
								<div class="sm:hidden">
									<div class="flex items-start justify-between gap-2 mb-2">
										<div class="flex items-start gap-2 flex-1">
											<div class="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5" style="background-color: {expense.category?.color}"></div>
											{#if expense.note}
												<p class="text-sm text-foreground flex-1">{expense.note}</p>
											{:else}
												<div class="flex-1"></div>
											{/if}
										</div>
										<span class="text-xs text-muted-foreground flex-shrink-0">{new Date(expense.date).toLocaleDateString()}</span>
									</div>
									<div class="flex items-start gap-2 mb-2">
										<div class="flex items-center gap-1 flex-shrink-0 mt-0.5">
											{#if expense.category?.icon}
												<IconDisplay icon={expense.category.icon} iconType={expense.category.iconType} />
											{/if}
										</div>
										<div class="flex-1 min-w-0">
											<div class="flex items-center gap-1 text-xs text-muted-foreground">
												<span>{expense.category?.name}</span>
											</div>
										</div>
									</div>
									<div class="flex items-center justify-between">
										<p class="text-sm font-semibold text-foreground">
											{formatCurrency(expense.amount)}
										</p>
										<div class="flex gap-1.5">
											<Button
												variant="ghost"
												size="sm"
												onclick={() => goto(`/vaults/${data.vaultId}/expenses/${expense.id}/edit`)}
												class="h-8 w-8 p-0"
											>
												<Pencil class="w-4 h-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onclick={() => confirmDeleteExpense(expense.id)}
												class="h-8 w-8 p-0"
											>
												<Trash class="w-4 h-4 text-destructive" />
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