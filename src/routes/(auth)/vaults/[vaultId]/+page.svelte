<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { useVaultStore } from '$lib/stores/vault.svelte.js';
	import Button from '$lib/components/ui/Button.svelte';
	import IconDisplay from '$lib/components/IconDisplay.svelte';
	import { Plus, Receipt, Tag, TrendUp, Calendar, Vault, Users, Gear, Lock, Globe } from 'phosphor-svelte';
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

	// onMount(async () => {
	// 	// Initialize vault store with server data
	// 	if (data.availableVaults) {
	// 		vaultStore.setAvailableVaults(data.availableVaults);
	// 	}
	// 	if (data.currentVault) {
	// 		vaultStore.setCurrentVault(data.currentVault);
	// 	}
    //
	// 	// Load vault statistics
	// 	await loadVaultStats();
	// });

	// async function loadVaultStats() {
	// 	try {
	// 		isLoading = true;
    //
	// 		// Load vault statistics
	// 		const statsResponse = await fetch(`/api/vaults/${data.vaultId}/stats`);
	// 		if (statsResponse.ok) {
	// 			const statsData = await statsResponse.json();
	// 			stats.totalExpenses = statsData.totalExpenses || 0;
	// 			stats.totalAmount = statsData.totalAmount || 0;
	// 			stats.avgAmount = statsData.avgAmount || 0;
	// 		}
    //
	// 		// Load recent expenses
	// 		const expensesResponse = await fetch(`/api/vaults/${data.vaultId}/expenses?limit=5`);
	// 		if (expensesResponse.ok) {
	// 			const expensesData = await expensesResponse.json();
	// 			stats.recentExpenses = expensesData.expenses || [];
	// 		}
	// 	} catch (error) {
	// 		console.error('Failed to load vault stats:', error);
	// 	} finally {
	// 		isLoading = false;
	// 	}
	// }

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

	<!-- Quick Actions -->
	<div class="mb-8">
		<h2 class="text-lg font-medium text-foreground mb-4">Quick Actions</h2>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
			{#if canCreateExpenses}
				<Button variant="default" onclick={() => goto(`/vaults/${data.vaultId}/expenses/new`)} class="w-full justify-center">
					<Plus class="w-4 h-4 mr-2" />
					Add Expense
				</Button>
			{/if}

			{#if canManageCategories}
				<Button variant="outline" onclick={() => goto(`/vaults/${data.vaultId}/categories/new`)} class="w-full justify-center">
					<Tag class="w-4 h-4 mr-2" />
					New Category
				</Button>
			{/if}

			<Button variant="outline" onclick={() => goto(`/vaults/${data.vaultId}/expenses`)} class="w-full justify-center">
				<Receipt class="w-4 h-4 mr-2" />
				View All Expenses
			</Button>
		</div>
	</div>

	{#if isLoading}
		<div class="flex items-center justify-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
		</div>
	{:else}
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

		<!-- Recent Expenses -->
		<div class="bg-background shadow-card rounded-card border theme-transition">
			<div class="px-4 py-5 sm:p-6">
				<div class="flex items-center justify-between mb-4">
					<h3 class="text-lg leading-6 font-medium text-foreground">Recent Expenses</h3>
					<Button variant="ghost" size="sm" onclick={() => window.location.href = `/vaults/${data.vaultId}/expenses`}>
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
					<div class="flow-root">
						<ul class="-my-5 divide-y divide-border">
							{#each stats.recentExpenses as expense}
								<li class="py-4 theme-transition">
									<div class="flex items-center space-x-4">
										<div class="flex-shrink-0">
											<div class="h-8 w-8 rounded-full flex items-center justify-center" style="background-color: {expense.category?.color || '#3B82F6'}20">
												{#if expense.category?.icon}
													<IconDisplay icon={expense.category.icon} iconType={expense.category.iconType || 'emoji'} size="sm" />
												{:else}
													<Receipt class="w-4 h-4" style="color: {expense.category?.color || '#3B82F6'}" />
												{/if}
											</div>
										</div>
										<div class="flex-1 min-w-0">
											<p class="text-sm font-medium text-foreground truncate">
												{expense.title}
											</p>
											<p class="text-sm text-muted-foreground truncate">
												{expense.category?.name || 'Uncategorized'} • {formatDate(new Date(expense.date).toISOString())}
											</p>
										</div>
										<div class="text-sm font-medium text-foreground">
											{formatCurrency(expense.amount)}
										</div>
									</div>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>