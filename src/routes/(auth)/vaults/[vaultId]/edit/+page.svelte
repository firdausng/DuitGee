<script lang="ts">
	import EditVaultForm from '$lib/components/EditVaultForm.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { goto } from '$app/navigation';
	import Trash from 'phosphor-svelte/lib/Trash';
    import {ofetch} from "ofetch";

	let { data } = $props();

	async function handleDelete() {
		// if (data.vault.isPersonal) {
		// 	alert('Personal vaults cannot be deleted.');
		// 	return;
		// }

		if (confirm(`Are you sure you want to delete "${data.vault.name}"? This action cannot be undone and will remove all associated expenses.`)) {
			// TODO: Implement delete functionality
			console.log('Delete vault:', data.vault.id);
            await ofetch(`/api/vaults/${data.vault.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            await goto("/vaults")
		}
	}
</script>

<svelte:head>
	<title>Edit {data.vault.name} - DuitGee</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-foreground font-display">Edit Vault</h1>
		<p class="mt-2 text-muted-foreground">
			{#if data.vault.isPersonal}
				Edit your personal vault. Note: Personal vaults cannot be renamed or deleted.
			{:else}
				Edit your shared vault details.
			{/if}
		</p>
	</div>

	<div class="space-y-6">
		<Card class="p-6">
			<EditVaultForm formData={data.form} vault={data.vault} />
		</Card>

		{#if !data.vault.isPersonal}
			<!-- Danger Zone -->
			<Card class="p-6 border-destructive">
				<div class="space-y-4">
					<div>
						<h3 class="text-lg font-medium text-destructive">Danger Zone</h3>
						<p class="text-sm text-muted-foreground">
							Once you delete a vault, there is no going back. All expenses in this vault will be permanently deleted.
						</p>
					</div>
					<Button
						variant="destructive"
						onclick={handleDelete}
						class="w-full sm:w-auto"
					>
						<Trash class="w-4 h-4 mr-2" />
						Delete Vault
					</Button>
				</div>
			</Card>
		{/if}
	</div>
</div>
