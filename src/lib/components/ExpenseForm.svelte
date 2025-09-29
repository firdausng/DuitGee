<script lang="ts">
    import {type Infer, superForm, type SuperValidated} from 'sveltekit-superforms';
	import { valibotClient } from 'sveltekit-superforms/adapters';
    import {type ExpenseSchema, expenseSchema} from '$lib/schemas/expense';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import SearchableSelect from '$lib/components/ui/SearchableSelect.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import { createEventDispatcher } from 'svelte';
	import { page } from '$app/stores';

	interface Props {
		data: SuperValidated<Infer<ExpenseSchema>>;
		categories: Array<{
			id: string;
			name: string;
			color: string;
			icon?: string;
			description?: string;
			keywords?: string;
			group?: { name: string; color?: string }
		}>;
		isEdit?: boolean;
		vaultId?: string;
	}

	let { data, categories, isEdit = false, vaultId }: Props = $props();

	// State for searchable categories
	let allCategories = $state(categories);
	let searchableCategories = $state(categories);
	let isSearching = $state(false);

	const { form, errors, enhance, submitting } = superForm(data, {
		validators: valibotClient(expenseSchema),
		resetForm: !isEdit,
		onUpdated: ({ form }) => {
			if (form.valid) {
				// dispatch('success');
			}
		}
	});

	function handleCancel() {
		// dispatch('cancel');
	}

	function formatDateForInput(date: Date): string {
		// Set to today at current time
		return date.toISOString().slice(0, 16);
	}

	// Set default date to current date and time
	if (!$form.date) {
		$form.date = formatDateForInput(new Date());
	}

	// Client-side search function
	function searchCategories(searchTerm: string) {
		if (!searchTerm.trim()) {
			searchableCategories = allCategories;
			console.log('Showing all categories:', allCategories.length);
			return;
		}

		const term = searchTerm.toLowerCase();

		// Smart filtering with ranking
		const filtered = allCategories.filter(cat => {
			return (
				cat.name.toLowerCase().includes(term) ||
				cat.description?.toLowerCase().includes(term) ||
				cat.keywords?.toLowerCase().includes(term) ||
				cat.group?.name.toLowerCase().includes(term)
			);
		});

		// Sort by relevance
		filtered.sort((a, b) => {
			// Exact name match comes first
			if (a.name.toLowerCase() === term) return -1;
			if (b.name.toLowerCase() === term) return 1;

			// Name starts with term
			if (a.name.toLowerCase().startsWith(term) && !b.name.toLowerCase().startsWith(term)) return -1;
			if (b.name.toLowerCase().startsWith(term) && !a.name.toLowerCase().startsWith(term)) return 1;

			// Keywords match
			if (a.keywords?.toLowerCase().includes(term) && !b.keywords?.toLowerCase().includes(term)) return -1;
			if (b.keywords?.toLowerCase().includes(term) && !a.keywords?.toLowerCase().includes(term)) return 1;

			// Alphabetical as fallback
			return a.name.localeCompare(b.name);
		});

		searchableCategories = filtered;
	}
</script>

<form method="POST" use:enhance class="space-y-3">
	<div class="grid grid-cols-2 gap-2">
		<div>
			<label for="amount" class="block text-xs font-medium text-muted-foreground mb-1">
				Amount
			</label>
			<Input
				id="amount"
				name="amount"
				type="number"
				step="0.01"
				min="0.01"
				bind:value={$form.amount}
				placeholder="0.00"
				class="w-full h-8 text-sm"
				aria-invalid={$errors.amount ? 'true' : undefined}
			/>
			{#if $errors.amount}
				<p class="mt-0.5 text-xs text-destructive">{$errors.amount}</p>
			{/if}
		</div>

		<div>
			<label for="categoryId" class="block text-xs font-medium text-muted-foreground mb-1">
				Category
			</label>
			<SearchableSelect
				name="categoryId"
				bind:value={$form.categoryId}
				options={searchableCategories}
				placeholder="Choose category"
				searchPlaceholder="Search categories..."
				onSearch={searchCategories}
				isLoading={isSearching}
				class="w-full h-8 text-sm"
			/>
			{#if $errors.categoryId}
				<p class="mt-0.5 text-xs text-destructive">{$errors.categoryId}</p>
			{/if}
		</div>
	</div>

	<div>
		<label for="date" class="block text-xs font-medium text-muted-foreground mb-1">
			When
		</label>
		<Input
			id="date"
			name="date"
			type="datetime-local"
			bind:value={$form.date}
			class="w-full h-8 text-sm"
			aria-invalid={$errors.date ? 'true' : undefined}
		/>
		{#if $errors.date}
			<p class="mt-0.5 text-xs text-destructive">{$errors.date}</p>
		{/if}
	</div>

    <div>
        <label for="description" class="block text-xs font-medium text-muted-foreground mb-1">
            What did you spend on?
        </label>
        <Textarea
                id="description"
                name="description"
                bind:value={$form.description}
                placeholder="e.g., Grocery shopping at Whole Foods, Gas station fill-up, Coffee with friends..."
                class="w-full text-sm leading-tight"
                rows={2}
                aria-invalid={$errors.description ? 'true' : undefined}
        />
        {#if $errors.description}
            <p class="mt-0.5 text-xs text-destructive">{$errors.description}</p>
        {/if}
    </div>

	<div class="flex gap-2 pt-1">
		<Button type="submit" disabled={$submitting} size="sm" class="flex-1 h-8 text-xs">
			{#if $submitting}
				{isEdit ? 'Saving...' : 'Adding...'}
			{:else}
				{isEdit ? 'Save' : 'Add'}
			{/if}
		</Button>
		<Button type="button" variant="outline" onclick={handleCancel} size="sm" class="flex-1 h-8 text-xs">
			Cancel
		</Button>
	</div>
</form>