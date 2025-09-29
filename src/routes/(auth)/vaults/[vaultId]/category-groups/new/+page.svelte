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
	<title>New Category Group - Expense Tracker</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">Create Category Group</h1>
		<p class="mt-2 text-gray-600">
			Create a group to organize related categories together. For example, create a "Bills" group for Electric Bill, Gas Bill, Water Bill, etc.
		</p>
	</div>

	<!-- Form -->
	<div class="bg-white rounded-lg shadow p-6">
		<CategoryGroupForm
			formData={data.form}
		/>
	</div>

	<!-- Examples Section -->
	<div class="mt-8 bg-blue-50 rounded-lg p-6">
		<h3 class="text-lg font-medium text-blue-900 mb-4">💡 Example Category Groups</h3>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
			<div>
				<div class="font-medium text-blue-800 mb-2">📊 Bills</div>
				<ul class="text-blue-700 space-y-1 ml-4">
					<li>• Electric Bill</li>
					<li>• Gas Bill</li>
					<li>• Water Bill</li>
					<li>• Internet Bill</li>
				</ul>
			</div>
			<div>
				<div class="font-medium text-blue-800 mb-2">🚗 Transportation</div>
				<ul class="text-blue-700 space-y-1 ml-4">
					<li>• Gas/Fuel</li>
					<li>• Parking</li>
					<li>• Public Transit</li>
					<li>• Car Maintenance</li>
				</ul>
			</div>
			<div>
				<div class="font-medium text-blue-800 mb-2">🍔 Food & Dining</div>
				<ul class="text-blue-700 space-y-1 ml-4">
					<li>• Groceries</li>
					<li>• Restaurants</li>
					<li>• Coffee</li>
					<li>• Takeout</li>
				</ul>
			</div>
			<div>
				<div class="font-medium text-blue-800 mb-2">🎬 Entertainment</div>
				<ul class="text-blue-700 space-y-1 ml-4">
					<li>• Movies</li>
					<li>• Streaming Services</li>
					<li>• Games</li>
					<li>• Events</li>
				</ul>
			</div>
		</div>
	</div>
</div>