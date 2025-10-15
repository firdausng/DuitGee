<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Label from '$lib/components/ui/Label.svelte';

	interface Vault {
		id: string;
		name: string;
		description?: string | null;
		icon?: string;
		isPersonal: boolean;
		teamId?: string | null;
	}

	interface Team {
		id: string;
		name: string;
		createdAt?: string | Date;
		updatedAt?: string | Date;
		metadata?: {
			vaultIds?: string[];
			[key: string]: any;
		};
	}

	interface Props {
		team: Team;
		vaults: Vault[];
		currentVaultId?: string | null;
		onSubmit: (data: { name: string; vaultId?: string | null }) => Promise<void>;
		onCancel: () => void;
		isSubmitting?: boolean;
	}

	let {
		team,
		vaults = [],
		currentVaultId = null,
		onSubmit,
		onCancel,
		isSubmitting = false
	}: Props = $props();

	let teamName = $state(team.name);
	let selectedVaultId = $state<string | null | undefined>(currentVaultId);

	// Filter vaults to show only those not attached to other teams (or attached to current team)
	let availableVaults = $derived(
		vaults.filter(v => !v.teamId || v.teamId === team.id)
	);

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!teamName.trim()) {
			alert('Team name is required');
			return;
		}

		await onSubmit({
			name: teamName.trim(),
			vaultId: selectedVaultId
		});
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	<!-- Team Name -->
	<div class="space-y-2">
		<Label for="team-name">Team Name <span class="text-destructive">*</span></Label>
		<Input
			id="team-name"
			bind:value={teamName}
			placeholder="e.g., Engineering Team"
			disabled={isSubmitting}
		/>
		<p class="text-xs text-muted-foreground">The display name for your team</p>
	</div>

	<!-- Vault Selection -->
	<div class="space-y-2">
		<Label>Attached Vault</Label>
		{#if availableVaults.length === 0}
			<div class="text-center py-4 bg-muted/20 rounded-lg">
				<p class="text-sm text-muted-foreground">No vaults available</p>
				<p class="text-xs text-muted-foreground mt-1">All vaults are already attached to other teams</p>
			</div>
		{:else}
			<div class="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
				<!-- None option -->
				<label
					class="flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 {selectedVaultId === null ? 'bg-muted/30 border border-primary' : ''}"
				>
					<input
						type="radio"
						name="vault"
						value={null}
						bind:group={selectedVaultId}
						disabled={isSubmitting}
						class="mt-1"
					/>
					<div class="flex-1 min-w-0">
						<p class="font-medium text-foreground text-sm">No vault</p>
						<p class="text-xs text-muted-foreground">Remove vault attachment from this team</p>
					</div>
				</label>

				<!-- Vault options -->
				{#each availableVaults as vault}
					<label
						class="flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 {selectedVaultId === vault.id ? 'border border-primary bg-primary/5' : 'border border-transparent'}"
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
									<span class="text-base">{vault.icon}</span>
								{/if}
								<p class="font-medium text-foreground text-sm truncate">{vault.name}</p>
								{#if vault.isPersonal}
									<span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
										Personal
									</span>
								{:else}
									<span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
										Shared
									</span>
								{/if}
								{#if vault.teamId === team.id}
									<span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
										Current
									</span>
								{/if}
							</div>
							{#if vault.description}
								<p class="text-xs text-muted-foreground mt-0.5 truncate">{vault.description}</p>
							{/if}
						</div>
					</label>
				{/each}
			</div>
		{/if}
		<p class="text-xs text-muted-foreground">
			Update the vault attached to this team. Team members will be able to access this vault.
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
			disabled={isSubmitting || !teamName.trim()}
		>
			{isSubmitting ? 'Updating...' : 'Update Team'}
		</Button>
	</div>
</form>
