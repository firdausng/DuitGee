<script lang="ts">
	import ExpenseForm from '$lib/components/ExpenseForm.svelte';
	import { goto } from '$app/navigation';

	let { data } = $props();

	function handleSuccess() {
		goto(`/vaults/${data.vaultId}/expenses`);
	}

	function handleCancel() {
		goto(`/vaults/${data.vaultId}/expenses`);
	}
</script>

<svelte:head>
	<title>New Expense - Expense Tracker</title>
</svelte:head>

<div class="max-w-lg mx-auto px-4 py-4">
	<!-- Header -->
	<div class="mb-4">
		<h1 class="text-lg font-semibold text-foreground">Add Expense</h1>
	</div>

	<!-- Form -->
	<div class="bg-background rounded-lg border border-border p-4">
		<ExpenseForm
			data={data.form}
			categories={data.categories}
			tags={data.tags}
			templates={data.templates}
			members={data.members}
			paymentTypes={data.paymentTypes}
			paymentProviders={data.paymentProviders}
			currentUserId={data.currentUserId}
			vaultId={data.vaultId}
		/>
	</div>
</div>