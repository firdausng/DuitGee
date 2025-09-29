<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';

	let { data } = $props();

	function handleNewUser() {
		goto('/users/new');
	}

	function handleEditUser(userId: string) {
		goto(`/users/${userId}/edit`);
	}

	function handleDeleteUser(userId: string, userName: string) {
		if (confirm(`Are you sure you want to delete user "${userName}"?`)) {
			// TODO: Implement delete functionality
			console.log('Delete user:', userId);
		}
	}

	function formatDate(date: Date | string) {
		const d = new Date(date);
		return d.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Users - Expense Tracker</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="flex justify-between items-center mb-8">
		<div>
			<h1 class="text-3xl font-bold text-foreground font-display">Users</h1>
			<p class="mt-2 text-muted-foreground">Manage system users</p>
		</div>
		<Button onclick={handleNewUser}>
			Add New User
		</Button>
	</div>

	<!-- Users List -->
	<div class="bg-background border border-border shadow-sm rounded-lg overflow-hidden">
		{#if data.users && data.users.length > 0}
			<table class="min-w-full divide-y divide-border">
				<thead class="bg-muted/30">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
							Name
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
							Email
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
							Created
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
							Actions
						</th>
					</tr>
				</thead>
				<tbody class="bg-background divide-y divide-border">
					{#each data.users as user}
						<tr class="hover:bg-accent/50 transition-colors">
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm font-medium text-foreground">
									{user.name}
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-muted-foreground">
									{user.email}
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-muted-foreground">
									{formatDate(user.createdAt)}
								</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
								<div class="flex gap-2">
									<button
										onclick={() => handleEditUser(user.id)}
										class="text-primary hover:text-primary/80 transition-colors"
									>
										Edit
									</button>
									<button
										onclick={() => handleDeleteUser(user.id, user.name)}
										class="text-destructive hover:text-destructive/80 transition-colors"
									>
										Delete
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>

			<!-- Pagination -->
			{#if data.pagination && data.pagination.pages > 1}
				<div class="bg-background px-4 py-3 flex items-center justify-between border-t border-border sm:px-6">
					<div class="flex-1 flex justify-between sm:hidden">
						{#if data.pagination.page > 1}
							<a href="?page={data.pagination.page - 1}" class="relative inline-flex items-center px-4 py-2 border border-input text-sm font-medium rounded-md text-foreground bg-background hover:bg-accent transition-colors">
								Previous
							</a>
						{/if}
						{#if data.pagination.page < data.pagination.pages}
							<a href="?page={data.pagination.page + 1}" class="ml-3 relative inline-flex items-center px-4 py-2 border border-input text-sm font-medium rounded-md text-foreground bg-background hover:bg-accent transition-colors">
								Next
							</a>
						{/if}
					</div>
					<div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
						<div>
							<p class="text-sm text-muted-foreground">
								Showing page <span class="font-medium text-foreground">{data.pagination.page}</span> of <span class="font-medium text-foreground">{data.pagination.pages}</span>
								(<span class="font-medium text-foreground">{data.pagination.total}</span> total users)
							</p>
						</div>
						<div>
							<nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
								{#if data.pagination.page > 1}
									<a href="?page={data.pagination.page - 1}" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-input bg-background text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
										Previous
									</a>
								{/if}
								{#if data.pagination.page < data.pagination.pages}
									<a href="?page={data.pagination.page + 1}" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-input bg-background text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
										Next
									</a>
								{/if}
							</nav>
						</div>
					</div>
				</div>
			{/if}
		{:else}
			<div class="text-center py-12">
				<svg class="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.196-2.196M17 20v-2a3 3 0 00-5.196-2.196M17 20H7m10 0v-2a3 3 0 00-5.196-2.196M17 20H7m0 0v-2a3 3 0 00-5.196-2.196M7 20v-2a3 3 0 00-5.196-2.196M7 20v-2a3 3 0 00-5.196-2.196M12 4.5v15m0 0l3-3m-3 3l-3-3" />
				</svg>
				<h3 class="mt-2 text-sm font-medium text-foreground">No users</h3>
				<p class="mt-1 text-sm text-muted-foreground">Get started by creating a new user.</p>
				<div class="mt-6">
					<Button onclick={handleNewUser}>
						Add New User
					</Button>
				</div>
			</div>
		{/if}
	</div>
</div>