<script lang="ts">
	import EditExpenseForm from '$lib/components/EditExpenseForm.svelte';
	import { goto } from '$app/navigation';

	let { data } = $props();

	function handleCancel() {
		goto(`/vaults/${data.vaultId}/expenses`);
	}
    console.log(data.expense)

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
		<EditExpenseForm
			data={data.form}
			categories={data.categories}
			paymentTypes={data.paymentTypes}
			paymentProviders={data.paymentProviders}
			members={data.members}
			currentUserId={data.currentUserId}
			vaultId={data.vaultId}
            expenseId={data.expense.id}
			onCancel={handleCancel}
		/>
	</div>
</div>