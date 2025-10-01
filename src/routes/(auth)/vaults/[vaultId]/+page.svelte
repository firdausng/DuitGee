<script lang="ts">
	import { page, navigating } from '$app/state';
	import { authManager } from '$lib/stores/current-session.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import AlertDialog from '$lib/components/ui/AlertDialog.svelte';
	import IconDisplay from '$lib/components/IconDisplay.svelte';
	import { Plus, Receipt, Tag, TrendUp, Calendar, Vault, Users, Gear, Lock, Globe, Pencil, Trash } from 'phosphor-svelte';
    import {goto} from "$app/navigation";
	import { fade, slide } from 'svelte/transition';

	let { data } = $props();

	// Delete dialog state
	let showDeleteDialog = $state(false);
	let expenseToDelete = $state<string | null>(null);

	// Time period management
	const timePeriods = [
		{ id: 'daily', label: 'Today', icon: '📅' },
		{ id: 'weekly', label: 'This Week', icon: '📊' },
		{ id: 'monthly', label: 'This Month', icon: '📈' },
		{ id: 'yearly', label: 'This Year', icon: '📆' },
		{ id: 'all', label: 'All Time', icon: '🌍' }
	];

	// Get period and member filter from data (server-loaded)
	let currentPeriod = $state(data.currentPeriod);
	let selectedMemberIds = $state<string[]>(page.url.searchParams.get('memberIds')?.split(',').filter(Boolean) || []);

	// Update state when data changes (after navigation)
	$effect(() => {
		currentPeriod = data.currentPeriod;
		selectedMemberIds = page.url.searchParams.get('memberIds')?.split(',').filter(Boolean) || [];
	});

	// Track loading state - use navigating for navigation-based loading
	let isLoading = $derived(false);

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

	function switchPeriod(period: string) {
		if (period === currentPeriod) return;

		const newUrl = new URL(page.url);
		newUrl.searchParams.set('period', period);
		goto(newUrl.pathname + newUrl.search);
	}

	function toggleMemberFilter(memberId: string) {
		const newUrl = new URL(page.url);

		// If clicking the same member, deselect it (clear filter)
		if (selectedMemberIds.length === 1 && selectedMemberIds.includes(memberId)) {
			newUrl.searchParams.delete('memberIds');
		} else {
			// Replace selection with this member (single selection only)
			newUrl.searchParams.set('memberIds', memberId);
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
							} {isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}"
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


	{#if isLoading}
		<div class="flex items-center justify-center py-12">
			<div class="flex items-center space-x-3 text-muted-foreground">
				<div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
				<span class="text-sm font-medium">Loading expenses...</span>
			</div>
		</div>
	{:else if data.stats}
		<!-- Period Summary Header -->
		<div class="bg-gradient-to-r from-primary to-accent rounded-lg p-4 sm:p-6 mb-6 text-primary-foreground shadow-lg">
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h2 class="text-base sm:text-lg font-semibold">Expenses for {getPeriodLabel(currentPeriod)}</h2>
					<p class="text-primary-foreground/80 mt-1 text-sm">
						{data.stats.totalExpenses} {data.stats.totalExpenses === 1 ? 'expense' : 'expenses'}
					</p>
				</div>
				<div class="text-left sm:text-right">
					<p class="text-xl sm:text-2xl font-bold">{formatCurrency(data.stats.totalAmount)}</p>
					<p class="text-primary-foreground/80 text-sm">Total spent</p>
				</div>
			</div>

			<!-- Member Spending Breakdown -->
			{#if data.stats.memberSpending.length > 0}
				<div class="mt-4 pt-4 border-t border-primary-foreground/20">
					<div class="flex items-center justify-between mb-3">
						<h3 class="text-sm font-medium text-primary-foreground/90">Spending by Member</h3>
						{#if selectedMemberIds.length > 0}
							<button
								onclick={clearMemberFilter}
								class="text-xs text-primary-foreground/70 hover:text-primary-foreground underline cursor-pointer"
							>
								Clear filter
							</button>
						{/if}
					</div>
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
						{#each data.stats.memberSpending as member}
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
						<p class="text-xs text-primary-foreground/70 mt-3">
							Filtering by 1 member
						</p>
					{/if}
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

				{#if data.stats.recentExpenses.length === 0}
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
						{#each data.stats.recentExpenses as expense (expense.id)}
							<div class="py-2 px-3 -mx-3 rounded-md transition-colors {expense.creator ? getMemberColor(expense.creator.id) : 'bg-background'}" transition:slide={{ duration: 200 }}>
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