<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import IconDisplay from '$lib/components/IconDisplay.svelte';
	import Plus from 'phosphor-svelte/lib/Plus';
	import Pencil from 'phosphor-svelte/lib/Pencil';
	import Trash from 'phosphor-svelte/lib/Trash';
	import Folder from 'phosphor-svelte/lib/Folder';
	import GridFour from 'phosphor-svelte/lib/GridFour';
	import List from 'phosphor-svelte/lib/List';
    import {page} from "$app/state";
    import {goto} from "$app/navigation";

	// View mode state
	let viewMode = $state('table'); // 'table' or 'cards'

	let { data } = $props();
    let searchTerm = $state(page.url.searchParams.get('search') || '');

    const publicCategories = $derived(data.categories.filter(c => c.isPublic));
    const customCategories = $derived(data.categories.filter(c => !c.isPublic));
	// Mock categories - replace with actual data from load function
	// let categories = [
	// 	{ id: '1', name: 'Food', color: '#10B981' },
	// 	{ id: '2', name: 'Transportation', color: '#F59E0B' },
	// 	{ id: '3', name: 'Entertainment', color: '#8B5CF6' },
	// 	{ id: '4', name: 'Shopping', color: '#EC4899' },
	// 	{ id: '5', name: 'Bills', color: '#EF4444' },
	// 	{ id: '6', name: 'Healthcare', color: '#06B6D4' },
	// 	{ id: '7', name: 'Education', color: '#84CC16' },
	// 	{ id: '8', name: 'Travel', color: '#F97316' }
	// ];

    // let categoryFilter = $derived(data.categories.filter(category => category.name.toLowerCase().includes(data.search.toLowerCase())));

    // let filteredCategories = $derived.by(() => {
    //     return data.categories.filter((category) => {
    //         const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //             category.color.toLowerCase().includes(searchTerm.toLowerCase());
    //         const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    //         return matchesSearch && matchesCategory;
    //     });
    // });

	function deleteCategory(id: string) {
		// if (confirm('Are you sure you want to delete this category? All associated expenses will be affected.')) {
		// 	categories = categories.filter((c) => c.id !== id);
		// }
	}
</script>

<svelte:head>
	<title>Categories - Expense Tracker</title>
</svelte:head>

<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
	<!-- Compact Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
		<div>
			<h1 class="text-2xl font-bold text-foreground flex items-center font-display">
				<Folder class="w-6 h-6 mr-2 text-primary" />
				Categories
			</h1>
			<p class="mt-1 text-sm text-muted-foreground">Organize your expenses with categories and groups</p>
		</div>
		<div class="flex items-center space-x-3 mt-3 sm:mt-0">
			<!-- View Toggle -->
			<div class="flex items-center border border-border rounded-lg p-1">
				<button
					onclick={() => viewMode = 'table'}
					class="p-1.5 rounded-md transition-colors {viewMode === 'table' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}"
					title="Table view"
				>
					<List size={16} />
				</button>
				<button
					onclick={() => viewMode = 'cards'}
					class="p-1.5 rounded-md transition-colors {viewMode === 'cards' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}"
					title="Card view"
				>
					<GridFour size={16} />
				</button>
			</div>

			<Button
				variant="outline"
				size="sm"
				onclick={() => goto(`/vaults/${data.vaultId}/category-groups/new`)}
			>
				<Folder class="w-4 h-4 mr-2" />
				Create Group
			</Button>
			<Button size="sm" onclick={() => goto(`/vaults/${data.vaultId}/categories/new`)}>
				<Plus class="w-4 h-4 mr-2" />
				Add Category
			</Button>
		</div>
	</div>


	<!-- Public Categories Section -->
	{#if publicCategories.length > 0}
		<div class="mb-6">
			<h2 class="text-lg font-semibold text-foreground mb-3 flex items-center">
				<span class="w-2.5 h-2.5 bg-primary rounded-full mr-2"></span>
				Public Categories ({publicCategories.length})
			</h2>
			<p class="text-sm text-muted-foreground mb-4">These categories are available to all users and cannot be modified.</p>

			{#if viewMode === 'table'}
				<!-- Desktop Table View -->
				<div class="hidden md:block bg-background rounded-lg border border-border overflow-hidden">
					<table class="w-full">
						<thead class="bg-muted/30 border-b border-border">
							<tr>
								<th class="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
								<th class="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Group</th>
								<th class="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
								<th class="py-3 px-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Usage</th>
								<th class="py-3 px-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border">
							{#each publicCategories as category}
								<tr class="hover:bg-accent/50 transition-colors">
									<td class="py-3 px-4">
										<div class="flex items-center space-x-3">
											<div class="w-4 h-4 rounded-full" style="background-color: {category.color}"></div>
											{#if category.icon}
												<IconDisplay icon={category.icon} iconType={(category.iconType as 'emoji' | 'phosphor') || 'emoji'} size="sm" />
											{/if}
											<span class="font-medium text-foreground">{category.name}</span>
										</div>
									</td>
									<td class="py-3 px-4 text-sm text-muted-foreground">
										{#if category.group}
											<div class="flex items-center space-x-1">
												<IconDisplay icon={category.group.icon || '📂'} iconType={(category.group.iconType as 'emoji' | 'phosphor') || 'emoji'} size="sm" />
												<span>{category.group.name}</span>
											</div>
										{:else}
											<span class="text-muted-foreground/60">—</span>
										{/if}
									</td>
									<td class="py-3 px-4">
										<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
											Public
										</span>
									</td>
									<td class="py-3 px-4 text-right text-sm text-muted-foreground">
										<div>12 expenses</div>
										<div class="text-xs">$1,234.56</div>
									</td>
									<td class="py-3 px-4 text-right">
										<span class="text-xs text-muted-foreground px-2 py-1">Read-only</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Mobile Compact Cards -->
				<div class="md:hidden space-y-2">
					{#each publicCategories as category}
						<div class="bg-background rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors">
							<div class="flex items-center justify-between">
								<div class="flex items-center space-x-2 flex-1 min-w-0">
									<div class="w-3 h-3 rounded-full" style="background-color: {category.color}"></div>
									{#if category.icon}
										<IconDisplay icon={category.icon} iconType={(category.iconType as 'emoji' | 'phosphor') || 'emoji'} size="sm" />
									{/if}
									<div class="flex-1 min-w-0">
										<div class="flex items-center space-x-2">
											<span class="font-medium text-foreground truncate">{category.name}</span>
											<span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary flex-shrink-0">
												Public
											</span>
										</div>
										{#if category.group}
											<div class="flex items-center space-x-1 text-xs text-muted-foreground">
												<IconDisplay icon={category.group.icon || '📂'} iconType={(category.group.iconType as 'emoji' | 'phosphor') || 'emoji'} size="xs" />
												<span class="truncate">{category.group.name}</span>
											</div>
										{/if}
									</div>
								</div>
								<div class="text-right text-xs text-muted-foreground">
									<div>12 exp</div>
									<div>$1.2k</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<!-- Card View -->
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each publicCategories as category}
						<div class="bg-background rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors">
							<div class="flex items-center justify-between mb-3">
								<div class="flex items-center space-x-3">
									<div class="flex items-center space-x-2">
										<div class="w-5 h-5 rounded-full" style="background-color: {category.color}"></div>
										{#if category.icon}
											<IconDisplay icon={category.icon} iconType={(category.iconType as 'emoji' | 'phosphor') || 'emoji'} size="md" />
										{/if}
									</div>
									<div>
										<div class="flex items-center space-x-2">
											<h3 class="font-medium text-foreground">{category.name}</h3>
											<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
												Public
											</span>
										</div>
										{#if category.group}
											<p class="text-sm text-muted-foreground flex items-center space-x-1">
												<IconDisplay icon={category.group.icon || '📂'} iconType={(category.group.iconType as 'emoji' | 'phosphor') || 'emoji'} size="sm" />
												<span>{category.group.name}</span>
											</p>
										{/if}
									</div>
								</div>
								<span class="text-xs text-muted-foreground px-2 py-1">Read-only</span>
							</div>
							<div class="text-sm text-muted-foreground">
								<p>12 expenses • $1,234.56</p>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Custom Categories Section -->
	{#if customCategories.length > 0}
		<div class="mb-6">
			<h2 class="text-lg font-semibold text-foreground mb-3 flex items-center">
				<span class="w-2.5 h-2.5 bg-accent rounded-full mr-2"></span>
				Your Custom Categories ({customCategories.length})
			</h2>
			<p class="text-sm text-muted-foreground mb-4">Categories you've created for your personal use.</p>

			{#if viewMode === 'table'}
				<!-- Desktop Table View -->
				<div class="hidden md:block bg-background rounded-lg border border-border overflow-hidden">
					<table class="w-full">
						<thead class="bg-muted/30 border-b border-border">
							<tr>
								<th class="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
								<th class="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Group</th>
								<th class="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
								<th class="py-3 px-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Usage</th>
								<th class="py-3 px-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border">
							{#each customCategories as category}
								<tr class="hover:bg-accent/50 transition-colors">
									<td class="py-3 px-4">
										<div class="flex items-center space-x-3">
											<div class="w-4 h-4 rounded-full" style="background-color: {category.color}"></div>
											{#if category.icon}
												<IconDisplay icon={category.icon} iconType={(category.iconType as 'emoji' | 'phosphor') || 'emoji'} size="sm" />
											{/if}
											<span class="font-medium text-foreground">{category.name}</span>
										</div>
									</td>
									<td class="py-3 px-4 text-sm text-muted-foreground">
										{#if category.group}
											<div class="flex items-center space-x-1">
												<IconDisplay icon={category.group.icon || '📂'} iconType={(category.group.iconType as 'emoji' | 'phosphor') || 'emoji'} size="sm" />
												<span>{category.group.name}</span>
												{#if category.group.isPublic}
													<span class="text-xs text-primary">(Public)</span>
												{/if}
											</div>
										{:else}
											<span class="text-muted-foreground/60">—</span>
										{/if}
									</td>
									<td class="py-3 px-4">
										<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/50 text-accent-foreground">
											Custom
										</span>
									</td>
									<td class="py-3 px-4 text-right text-sm text-muted-foreground">
										<div>12 expenses</div>
										<div class="text-xs">$1,234.56</div>
									</td>
									<td class="py-3 px-4 text-right">
										<div class="flex justify-end space-x-1">
											<Button
												variant="ghost"
												size="sm"
												onclick={() => goto(`/vaults/${data.vaultId}/categories/${category.id}/edit`)}
											>
												<Pencil class="w-4 h-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onclick={() => deleteCategory(category.id)}
											>
												<Trash class="w-4 h-4 text-destructive" />
											</Button>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Mobile Compact Cards -->
				<div class="md:hidden space-y-2">
					{#each customCategories as category}
						<div class="bg-background rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors">
							<div class="flex items-center justify-between">
								<div class="flex items-center space-x-2 flex-1 min-w-0">
									<div class="w-3 h-3 rounded-full" style="background-color: {category.color}"></div>
									{#if category.icon}
										<IconDisplay icon={category.icon} iconType={(category.iconType as 'emoji' | 'phosphor') || 'emoji'} size="sm" />
									{/if}
									<div class="flex-1 min-w-0">
										<div class="flex items-center space-x-2">
											<span class="font-medium text-foreground truncate">{category.name}</span>
											<span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-accent/50 text-accent-foreground flex-shrink-0">
												Custom
											</span>
										</div>
										{#if category.group}
											<div class="flex items-center space-x-1 text-xs text-muted-foreground">
												<IconDisplay icon={category.group.icon || '📂'} iconType={(category.group.iconType as 'emoji' | 'phosphor') || 'emoji'} size="xs" />
												<span class="truncate">{category.group.name}</span>
												{#if category.group.isPublic}
													<span class="text-primary">(Public)</span>
												{/if}
											</div>
										{/if}
									</div>
								</div>
								<div class="flex items-center space-x-2">
									<div class="text-right text-xs text-muted-foreground">
										<div>12 exp</div>
										<div>$1.2k</div>
									</div>
									<div class="flex space-x-1">
										<Button
											variant="ghost"
											size="sm"
											onclick={() => goto(`/vaults/${data.vaultId}/categories/${category.id}/edit`)}
										>
											<Pencil class="w-3 h-3" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onclick={() => deleteCategory(category.id)}
										>
											<Trash class="w-3 h-3 text-destructive" />
										</Button>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<!-- Card View -->
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each customCategories as category}
						<div class="bg-background rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors">
							<div class="flex items-center justify-between mb-3">
								<div class="flex items-center space-x-3">
									<div class="flex items-center space-x-2">
										<div class="w-5 h-5 rounded-full" style="background-color: {category.color}"></div>
										{#if category.icon}
											<IconDisplay icon={category.icon} iconType={(category.iconType as 'emoji' | 'phosphor') || 'emoji'} size="md" />
										{/if}
									</div>
									<div>
										<div class="flex items-center space-x-2">
											<h3 class="font-medium text-foreground">{category.name}</h3>
											<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/50 text-accent-foreground">
												Custom
											</span>
										</div>
										{#if category.group}
											<p class="text-sm text-muted-foreground flex items-center space-x-1">
												<IconDisplay icon={category.group.icon || '📂'} iconType={(category.group.iconType as 'emoji' | 'phosphor') || 'emoji'} size="sm" />
												<span>{category.group.name}</span>
												{#if category.group.isPublic}
													<span class="text-xs text-primary">(Public Group)</span>
												{/if}
											</p>
										{/if}
									</div>
								</div>
								<div class="flex space-x-1">
									<Button
										variant="ghost"
										size="sm"
										onclick={() => goto(`/vaults/${data.vaultId}/categories/${category.id}/edit`)}
									>
										<Pencil class="w-4 h-4" />
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => deleteCategory(category.id)}
									>
										<Trash class="w-4 h-4 text-destructive" />
									</Button>
								</div>
							</div>
							<div class="text-sm text-muted-foreground">
								<p>12 expenses • $1,234.56</p>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}


	<!-- Empty State -->
	{#if data.categories.length === 0}
		<div class="text-center py-12">
			<Folder class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
			<h3 class="text-lg font-medium text-foreground mb-2">No categories yet</h3>
			<p class="text-muted-foreground mb-6">Create your first category to start organizing your expenses</p>
			<Button onclick={() => goto(`/vaults/${data.vaultId}/categories/new`)}>
				<Plus class="w-4 h-4 mr-2" />
				Create Your First Category
			</Button>
		</div>
	{/if}

	<!-- Category Stats Overview -->
	{#if data.categories.length > 0}
		<div class="grid grid-cols-2 gap-3 mt-6">
			<div class="bg-primary text-primary-foreground rounded-lg p-4 shadow-sm">
				<div class="text-center">
					<p class="text-2xl font-bold">{publicCategories.length}</p>
					<p class="text-xs text-primary-foreground/70">Public</p>
				</div>
			</div>
			<div class="bg-accent text-accent-foreground rounded-lg p-4 shadow-sm">
				<div class="text-center">
					<p class="text-2xl font-bold">{customCategories.length}</p>
					<p class="text-xs text-accent-foreground/70">Custom</p>
				</div>
			</div>
		</div>
	{/if}
</div>
