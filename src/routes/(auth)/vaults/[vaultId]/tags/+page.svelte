<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import IconPicker from '$lib/components/ui/IconPicker.svelte';
	import Plus from 'phosphor-svelte/lib/Plus';
	import Pencil from 'phosphor-svelte/lib/Pencil';
	import Trash from 'phosphor-svelte/lib/Trash';
	import Tag from 'phosphor-svelte/lib/Tag';

	let { data } = $props();

	let showFormDialog = $state(false);
	let showDeleteDialog = $state(false);
	let selectedTag = $state<any>(null);
	let isSubmitting = $state(false);
	let isEditMode = $state(false);

	// Form state
	let formData = $state({
		name: '',
		color: '#6B7280',
		icon: '🏷️'
	});

	const presetColors = [
		'#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
		'#EC4899', '#6366F1', '#14B8A6', '#F97316', '#84CC16'
	];

	function handleCreate() {
		formData = { name: '', color: '#6B7280', icon: '🏷️' };
		selectedTag = null;
		isEditMode = false;
		showFormDialog = true;
	}

	function handleEdit(tag: any) {
		formData = {
			name: tag.name,
			color: tag.color,
			icon: tag.icon || '🏷️'
		};
		selectedTag = tag;
		isEditMode = true;
		showFormDialog = true;
	}

	function handleDelete(tag: any) {
		selectedTag = tag;
		showDeleteDialog = true;
	}

	async function submitTag() {
		isSubmitting = true;

		const form = document.createElement('form');
		form.method = 'POST';
		form.action = isEditMode ? '?/update' : '?/create';

		// Add form fields
		Object.entries(formData).forEach(([key, value]) => {
			if (value !== undefined && value !== null && value !== '') {
				const input = document.createElement('input');
				input.type = 'hidden';
				input.name = key;
				input.value = String(value);
				form.appendChild(input);
			}
		});

		if (isEditMode && selectedTag?.id) {
			const idInput = document.createElement('input');
			idInput.type = 'hidden';
			idInput.name = 'id';
			idInput.value = selectedTag.id;
			form.appendChild(idInput);
		}

		document.body.appendChild(form);
		form.submit();
	}

	function cancelDialog() {
		showFormDialog = false;
		selectedTag = null;
		isSubmitting = false;
	}
</script>

<svelte:head>
	<title>Tags - {data.vault.name} - DuitGee</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
	<!-- Header -->
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-xl sm:text-2xl font-bold text-foreground">Tags</h1>
			<p class="text-sm text-muted-foreground mt-1">Organize your expenses with tags</p>
		</div>
		<Button onclick={handleCreate}>
			<Plus class="w-4 h-4 mr-2" />
			<span class="hidden sm:inline">New Tag</span>
			<span class="sm:hidden">New</span>
		</Button>
	</div>

	<!-- Tags List -->
	{#if data.tags.length === 0}
		<div class="bg-background border rounded-lg p-8 text-center">
			<Tag class="w-12 h-12 mx-auto text-muted-foreground mb-3" />
			<h3 class="text-lg font-medium text-foreground mb-2">No tags yet</h3>
			<p class="text-sm text-muted-foreground mb-4">
				Create tags to organize and categorize your expenses
			</p>
			<Button onclick={handleCreate}>
				<Plus class="w-4 h-4 mr-2" />
				Create Your First Tag
			</Button>
		</div>
	{:else}
		<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
			{#each data.tags as tag}
				<div class="bg-background border rounded-lg p-4 hover:shadow-md transition-shadow">
					<!-- Tag Display -->
					<div class="flex items-center gap-2 mb-3">
						<div
							class="w-8 h-8 rounded-full flex items-center justify-center text-lg"
							style="background-color: {tag.color}20; border: 2px solid {tag.color}"
						>
							{tag.icon || '🏷️'}
						</div>
						<h3 class="font-medium text-foreground truncate flex-1">{tag.name}</h3>
					</div>

					<!-- Color Badge -->
					<div class="flex items-center gap-2 mb-3">
						<div
							class="w-4 h-4 rounded-full border-2 border-white dark:border-gray-800"
							style="background-color: {tag.color}"
						></div>
						<span class="text-xs text-muted-foreground font-mono">{tag.color}</span>
					</div>

					<!-- Actions -->
					<div class="flex gap-2 pt-3 border-t">
						<Button
							variant="outline"
							size="sm"
							onclick={() => handleEdit(tag)}
							class="flex-1"
						>
							<Pencil class="w-4 h-4 mr-1" />
							Edit
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onclick={() => handleDelete(tag)}
						>
							<Trash class="w-4 h-4" />
						</Button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Create/Edit Dialog -->
{#if showFormDialog}
	<Dialog
		title={isEditMode ? 'Edit Tag' : 'Create Tag'}
		bind:open={showFormDialog}
		onClose={cancelDialog}
	>
		{#snippet children()}
			<div class="space-y-4">
				<!-- Tag Name -->
				<div>
					<label for="name" class="block text-sm font-medium text-foreground mb-1">
						Tag Name <span class="text-destructive">*</span>
					</label>
					<input
						type="text"
						id="name"
						bind:value={formData.name}
						required
						placeholder="e.g., Work, Personal, Urgent"
						class="w-full px-3 py-2 border rounded-md bg-background text-foreground"
					/>
				</div>

				<!-- Icon -->
				<div>
					<label class="block text-sm font-medium text-foreground mb-1">
						Icon
					</label>
					<IconPicker bind:value={formData.icon} />
				</div>

				<!-- Color -->
				<div>
					<label for="color" class="block text-sm font-medium text-foreground mb-1">
						Color
					</label>
					<div class="flex flex-wrap gap-2 mb-2">
						{#each presetColors as color}
							<button
								type="button"
								onclick={() => formData.color = color}
								class="w-8 h-8 rounded-full border-2 transition-all {formData.color === color ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'}"
								style="background-color: {color}"
								title={color}
							></button>
						{/each}
					</div>
					<div class="flex gap-2">
						<input
							type="color"
							id="color"
							bind:value={formData.color}
							class="w-12 h-10 rounded border cursor-pointer"
						/>
						<input
							type="text"
							bind:value={formData.color}
							placeholder="#6B7280"
							pattern="^#[0-9A-Fa-f]{6}$"
							class="flex-1 px-3 py-2 border rounded-md bg-background text-foreground font-mono text-sm"
						/>
					</div>
				</div>

				<!-- Preview -->
				<div class="border rounded-lg p-4 bg-accent/50">
					<p class="text-xs text-muted-foreground mb-2">Preview:</p>
					<div class="flex items-center gap-2">
						<div
							class="w-10 h-10 rounded-full flex items-center justify-center text-xl"
							style="background-color: {formData.color}20; border: 2px solid {formData.color}"
						>
							{formData.icon || '🏷️'}
						</div>
						<span class="font-medium text-foreground">{formData.name || 'Tag Name'}</span>
					</div>
				</div>

				<!-- Actions -->
				<div class="flex gap-3 pt-4">
					<Button
						type="button"
						variant="default"
						disabled={isSubmitting || !formData.name}
						class="flex-1"
						onclick={submitTag}
					>
						{isSubmitting ? 'Saving...' : isEditMode ? 'Update Tag' : 'Create Tag'}
					</Button>
					<Button type="button" variant="outline" onclick={cancelDialog} disabled={isSubmitting}>
						Cancel
					</Button>
				</div>
			</div>
		{/snippet}
	</Dialog>
{/if}

<!-- Delete Confirmation -->
{#if showDeleteDialog && selectedTag}
	<Dialog
		title="Delete Tag"
		description="Are you sure you want to delete this tag? This will remove it from all expenses."
		bind:open={showDeleteDialog}
		onClose={() => {
			showDeleteDialog = false;
			selectedTag = null;
		}}
	>
		{#snippet children()}
			<form method="POST" action="?/delete" use:enhance>
				<input type="hidden" name="id" value={selectedTag.id} />
				<div class="flex gap-3 justify-end mt-4">
					<Button
						type="button"
						variant="outline"
						onclick={() => {
							showDeleteDialog = false;
							selectedTag = null;
						}}
					>
						Cancel
					</Button>
					<Button type="submit" variant="destructive">
						Delete
					</Button>
				</div>
			</form>
		{/snippet}
	</Dialog>
{/if}
