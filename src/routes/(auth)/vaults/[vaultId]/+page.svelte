<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { useVaultStore } from '$lib/stores/vault.svelte.js';
	import { authManager } from '$lib/stores/current-session.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import IconDisplay from '$lib/components/IconDisplay.svelte';
	import { Plus, Receipt, Tag, TrendUp, Calendar, Vault, Users, Gear, Lock, Globe, Pencil, Trash } from 'phosphor-svelte';
    import {goto} from "$app/navigation";
	import type { Expense } from '$lib/types/expenses';

	let { data } = $props();

	// const vaultStore = useVaultStore();

	let stats = $state({
		totalExpenses: 0,
		totalAmount: 0,
		avgAmount: 0,
		recentExpenses: [] as Expense[]
	});

	let isLoading = $state(false);

	// Time period management
	const timePeriods = [
		{ id: 'daily', label: 'Today', icon: '📅' },
		{ id: 'weekly', label: 'This Week', icon: '📊' },
		{ id: 'monthly', label: 'This Month', icon: '📈' },
		{ id: 'yearly', label: 'This Year', icon: '📆' },
		{ id: 'all', label: 'All Time', icon: '🌍' }
	];

	let currentPeriod = $state('daily'); // Default to daily

	onMount(async () => {
		// Load vault statistics with default daily period
		await loadVaultStats();
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
				// Default to daily
				const defaultStartOfDay = new Date(now);
				defaultStartOfDay.setHours(0, 0, 0, 0);
				startDate = defaultStartOfDay.toISOString();
				endDate = now.toISOString();
		}

		return { startDate, endDate };
	}

	async function loadVaultStats() {
		try {
			isLoading = true;

			// Get date range for current period
			const { startDate, endDate } = calculateDateRange(currentPeriod);

			// Load vault statistics with time period
			let statsUrl = `/api/expenses/vaults/${data.vaultId}/expenses/stats/summary`;
			if (startDate && endDate) {
				statsUrl += `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
			}
			const statsResponse = await fetch(statsUrl, {
				headers: {
					'Authorization': `Bearer ${authManager.authState?.accessToken}`
				}
			});
			if (statsResponse.ok) {
				const statsResult = await statsResponse.json();
				stats.totalAmount = statsResult.totalAmount || 0;
				// Get actual expense count from the expenses endpoint
				let expenseCountUrl = `/api/expenses/vaults/${data.vaultId}/expenses?limit=1`;
				if (startDate && endDate) {
					expenseCountUrl += `&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
				}
				const expenseCountResponse = await fetch(expenseCountUrl, {
					headers: {
						'Authorization': `Bearer ${authManager.authState?.accessToken}`
					}
				});
				if (expenseCountResponse.ok) {
					const expenseCountResult = await expenseCountResponse.json();
					stats.totalExpenses = expenseCountResult.pagination?.total || 0;
					stats.avgAmount = stats.totalExpenses > 0 ? stats.totalAmount / stats.totalExpenses : 0;
				}
			}

			// Load recent expenses with time period
			let expensesUrl = `/api/expenses/vaults/${data.vaultId}/expenses?limit=5`;
			if (startDate && endDate) {
				expensesUrl += `&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
			}
			const expensesResponse = await fetch(expensesUrl, {
				headers: {
					'Authorization': `Bearer ${authManager.authState?.accessToken}`
				}
			});
			if (expensesResponse.ok) {
				const expensesResult = await expensesResponse.json();
				stats.recentExpenses = expensesResult.expenses || [];
			}
		} catch (error) {
			console.error('Failed to load vault stats:', error);
		} finally {
			isLoading = false;
		}
	}

	async function switchPeriod(period: string) {
		if (period === currentPeriod) return;
		currentPeriod = period;
		await loadVaultStats();
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
	<!-- Vault Header -->
	{#if data.currentVault}
		<div class="mb-8">
			<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
				<div class="flex items-center space-x-4">
					<div class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style="background-color: {data.currentVault.color || '#3B82F6'}20; border: 2px solid {data.currentVault.color || '#3B82F6'}">
						{#if data.currentVault.icon}
							<IconDisplay icon={data.currentVault.icon} iconType={data.currentVault.iconType} size="lg" />
						{:else}
							<Vault class="w-6 h-6" style="color: {data.currentVault.color || '#3B82F6'}" />
						{/if}
					</div>
					<div class="min-w-0 flex-1">
						<h1 class="text-2xl lg:text-3xl font-bold text-foreground flex items-center space-x-2 flex-wrap font-display">
							<span class="break-words">{data.currentVault.name}</span>
							{#if data.currentVault.isPersonal}
								<Lock size={20} class="text-muted-foreground flex-shrink-0" title="Personal vault" />
							{:else}
								<Globe size={20} class="text-dark flex-shrink-0" title="Shared vault" />
							{/if}
						</h1>
						{#if data.currentVault.description}
							<p class="text-muted-foreground mt-1 break-words">{data.currentVault.description}</p>
						{/if}
						<div class="flex flex-wrap items-center gap-2 lg:gap-4 mt-2 text-sm text-muted-foreground">
							{#if data.currentVault.role}
								<span class="inline-flex items-center px-2 py-1 rounded-9px text-xs font-medium bg-accent text-accent-foreground">
									{data.currentVault.role}
								</span>
							{/if}
						</div>
					</div>
				</div>
				<div class="flex flex-wrap gap-2 lg:flex-nowrap">
					{#if data.currentVault.role === 'owner' || data.currentVault.role === 'admin'}
						{#if !data.currentVault.isPersonal}
							<Button variant="outline" size="sm" onclick={() => goto(`/vaults/${data.vaultId}/members`)}>
								<Users size={16} class="mr-2" />
								Members
							</Button>
						{/if}
						<Button variant="outline" size="sm" onclick={() => goto(`/vaults/${data.vaultId}/edit`)}>
							<Gear size={16} class="mr-2" />
							Edit Vault
						</Button>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- Time Period Selector -->
	<div class="mb-8">
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


	<!-- Period Summary Header -->
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
					{stats.totalExpenses} {stats.totalExpenses === 1 ? 'expense' : 'expenses'}
				</p>
			</div>
			<div class="text-right">
				<p class="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
				<p class="text-primary-foreground/80">Total spent</p>
			</div>
		</div>
	</div>

	{#if isLoading}
		<div class="flex items-center justify-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
		</div>
	{:else}
		<!-- Recent Expenses -->
		<div class="bg-background shadow-card rounded-card border theme-transition mb-8">
			<div class="px-4 py-5 sm:p-6">
				<div class="flex items-center justify-between mb-4">
					<h3 class="text-lg leading-6 font-medium text-foreground">Recent Expenses {currentPeriod === 'daily' ? 'Today' : currentPeriod === 'weekly' ? 'This Week' : currentPeriod === 'monthly' ? 'This Month' : 'This Year'}</h3>
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
							<div class="px-6 py-4 hover:bg-accent/50 transition-colors">
								<div class="flex items-center justify-between">
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
												<span>{formatDate(expense.date)}</span>
												{#if expense.creator}
													<span>•</span>
													<span>by {expense.creator.firstName && expense.creator.lastName ? `${expense.creator.firstName} ${expense.creator.lastName}` : expense.creator.email}</span>
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
												onclick={() => {
													// You can implement delete functionality here
													console.log('Delete expense:', expense.id);
												}}
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

		<!-- Stats Cards -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
			<div class="bg-background overflow-hidden shadow-card rounded-card border theme-transition">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<Receipt class="h-6 w-6 text-muted-foreground" />
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-muted-foreground truncate">Total Expenses</dt>
								<dd class="text-lg font-medium text-foreground">{stats.totalExpenses}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-background overflow-hidden shadow-card rounded-card border theme-transition">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<TrendUp class="h-6 w-6 text-muted-foreground" />
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-muted-foreground truncate">Total Amount</dt>
								<dd class="text-lg font-medium text-foreground">{formatCurrency(stats.totalAmount)}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-background overflow-hidden shadow-card rounded-card border theme-transition">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<Calendar class="h-6 w-6 text-muted-foreground" />
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-muted-foreground truncate">Average Amount</dt>
								<dd class="text-lg font-medium text-foreground">{formatCurrency(stats.avgAmount)}</dd>
							</dl>
						</div>
					</div>
				</div>
			</div>
		</div>

	{/if}
</div>