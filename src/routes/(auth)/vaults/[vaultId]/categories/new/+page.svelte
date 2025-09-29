<script lang="ts">
	import CategoryForm from '$lib/components/CategoryForm.svelte';
	import { goto } from '$app/navigation';

	let { data } = $props();

	function handleSuccess() {
		goto('/categories');
	}

	function handleCancel() {
		goto('/categories');
	}
</script>

<svelte:head>
	<title>New Category - Expense Tracker</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">Add New Category</h1>
		<p class="mt-2 text-gray-600">Create a new category to organize your expenses</p>
	</div>

	<!-- Form -->
	<div class="bg-white rounded-lg shadow p-6">
		<CategoryForm
                formData={data.form}
		/>
	</div>
</div>