<script lang="ts">
	import { formatCurrency, formatDateTime } from '$lib/utils';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import IconDisplay from '$lib/components/IconDisplay.svelte';
	import AlertDialog from '$lib/components/ui/AlertDialog.svelte';
	import { authManager } from '$lib/stores/current-session.svelte';
	import Plus from 'phosphor-svelte/lib/Plus';
	import Pencil from 'phosphor-svelte/lib/Pencil';
	import Trash from 'phosphor-svelte/lib/Trash';
	import MagnifyingGlass from 'phosphor-svelte/lib/MagnifyingGlass';
	import Funnel from 'phosphor-svelte/lib/Funnel';
    import {goto} from "$app/navigation";
	import { page, navigating } from '$app/state';
	import { fade, slide } from 'svelte/transition';

	let { data } = $props();

	// Sidebar state
	let isSidebarOpen = $state(false);

	// Delete dialog state
	let showDeleteDialog = $state(false);
	let expenseToDelete = $state<string | null>(null);

	// Time period tabs
	const timePeriods = [
		{ id: 'daily', label: 'Daily', icon: '📅' },
		{ id: 'weekly', label: 'Weekly', icon: '📊' },
		{ id: 'monthly', label: 'Monthly', icon: '📈' },
		{ id: 'yearly', label: 'Yearly', icon: '📆' },
		{ id: 'all', label: 'All Time', icon: '🌍' }
	];

	let currentPeriod = $state(data.currentPeriod);

	// Update currentPeriod when data changes (after navigation)
	$effect(() => {
		currentPeriod = data.currentPeriod;
	});

	// Track loading state - use navigating for navigation-based loading
	let isLoading = $state(false);



	function switchPeriod(period: string) {
		if (period === currentPeriod) return; // Don't reload if same period

		const newUrl = new URL(page.url);
		newUrl.searchParams.set('period', period);
		goto(newUrl.pathname + newUrl.search);
	}

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

	let searchTerm = $state('');
	let selectedCategory = $state('');
	let sortBy = $state('date');
	let selectedMemberIds = $state<string[]>([]);

	let filteredExpenses = $derived.by(()=>{
        return data.expenses.expenses
            .filter((expense) => {
                // If no search term, show all expenses; otherwise filter by note content
                const matchesSearch = !searchTerm || expense.note?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
                const matchesCategory = !selectedCategory || expense.category?.id === selectedCategory;
                const matchesMember = selectedMemberIds.length === 0 || (expense.creator && selectedMemberIds.includes(expense.creator.id));
                return matchesSearch && matchesCategory && matchesMember;
            })
            .sort((a, b) => {
                if (sortBy === 'date') return b.date.localeCompare(a.date); // ISO strings can be compared directly
                if (sortBy === 'amount') return b.amount - a.amount;
                if (sortBy === 'title') return (a.note || '').localeCompare(b.note || '');
                return 0;
            });
    });

	let totalAmount = $derived.by(()=>{
        return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    });

	function confirmDeleteExpense(expenseId: string) {
		expenseToDelete = expenseId;
		showDeleteDialog = true;
	}

	async function deleteExpense() {
		if (!expenseToDelete) return;

		try {
			const response = await fetch(`/api/vaults/${data.vaultId}/expenses/${expenseToDelete}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${authManager.authState?.accessToken}`,
					'Content-Type': 'application/json'
				}
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

	function toggleMemberFilter(memberId: string) {
		if (selectedMemberIds.includes(memberId)) {
			selectedMemberIds = selectedMemberIds.filter(id => id !== memberId);
		} else {
			selectedMemberIds = [...selectedMemberIds, memberId];
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
</script>

<svelte:head>
	<title>Expenses - Expense Tracker</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold text-foreground font-display">Expenses</h1>
			<p class="mt-2 text-muted-foreground">Manage and track all your expenses</p>
		</div>
		<div class="mt-4 sm:mt-0 flex gap-2">
			<Button variant="outline" onclick={() => isSidebarOpen = !isSidebarOpen} disabled={isLoading}>
				<Funnel class="w-4 h-4 mr-2" />
				Filters
			</Button>
			<Button onclick={() => goto(`/vaults/${data.vaultId}/expenses/new`)} disabled={isLoading}>
				<Plus class="w-4 h-4 mr-2" />
				Add Expense
			</Button>
		</div>
	</div>

	<!-- Time Period Filter -->
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
							onclick={() => switchPeriod(period.id)}
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


	<!-- Filter Sidebar -->
	{#if isSidebarOpen}
		<div class="fixed inset-0 z-50 lg:static lg:z-0">
			<!-- Backdrop for mobile -->
			<div class="fixed inset-0 bg-black/50 lg:hidden cursor-pointer" onclick={() => isSidebarOpen = false}></div>

			<!-- Sidebar -->
			<div class="fixed right-0 top-0 h-full w-80 bg-background border-l border-border shadow-lg lg:relative lg:w-auto lg:shadow-none transform transition-transform duration-300 ease-in-out">
				<div class="p-6">
					<div class="flex items-center justify-between mb-6">
						<h2 class="text-lg font-semibold text-foreground">Filters</h2>
						<Button variant="ghost" size="sm" onclick={() => isSidebarOpen = false}>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</Button>
					</div>

					<div class="space-y-4">
						<div>
							<label class="block text-sm font-medium text-foreground mb-2">Search</label>
							<div class="relative">
								<MagnifyingGlass class="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
								<Input
									bind:value={searchTerm}
									placeholder="Search expenses..."
									class="pl-10"
									disabled={isLoading}
								/>
							</div>
						</div>

						<div>
							<label class="block text-sm font-medium text-foreground mb-2">Category</label>
							<Select bind:value={selectedCategory} disabled={isLoading}>
								<option value="">All Categories</option>
								{#each data.categories as category}
									<option value={category.id}>{category.name}</option>
								{/each}
							</Select>
						</div>

						<div>
							<label class="block text-sm font-medium text-foreground mb-2">Sort By</label>
							<Select bind:value={sortBy} disabled={isLoading}>
								<option value="date">Sort by Date</option>
								<option value="amount">Sort by Amount</option>
								<option value="title">Sort by Note</option>
							</Select>
						</div>

						<!-- Member Filter -->
						{#if data.vault?.allMembers && data.vault.allMembers.length > 1}
							<div>
								<label class="block text-sm font-medium text-foreground mb-2">Filter by Member</label>
								<div class="space-y-2 max-h-48 overflow-y-auto">
									{#each data.vault.allMembers as member}
										<label class="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-2 rounded transition-colors">
											<input
												type="checkbox"
												checked={selectedMemberIds.includes(member.user.id)}
												onchange={() => toggleMemberFilter(member.user.id)}
												disabled={isLoading}
												class="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
											/>
											<span class="text-sm truncate flex-1">
												{member.user.firstName && member.user.lastName ? `${member.user.firstName} ${member.user.lastName}` : member.user.email}
											</span>
											{#if member.role === 'owner'}
												<span class="text-xs text-muted-foreground">(Owner)</span>
											{/if}
										</label>
									{/each}
								</div>
							</div>
						{/if}

						<div class="pt-4 border-t border-border">
							<Button variant="outline" class="w-full" onclick={() => {
								searchTerm = '';
								selectedCategory = '';
								sortBy = 'date';
								selectedMemberIds = [];
							}}>
								Clear Filters
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Expenses List -->
	<div class="bg-background rounded-lg border border-border shadow-sm overflow-hidden relative">
		{#if isLoading}
			<div class="absolute inset-0 bg-background/80 flex items-center justify-center z-10 backdrop-blur-sm">
				<div class="flex items-center space-x-3 text-muted-foreground">
					<div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
					<span class="text-sm font-medium">Loading expenses...</span>
				</div>
			</div>
		{/if}
		<div class="{isLoading ? 'opacity-50' : ''}">
			{#if filteredExpenses.length === 0}
				<div class="text-center py-12">
					<Plus class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
					<h3 class="text-lg font-medium text-foreground mb-2">No expenses found</h3>
					<p class="text-muted-foreground mb-6">No expenses match your current criteria</p>
					<Button onclick={() => goto(`/vaults/${data.vaultId}/expenses/new`)} disabled={isLoading}>
						<Plus class="w-4 h-4 mr-2" />
						Add Your First Expense
					</Button>
				</div>
			{:else}
				<div class="divide-y divide-border">
				{#each filteredExpenses as expense (expense.id)}
					<div class="px-4 sm:px-6 py-3 sm:py-4 transition-colors rounded-md {expense.creator ? getMemberColor(expense.creator.id) : 'bg-background'}" transition:slide={{ duration: 200 }}>
						<!-- Desktop Layout -->
						<div class="hidden sm:flex items-center justify-between">
							<div class="flex items-center space-x-4 flex-1">
								<div class="flex items-center space-x-2 flex-shrink-0">
									<div
										class="w-4 h-4 rounded-full"
										style="background-color: {expense.category?.color}"
									></div>
									{#if expense.category?.icon}
										<IconDisplay icon={expense.category.icon} iconType={expense.category.iconType} size="sm" />
									{/if}
								</div>
								<div class="flex-1 min-w-0">
									<div class="flex items-center space-x-2">
										<h3 class="text-sm font-medium text-foreground truncate">
											{expense.note || ''}
										</h3>
										{#if expense.category?.group}
											<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary space-x-1">
												<IconDisplay icon={expense.category.group.icon || '📂'} iconType={expense.category.group.iconType || 'emoji'} size="sm" />
												<span>{expense.category.group.name}</span>
											</span>
										{/if}
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
											{expense.category?.name}
										</span>
									</div>
									<div class="flex items-center space-x-2 text-xs text-muted-foreground">
										<span>{formatDateTime(expense.date)}</span>
										{#if expense.creator}
											<span>•</span>
											<span>by {expense.creator.firstName && expense.creator.lastName ? `${expense.creator.firstName} ${expense.creator.lastName} (${expense.creator.email})` : expense.creator.email}</span>
										{/if}
									</div>
								</div>
							</div>
							<div class="flex items-center space-x-4">
								<p class="text-lg font-semibold text-foreground">
									{formatCurrency(expense.amount)}
								</p>
								<div class="flex space-x-2">
									<Button
										variant="ghost"
										size="sm"
										onclick={() => goto(`/vaults/${data.vaultId}/expenses/${expense.id}/edit`)}
									>
										<Pencil class="w-4 h-4" />
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => confirmDeleteExpense(expense.id)}
									>
										<Trash class="w-4 h-4 text-destructive" />
									</Button>
								</div>
							</div>
						</div>

						<!-- Mobile Layout -->
						<div class="sm:hidden">
							<div class="flex items-start justify-between">
								<div class="flex items-start space-x-3 flex-1 min-w-0">
									<div class="flex items-center space-x-1 flex-shrink-0 mt-0.5">
										<div
											class="w-3 h-3 rounded-full"
											style="background-color: {expense.category?.color}"
										></div>
										{#if expense.category?.icon}
											<IconDisplay icon={expense.category.icon} iconType={expense.category.iconType} size="xs" />
										{/if}
									</div>
									<div class="flex-1 min-w-0">
										<h3 class="text-sm font-medium text-foreground truncate leading-tight">
											{expense.note || ''}
										</h3>
										<div class="flex items-center space-x-1 mt-1">
											<span class="text-xs text-muted-foreground">
												{expense.category?.name}
											</span>
											<span class="text-xs text-muted-foreground">•</span>
											<span class="text-xs text-muted-foreground">
												{new Date(expense.date).toLocaleDateString()}
											</span>
										</div>
										{#if expense.creator}
											<div class="text-xs text-muted-foreground mt-0.5 truncate">
												by {expense.creator.firstName && expense.creator.lastName ? `${expense.creator.firstName} ${expense.creator.lastName} (${expense.creator.email})` : expense.creator.email}
											</div>
										{/if}
									</div>
								</div>
								<div class="flex items-center space-x-1.5 flex-shrink-0">
									<p class="text-base font-semibold text-foreground">
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
						</div>
					</div>
				{/each}
			</div>
		{/if}
		</div>
	</div>

	<!-- Pagination -->
	{#if filteredExpenses.length > 0}
		<div class="mt-6 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">
				Showing {filteredExpenses.length} of {data.expenses.pagination.total} expenses
			</p>
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
