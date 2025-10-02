<script lang="ts">
	import X from 'phosphor-svelte/lib/X';
	import Plus from 'phosphor-svelte/lib/Plus';

	type Tag = {
		id: string;
		name: string;
		color: string;
		icon?: string;
	};

	interface Props {
		availableTags: Tag[];
		selectedTagIds?: string[];
		onTagsChange: (tagIds: string[]) => void;
		onCreateTag?: (name: string) => Promise<Tag | null>;
		placeholder?: string;
		allowCreate?: boolean;
	}

	let {
		availableTags,
		selectedTagIds = $bindable([]),
		onTagsChange,
		onCreateTag,
		placeholder = "Add tags...",
		allowCreate = false
	}: Props = $props();

	let showDropdown = $state(false);
	let searchQuery = $state('');
	let isCreating = $state(false);

	let selectedTags = $derived(
		availableTags.filter(tag => selectedTagIds.includes(tag.id))
	);

	let filteredTags = $derived(
		availableTags.filter(tag =>
			!selectedTagIds.includes(tag.id) &&
			tag.name.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	let canCreateNew = $derived(
		allowCreate &&
		searchQuery.trim() !== '' &&
		!availableTags.some(tag => tag.name.toLowerCase() === searchQuery.trim().toLowerCase())
	);

	function toggleTag(tagId: string) {
		const newTagIds = selectedTagIds.includes(tagId)
			? selectedTagIds.filter(id => id !== tagId)
			: [...selectedTagIds, tagId];

		selectedTagIds = newTagIds;
		onTagsChange(newTagIds);
		searchQuery = '';
	}

	function removeTag(tagId: string) {
		const newTagIds = selectedTagIds.filter(id => id !== tagId);
		selectedTagIds = newTagIds;
		onTagsChange(newTagIds);
	}

	async function createNewTag() {
		if (!onCreateTag || !searchQuery.trim()) return;

		isCreating = true;
		try {
			const newTag = await onCreateTag(searchQuery.trim());
			if (newTag) {
				// Add the new tag to selected tags
				const newTagIds = [...selectedTagIds, newTag.id];
				selectedTagIds = newTagIds;
				onTagsChange(newTagIds);
				searchQuery = '';
			}
		} catch (error) {
			console.error('Error creating tag:', error);
		} finally {
			isCreating = false;
		}
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.tag-selector-container')) {
			showDropdown = false;
			searchQuery = '';
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="tag-selector-container">
	<!-- Selected Tags Display -->
	{#if selectedTags.length > 0}
		<div class="flex flex-wrap gap-2 mb-2">
			{#each selectedTags as tag}
				<button
					type="button"
					onclick={() => removeTag(tag.id)}
					class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all active:scale-95"
					style="background-color: {tag.color}20; color: {tag.color}; border: 1px solid {tag.color}40;"
				>
					{#if tag.icon}
						<span>{tag.icon}</span>
					{/if}
					<span>{tag.name}</span>
					<X class="w-3 h-3" weight="bold" />
				</button>
			{/each}
		</div>
	{/if}

	<!-- Input / Dropdown Trigger -->
	<div class="relative">
		<button
			type="button"
			onclick={() => showDropdown = !showDropdown}
			class="w-full flex items-center gap-2 px-3 py-2 text-sm border rounded-md bg-background text-foreground hover:bg-accent transition-colors"
		>
			<Plus class="w-4 h-4 text-muted-foreground" />
			<span class="text-muted-foreground">{placeholder}</span>
		</button>

		{#if showDropdown}
			<div class="absolute z-50 mt-1 w-full bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
				<!-- Search Input -->
				<div class="p-2 border-b sticky top-0 bg-background">
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search tags..."
						class="w-full px-3 py-1.5 text-sm border rounded bg-background"
						autofocus
					/>
				</div>

				<!-- Tag Options -->
				<div class="py-1">
					{#if canCreateNew}
						<button
							type="button"
							onclick={createNewTag}
							disabled={isCreating}
							class="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left border-b"
						>
							<Plus class="w-4 h-4 text-primary" weight="bold" />
							<span class="text-primary font-medium">
								{isCreating ? 'Creating...' : `Create "${searchQuery}"`}
							</span>
						</button>
					{/if}

					{#if filteredTags.length === 0 && !canCreateNew}
						<div class="px-3 py-2 text-sm text-muted-foreground text-center">
							{searchQuery ? 'No tags found' : 'All tags selected'}
						</div>
					{:else}
						{#each filteredTags as tag}
							<button
								type="button"
								onclick={() => toggleTag(tag.id)}
								class="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
							>
								{#if tag.icon}
									<span class="text-base">{tag.icon}</span>
								{/if}
								<span
									class="w-3 h-3 rounded-full flex-shrink-0"
									style="background-color: {tag.color}"
								></span>
								<span class="flex-1">{tag.name}</span>
							</button>
						{/each}
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
