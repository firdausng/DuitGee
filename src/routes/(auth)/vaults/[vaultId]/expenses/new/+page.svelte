<script lang="ts">
	import ExpenseForm from '$lib/components/ExpenseForm.svelte';
	import { goto } from '$app/navigation';

	let { data } = $props();

	// Mock categories - replace with actual data from load function
	// const categories = [
	// 	{ id: '1', name: 'Food', color: '#10B981' },
	// 	{ id: '2', name: 'Transportation', color: '#F59E0B' },
	// 	{ id: '3', name: 'Entertainment', color: '#8B5CF6' },
	// 	{ id: '4', name: 'Shopping', color: '#EC4899' },
	// 	{ id: '5', name: 'Bills', color: '#EF4444' }
	// ];

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
			vaultId={data.vaultId}
		/>
	</div>
</div>