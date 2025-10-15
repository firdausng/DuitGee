<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Label from '$lib/components/ui/Label.svelte';

	interface Vault {
		id: string;
		name: string;
		description?: string | null;
		icon?: string;
		isPersonal: boolean;
	}

	interface Props {
		vaults: Vault[];
		teamName: string;
		onSubmit: (data: { vaultId: string }) => Promise<void>;
		onCancel: () => void;
		isSubmitting?: boolean;
	}

	let {
		vaults,
		teamName,
		onSubmit,
		onCancel,
		isSubmitting = false
	}: Props = $props();

	let selectedVaultId = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!selectedVaultId) {
			alert('Please select a vault');
			return;
		}

		await onSubmit({
			vaultId: selectedVaultId
		});
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	<!-- Team Info -->
	<div class="bg-muted/30 rounded-lg p-3 mb-4">
		<p class="text-sm text-muted-foreground">Attaching vault to team:</p>
		<p class="text-base font-semibold text-foreground mt-1">{teamName}</p>
	</div>

	<!-- Vault Selection -->
	<div class="space-y-2">
		<Label for="vault-select">Select Vault <span class="text-destructive">*</span></Label>

		{#if vaults.length === 0}
			<div class="text-center py-8 bg-muted/20 rounded-lg">
				<p class="text-sm text-muted-foreground">No vaults available</p>
				<p class="text-xs text-muted-foreground mt-1">Create a vault first to attach it to this team</p>
			</div>
		{:else}
			<div class="space-y-2 max-h-64 overflow-y-auto">
				{#each vaults as vault}
					<label
						class="flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 {selectedVaultId === vault.id ? 'border-primary bg-primary/5' : 'border-border'}"
					>
						<input
							type="radio"
							name="vault"
							value={vault.id}
							bind:group={selectedVaultId}
							disabled={isSubmitting}
							class="mt-1"
						/>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2">
								{#if vault.icon}
									<span class="text-lg">{vault.icon}</span>
								{/if}
								<p class="font-medium text-foreground truncate">{vault.name}</p>
								{#if vault.isPersonal}
									<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
										Personal
									</span>
								{:else}
									<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
										Shared
									</span>
								{/if}
							</div>
							{#if vault.description}
								<p class="text-xs text-muted-foreground mt-1 truncate">{vault.description}</p>
							{/if}
						</div>
					</label>
				{/each}
			</div>
		{/if}

		<p class="text-xs text-muted-foreground">
			Select a vault to attach to this team. Team members will be able to access this vault.
		</p>
	</div>

	<!-- Action Buttons -->
	<div class="flex gap-3 justify-end pt-4">
		<Button
			type="button"
			variant="outline"
			onclick={onCancel}
			disabled={isSubmitting}
		>
			Cancel
		</Button>
		<Button
			type="submit"
			disabled={isSubmitting || !selectedVaultId || vaults.length === 0}
		>
			{isSubmitting ? 'Attaching...' : 'Attach Vault'}
		</Button>
	</div>
</form>
