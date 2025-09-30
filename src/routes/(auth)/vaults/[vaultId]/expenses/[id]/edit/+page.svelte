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
	<title>Edit Expense - Expense Tracker</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-foreground font-display">Edit Expense</h1>
		<p class="mt-2 text-muted-foreground">Update your expense details</p>
	</div>

	<!-- Form -->
	<div class="bg-background rounded-lg border border-border shadow-sm p-6">
		<ExpenseForm
			data={data.form}
			categories={data.categories}
			isEdit={true}
			vaultId={data.vaultId}
		/>
	</div>
</div>