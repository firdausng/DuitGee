<script lang="ts">
	import UserForm from '$lib/components/UserForm.svelte';
	import { goto } from '$app/navigation';

	let { data } = $props();

	function handleSuccess() {
		goto('/users');
	}

	function handleCancel() {
		goto('/users');
	}
</script>

<svelte:head>
	<title>Edit User - Expense Tracker</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">Edit User</h1>
		<p class="mt-2 text-gray-600">Update user details</p>
	</div>

	<!-- Form -->
	<div class="bg-white rounded-lg shadow p-6">
		<UserForm
			formData={data.form}
			isEdit={true}
		/>
	</div>
</div>