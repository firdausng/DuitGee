<script lang="ts">
	import { formatCurrency, formatDateTime } from '$lib/utils';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import IconDisplay from '$lib/components/IconDisplay.svelte';
	import { Plus, Pencil, Trash, MagnifyingGlass } from 'phosphor-svelte';
    import {goto} from "$app/navigation";
	import { page, navigating } from '$app/stores';

	let { data } = $props();

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

	// Use SvelteKit's built-in navigation loading state
	let isLoading = $derived(!!$navigating);

	function switchPeriod(period: string) {
		if (period === currentPeriod) return; // Don't reload if same period

		const newUrl = new URL($page.url);
		newUrl.searchParams.set('period', period);
		goto(newUrl.pathname + newUrl.search);
	}

	// Mock data - replace with actual data from load function
	// let expenses = [
	// 	{
	// 		id: '1',
	// 		title: 'Grocery Shopping',
	// 		description: 'Weekly grocery shopping at Whole Foods',
	// 		amount: 89.50,
	// 		category: { id: '1', name: 'Food', color: '#10B981' },
	// 		date: new Date('2023-12-01T10:30:00')
	// 	},
	// 	{
	// 		id: '2',
	// 		title: 'Gas Station',
	// 		description: 'Fill up the tank',
	// 		amount: 65.00,
	// 		category: { id: '2', name: 'Transportation', color: '#F59E0B' },
	// 		date: new Date('2023-11-30T15:45:00')
	// 	},
	// 	{
	// 		id: '3',
	// 		title: 'Coffee Shop',
	// 		description: 'Morning coffee with friends',
	// 		amount: 12.50,
	// 		category: { id: '1', name: 'Food', color: '#10B981' },
	// 		date: new Date('2023-11-30T08:15:00')
	// 	},
	// 	{
	// 		id: '4',
	// 		title: 'Movie Tickets',
	// 		description: 'Weekend movie night',
	// 		amount: 28.00,
	// 		category: { id: '3', name: 'Entertainment', color: '#8B5CF6' },
	// 		date: new Date('2023-11-29T19:30:00')
	// 	},
	// 	{
	// 		id: '5',
	// 		title: 'Uber Ride',
	// 		description: 'Ride to downtown',
	// 		amount: 15.75,
	// 		category: { id: '2', name: 'Transportation', color: '#F59E0B' },
	// 		date: new Date('2023-11-29T14:20:00')
	// 	}
	// ];

	// let categories = [
	// 	{ id: '1', name: 'Food', color: '#10B981' },
	// 	{ id: '2', name: 'Transportation', color: '#F59E0B' },
	// 	{ id: '3', name: 'Entertainment', color: '#8B5CF6' }
	// ];

	let searchTerm = $state('');
	let selectedCategory = $state('');
	let sortBy = $state('date');

	let filteredExpenses = $derived.by(()=>{
        return data.expenses.expenses
            .filter((expense) => {
                // If no search term, show all expenses; otherwise filter by note content
                const matchesSearch = !searchTerm || expense.note?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
                const matchesCategory = !selectedCategory || expense.category?.id === selectedCategory;
                return matchesSearch && matchesCategory;
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

	function deleteExpense(id: string) {
		// if (confirm('Are you sure you want to delete this expense?')) {
		// 	expenses = expenses.filter((e) => e.id !== id);
		// }
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
		<div class="mt-4 sm:mt-0">
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
				bind:value={currentPeriod}
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

	<!-- Period Summary -->
	<div class="bg-gradient-to-r from-primary to-accent rounded-lg p-6 mb-6 text-primary-foreground relative overflow-hidden shadow-lg">
		{#if isLoading}
			<div class="absolute inset-0 bg-primary/50 flex items-center justify-center backdrop-blur-sm">
				<div class="flex items-center space-x-2 text-primary-foreground">
					<div class="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
					<span class="text-sm font-medium">Loading expenses...</span>
				</div>
			</div>
		{/if}
		<div class="flex items-center justify-between {isLoading ? 'opacity-50' : ''}">
			<div>
				<h2 class="text-lg font-semibold">Expenses for {getPeriodLabel(currentPeriod)}</h2>
				<p class="text-primary-foreground/80 mt-1">
					{filteredExpenses.length} {filteredExpenses.length === 1 ? 'expense' : 'expenses'}
					{#if data.expenses.pagination.total > filteredExpenses.length}
						(showing {filteredExpenses.length} of {data.expenses.pagination.total})
					{/if}
				</p>
			</div>
			<div class="text-right">
				<p class="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
				<p class="text-primary-foreground/80">Total spent</p>
			</div>
		</div>
	</div>

	<!-- Filters -->
	<div class="bg-background rounded-lg border border-border shadow-sm p-6 mb-6 {isLoading ? 'opacity-50 pointer-events-none' : ''}">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<div class="relative">
				<MagnifyingGlass class="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
				<Input
					bind:value={searchTerm}
					placeholder="Search expenses..."
					class="pl-10"
					disabled={isLoading}
				/>
			</div>
			<Select bind:value={selectedCategory} disabled={isLoading}>
				<option value="">All Categories</option>
				{#each data.categories as category}
					<option value={category.id}>{category.name}</option>
				{/each}
			</Select>
			<Select bind:value={sortBy} disabled={isLoading}>
				<option value="date">Sort by Date</option>
				<option value="amount">Sort by Amount</option>
				<option value="title">Sort by Note</option>
			</Select>
		</div>
	</div>

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
				{#each filteredExpenses as expense}
					<div class="px-4 sm:px-6 py-3 sm:py-4 hover:bg-accent/50 transition-colors">
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
											{expense.note || 'Untitled Expense'}
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
										onclick={() => deleteExpense(expense.id)}
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
											{expense.note || 'Untitled Expense'}
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
									</div>
								</div>
								<div class="flex items-center space-x-2 flex-shrink-0">
									<p class="text-base font-semibold text-foreground">
										{formatCurrency(expense.amount)}
									</p>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => goto(`/vaults/${data.vaultId}/expenses/${expense.id}/edit`)}
										class="p-1.5"
									>
										<Pencil class="w-3.5 h-3.5" />
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