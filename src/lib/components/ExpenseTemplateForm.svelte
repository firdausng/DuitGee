<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import TagSelector from '$lib/components/TagSelector.svelte';
	import IconDisplay from '$lib/components/IconDisplay.svelte';
	import IconPicker from '$lib/components/ui/IconPicker.svelte';
	import SearchableSelect from '$lib/components/ui/SearchableSelect.svelte';

	type Category = {
		id: string;
		name: string;
		icon?: string;
		color: string;
		description?: string;
		keywords?: string;
		group?: { name: string; color?: string };
	};

	type Tag = {
		name: string; // Primary key - normalized, lowercase
		usageCount: number;
		createdAt: string;
		createdBy: string;
	};

	type PaymentType = {
		id: string;
		code: string;
		name: string;
		icon?: string;
	};

	type PaymentProvider = {
		id: string;
		name: string;
		type?: string;
		icon?: string;
		color?: string;
	};

	interface Props {
		template?: {
			id?: string;
			name: string;
			description?: string;
			categoryId?: string;
			defaultAmount?: number;
			paymentTypeId?: string;
			paymentProviderId?: string;
			note?: string;
			icon?: string;
			iconType?: string;
			tagNames?: string[]; // Changed from tagIds to tagNames
		};
		categories: Category[];
		tags: Tag[];
		paymentTypes: PaymentType[];
		paymentProviders: PaymentProvider[];
		vaultId: string;
		onSubmit: (data: any) => void;
		onCancel: () => void;
		isSubmitting?: boolean;
	}

	let {
		template,
		categories,
		tags,
		paymentTypes,
		paymentProviders,
		vaultId,
		onSubmit,
		onCancel,
		isSubmitting = false
	}: Props = $props();

	// Make tags reactive so new tags appear immediately
	let allTags = $state(tags);

	// Form state
	let formData = $state({
		name: template?.name || '',
		description: template?.description || '',
		categoryId: template?.categoryId || '',
		defaultAmount: template?.defaultAmount?.toString() || '',
		paymentTypeId: template?.paymentTypeId || '',
		paymentProviderId: template?.paymentProviderId || '',
		note: template?.note || '',
		icon: template?.icon || '📝',
		iconType: template?.iconType || 'emoji',
		tagNames: template?.tagNames || [] // Changed from tagIds to tagNames
	});

	// State for searchable categories
	let allCategories = $state(categories);
	let searchableCategories = $state(categories);
	let isSearching = $state(false);

	// Get selected payment type to determine which providers to show
	let selectedPaymentType = $derived(
		paymentTypes.find(pt => pt.id === formData.paymentTypeId)
	);

	let showProviderInput = $derived(
		selectedPaymentType?.code === 'e_wallet' ||
		selectedPaymentType?.code === 'bank_transfer' ||
		selectedPaymentType?.code === 'credit_card' ||
		selectedPaymentType?.code === 'debit_card'
	);

	let filteredProviders = $derived(() => {
		if (!selectedPaymentType) return [];

		if (selectedPaymentType.code === 'e_wallet') {
			return paymentProviders.filter(p => p.type === 'e_wallet');
		}
		if (selectedPaymentType.code === 'bank_transfer' ||
			selectedPaymentType.code === 'credit_card' ||
			selectedPaymentType.code === 'debit_card') {
			return paymentProviders.filter(p => p.type === 'bank');
		}
		return [];
	});

	function handleSubmit(e: Event) {
		e.preventDefault();

		const submitData = {
			...formData,
			defaultAmount: formData.defaultAmount ? parseFloat(formData.defaultAmount) : undefined,
			categoryId: formData.categoryId || undefined,
			paymentTypeId: formData.paymentTypeId || undefined,
			paymentProviderId: formData.paymentProviderId || undefined,
			note: formData.note || undefined,
			description: formData.description || undefined
		};

		onSubmit(submitData);
	}

	function handleTagsChange(tagNames: string[]) {
		formData.tagNames = tagNames;
	}

	// Tags are auto-created on submission, no need for explicit creation
	async function handleCreateTag(name: string): Promise<Tag | null> {
		// Twitter-style tags are auto-created on use
		// Just return a mock tag object to update the UI
		const newTag: Tag = {
			name: name.toLowerCase().trim(),
			usageCount: 0,
			createdAt: new Date().toISOString(),
			createdBy: ''
		};
		allTags = [...allTags, newTag];
		return newTag;
	}

	// Client-side search function
	function searchCategories(searchTerm: string) {
		if (!searchTerm.trim()) {
			searchableCategories = allCategories;
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

<form onsubmit={handleSubmit} class="space-y-4">
	<!-- Template Name -->
	<div>
		<label for="name" class="block text-sm font-medium text-foreground mb-1">
			Template Name <span class="text-destructive">*</span>
		</label>
		<input
			type="text"
			id="name"
			bind:value={formData.name}
			required
			placeholder="e.g., Morning Coffee, Lunch at Office"
			class="w-full px-3 py-2 border rounded-md bg-background text-foreground"
		/>
	</div>

	<!-- Description -->
	<div>
		<label for="description" class="block text-sm font-medium text-foreground mb-1">
			Description
		</label>
		<textarea
			id="description"
			bind:value={formData.description}
			rows="2"
			placeholder="Optional description..."
			class="w-full px-3 py-2 border rounded-md bg-background text-foreground resize-none"
		></textarea>
	</div>

	<!-- Category -->
	<div>
		<label for="category" class="block text-sm font-medium text-foreground mb-1">
			Category
		</label>
		<SearchableSelect
			name="categoryId"
			bind:value={formData.categoryId}
			options={searchableCategories}
			placeholder="Choose category"
			searchPlaceholder="Search categories..."
			onSearch={searchCategories}
			isLoading={isSearching}
			class="w-full"
		/>
	</div>

	<!-- Default Amount -->
	<div>
		<label for="amount" class="block text-sm font-medium text-foreground mb-1">
			Default Amount
		</label>
		<input
			type="number"
			id="amount"
			bind:value={formData.defaultAmount}
			step="0.01"
			min="0"
			placeholder="Optional default amount"
			class="w-full px-3 py-2 border rounded-md bg-background text-foreground"
		/>
	</div>

	<!-- Payment Type -->
	<div>
		<label for="payment-type" class="block text-sm font-medium text-foreground mb-1">
			Payment Type
		</label>
		<select
			id="payment-type"
			bind:value={formData.paymentTypeId}
			class="w-full px-3 py-2 border rounded-md bg-background text-foreground"
		>
			<option value="">Select payment type...</option>
			{#each paymentTypes as type}
				<option value={type.id}>{type.name}</option>
			{/each}
		</select>
	</div>

	<!-- Payment Provider -->
	{#if showProviderInput}
		<div>
			<label for="payment-provider" class="block text-sm font-medium text-foreground mb-1">
				Payment Provider
			</label>
			<select
				id="payment-provider"
				bind:value={formData.paymentProviderId}
				class="w-full px-3 py-2 border rounded-md bg-background text-foreground"
			>
				<option value="">Select provider...</option>
				{#each filteredProviders() as provider}
					<option value={provider.id}>{provider.name}</option>
				{/each}
			</select>
		</div>
	{/if}

	<!-- Default Note -->
	<div>
		<label for="note" class="block text-sm font-medium text-foreground mb-1">
			Default Note
		</label>
		<input
			type="text"
			id="note"
			bind:value={formData.note}
			placeholder="Optional default note"
			class="w-full px-3 py-2 border rounded-md bg-background text-foreground"
		/>
	</div>

	<!-- Tags -->
	<div>
		<label class="block text-sm font-medium text-foreground mb-1">
			Tags
		</label>
		<TagSelector
			availableTags={allTags}
			bind:selectedTagNames={formData.tagNames}
			onTagsChange={handleTagsChange}
			onCreateTag={handleCreateTag}
			allowCreate={true}
		/>
	</div>

	<!-- Icon -->
	<div>
		<label class="block text-sm font-medium text-foreground mb-1">
			Icon
		</label>
		<IconPicker bind:value={formData.icon} />
	</div>

	<!-- Actions -->
	<div class="flex gap-3 pt-4">
		<Button type="submit" variant="default" disabled={isSubmitting} class="flex-1">
			{isSubmitting ? 'Saving...' : template?.id ? 'Update Template' : 'Create Template'}
		</Button>
		<Button type="button" variant="outline" onclick={onCancel} disabled={isSubmitting}>
			Cancel
		</Button>
	</div>
</form>
