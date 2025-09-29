<script lang="ts">
	import VaultForm from '$lib/components/VaultForm.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Create New Vault - DuitGee</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-foreground font-display">Create New Vault</h1>
		<p class="mt-2 text-muted-foreground">
			Create a new vault to organize your expenses. You can make it personal or share it with others.
		</p>
	</div>

	<Card class="p-6">
		<VaultForm formData={data.form} isEdit={false} />
	</Card>
</div>