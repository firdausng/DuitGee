<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import VaultCard from '$lib/components/VaultCard.svelte';
	import VaultListItem from '$lib/components/VaultListItem.svelte';
	import { Plus, Vault, Users, GridFour, List } from 'phosphor-svelte';
    import {goto} from "$app/navigation";

	let { data } = $props();

	// View mode state
	let viewMode = $state('list'); // 'grid' or 'list'

	// Favorite vault management
	let favoriteVaultId = $state(null);

	// Load favorite vault from localStorage
	if (typeof window !== 'undefined') {
		favoriteVaultId = localStorage.getItem('favoriteVaultId');
	}

	const currentUserId = data.activeUser.id;

	// Debug data
	console.log('[vaults/+page.svelte] Data received:', {
		vaultsType: Array.isArray(data.vaults),
		vaultsLength: data.vaults?.length,
		vaultsData: data.vaults
	});

	// Group vaults by ownership
	const ownedVaults = $derived(data.vaults.filter(v => v.vault.ownerId === currentUserId));
	const sharedVaults = $derived(data.vaults.filter(v => v.vault.ownerId !== currentUserId));

	function handleEditVault(vaultId: string) {
		goto(`/vaults/${vaultId}/edit`);
	}

	function handleDeleteVault(vaultId: string) {
		if (confirm('Are you sure you want to delete this vault? This action cannot be undone.')) {
			// TODO: Implement delete functionality
			console.log('Delete vault:', vaultId);
		}
	}

	function handleManageMembers(vaultId: string) {
		goto(`/vaults/${vaultId}/members`);
	}

	function handleToggleFavorite(vaultId: string) {
		if (favoriteVaultId === vaultId) {
			// Remove from favorites
			favoriteVaultId = null;
			if (typeof window !== 'undefined') {
				localStorage.removeItem('favoriteVaultId');
			}
		} else {
			// Set as favorite
			favoriteVaultId = vaultId;
			if (typeof window !== 'undefined') {
				localStorage.setItem('favoriteVaultId', vaultId);
			}
		}
	}
</script>

<svelte:head>
	<title>Vaults - Expense Tracker</title>
</svelte:head>

<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
		<div>
			<h1 class="text-2xl font-bold text-foreground flex items-center font-display">
				<Vault class="w-6 h-6 mr-2 text-dark" />
				Vaults
			</h1>
			<p class="mt-1 text-sm text-muted-foreground">Organize your expenses with personal and shared vaults</p>
		</div>
		<div class="flex items-center space-x-3 mt-3 sm:mt-0">
			<!-- View Toggle -->
			<div class="flex items-center border border-border rounded-lg p-1">
				<button
					onclick={() => viewMode = 'grid'}
					class="p-1.5 rounded-md transition-colors {viewMode === 'grid' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}"
					title="Grid view"
				>
					<GridFour size={16} />
				</button>
				<button
					onclick={() => viewMode = 'list'}
					class="p-1.5 rounded-md transition-colors {viewMode === 'list' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}"
					title="List view"
				>
					<List size={16} />
				</button>
			</div>

			<Button onclick={() => goto('/vaults/new')} size="sm">
				<Plus class="w-4 h-4 mr-2" />
				Create Vault
			</Button>
		</div>
	</div>

	<!-- Your Vaults Section -->
	{#if ownedVaults.length > 0}
		<div class="mb-6">
			<h2 class="text-lg font-semibold text-foreground mb-3 flex items-center">
				<span class="w-2.5 h-2.5 bg-dark rounded-full mr-2"></span>
				Your Vaults ({ownedVaults.length})
			</h2>
			{#if viewMode === 'grid'}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each ownedVaults as vaultData}
						<VaultCard
							{...vaultData}
							{currentUserId}
							isFavorite={favoriteVaultId === vaultData.vault.id}
							onEdit={() => handleEditVault(vaultData.vault.id)}
							onDelete={() => handleDeleteVault(vaultData.vault.id)}
							onManageMembers={() => handleManageMembers(vaultData.vault.id)}
							onToggleFavorite={() => handleToggleFavorite(vaultData.vault.id)}
						/>
					{/each}
				</div>
			{:else}
				<div class="bg-background rounded-lg border border-border overflow-hidden">
					<table class="w-full">
						<thead class="bg-muted/30 border-b border-border">
							<tr>
								<th class="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Vault</th>
								<th class="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Owner</th>
								<th class="py-3 px-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each ownedVaults as vaultData}
								<VaultListItem
									{...vaultData}
									{currentUserId}
									isFavorite={favoriteVaultId === vaultData.vault.id}
									onEdit={() => handleEditVault(vaultData.vault.id)}
									onDelete={() => handleDeleteVault(vaultData.vault.id)}
									onManageMembers={() => handleManageMembers(vaultData.vault.id)}
									onToggleFavorite={() => handleToggleFavorite(vaultData.vault.id)}
								/>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Shared Vaults Section -->
	{#if sharedVaults.length > 0}
		<div class="mb-6">
			<h2 class="text-lg font-semibold text-foreground mb-3 flex items-center">
				<span class="w-2.5 h-2.5 bg-tertiary rounded-full mr-2"></span>
				Shared with You ({sharedVaults.length})
			</h2>
			{#if viewMode === 'grid'}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each sharedVaults as vaultData}
						<VaultCard
							{...vaultData}
							{currentUserId}
							isFavorite={favoriteVaultId === vaultData.vault.id}
							onEdit={() => handleEditVault(vaultData.vault.id)}
							onDelete={() => handleDeleteVault(vaultData.vault.id)}
							onManageMembers={() => handleManageMembers(vaultData.vault.id)}
							onToggleFavorite={() => handleToggleFavorite(vaultData.vault.id)}
						/>
					{/each}
				</div>
			{:else}
				<div class="bg-background rounded-lg border border-border overflow-hidden">
					<table class="w-full">
						<thead class="bg-muted/30 border-b border-border">
							<tr>
								<th class="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Vault</th>
								<th class="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Owner</th>
								<th class="py-3 px-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each sharedVaults as vaultData}
								<VaultListItem
									{...vaultData}
									{currentUserId}
									isFavorite={favoriteVaultId === vaultData.vault.id}
									onEdit={() => handleEditVault(vaultData.vault.id)}
									onDelete={() => handleDeleteVault(vaultData.vault.id)}
									onManageMembers={() => handleManageMembers(vaultData.vault.id)}
									onToggleFavorite={() => handleToggleFavorite(vaultData.vault.id)}
								/>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Compact Vault Stats Overview -->
	<div class="grid grid-cols-3 gap-3 mb-6">
		<div class="bg-dark text-background rounded-lg p-4 shadow-sm">
			<div class="text-center">
				<p class="text-2xl font-bold">{data.vaults.length}</p>
				<p class="text-xs text-background/70">Total</p>
			</div>
		</div>
		<div class="bg-accent text-accent-foreground rounded-lg p-4 shadow-sm">
			<div class="text-center">
				<p class="text-2xl font-bold">{ownedVaults.length}</p>
				<p class="text-xs text-accent-foreground/70">Owned</p>
			</div>
		</div>
		<div class="bg-tertiary text-background rounded-lg p-4 shadow-sm">
			<div class="text-center">
				<p class="text-2xl font-bold">{sharedVaults.length}</p>
				<p class="text-xs text-background/70">Shared</p>
			</div>
		</div>
	</div>

	<!-- Empty State -->
	{#if data.vaults.length === 0}
		<div class="text-center py-12">
			<Vault class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
			<h3 class="text-lg font-medium text-foreground mb-2">No vaults yet</h3>
			<p class="text-muted-foreground mb-6">Create your first vault to start organizing your expenses</p>
			<Button onclick={() => goto('/vaults/new')}>
				<Plus class="w-4 h-4 mr-2" />
				Create Your First Vault
			</Button>
		</div>
	{/if}

</div>