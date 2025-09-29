<script lang="ts">
	import { ArrowDown, Vault, Plus } from 'phosphor-svelte';
	import { useVaultStore } from '$lib/stores/vault.svelte.js';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	const vaultStore = useVaultStore();

	let showDropdown = $state(false);

	function selectVault(vaultId: string) {
		const vault = vaultStore.availableVaults.find(v => v.id === vaultId);
		if (vault) {
			vaultStore.setCurrentVault(vault);
			showDropdown = false;

			// Update URL to include vault ID
			const currentPath = $page.url.pathname;
			const pathSegments = currentPath.split('/').filter(Boolean);

			// If already in a vault path, replace the vault ID
			if (pathSegments.length > 0 && pathSegments[0] === 'vault') {
				pathSegments[1] = vaultId;
			} else {
				// Add vault prefix to path
				pathSegments.unshift('vault', vaultId);
			}

			goto(`/${pathSegments.join('/')}`);
		}
	}

	function createNewVault() {
		showDropdown = false;
		goto('/vaults/new');
	}

	function closeDropdown() {
		showDropdown = false;
	}
</script>

<svelte:window onclick={closeDropdown} />

<div class="relative">
	<button
		onclick={(e) => {
			e.stopPropagation();
			showDropdown = !showDropdown;
		}}
		class="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
	>
		{#if vaultStore.currentVault}
			<span class="text-lg mr-1">{vaultStore.currentVault.icon}</span>
			<span class="truncate max-w-32">{vaultStore.currentVault.name}</span>
		{:else}
			<Vault class="w-4 h-4" />
			<span>Select Vault</span>
		{/if}
		<ArrowDown class="w-4 h-4 text-gray-400" />
	</button>

	{#if showDropdown}
		<div class="absolute z-50 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg">
			<div class="py-1">
				{#if vaultStore.availableVaults.length === 0}
					<div class="px-4 py-2 text-sm text-gray-500">No vaults available</div>
				{:else}
					{#each vaultStore.availableVaults as vault}
						<button
							onclick={() => selectVault(vault.id)}
							class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-3 transition-colors {vaultStore.currentVault?.id === vault.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}"
						>
							<span class="text-lg">{vault.icon}</span>
							<div class="flex-1 min-w-0">
								<div class="font-medium truncate">{vault.name}</div>
								{#if vault.description}
									<div class="text-xs text-gray-500 truncate">{vault.description}</div>
								{/if}
							</div>
							{#if vault.role}
								<span class="text-xs px-2 py-1 rounded-full {vault.role === 'owner' ? 'bg-purple-100 text-purple-700' : vault.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}">
									{vault.role}
								</span>
							{/if}
						</button>
					{/each}
				{/if}

				<hr class="my-1" />

				<button
					onclick={createNewVault}
					class="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center space-x-3 transition-colors"
				>
					<Plus class="w-4 h-4" />
					<span>Create New Vault</span>
				</button>
			</div>
		</div>
	{/if}
</div>