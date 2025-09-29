<script lang="ts">
	import CategoryGroupForm from '$lib/components/CategoryGroupForm.svelte';
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
	<title>Edit Category Group - Expense Tracker</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">Edit Category Group</h1>
		<p class="mt-2 text-gray-600">Update your category group details</p>
	</div>

	<!-- Form -->
	<div class="bg-white rounded-lg shadow p-6">
		<CategoryGroupForm
			formData={data.form}
			isEdit={true}
		/>
	</div>
</div>