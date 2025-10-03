<script lang="ts">
    import {type Infer, superForm, type SuperValidated} from 'sveltekit-superforms';
    import {type ExpenseSchema} from '$lib/schemas/expense';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import SearchableSelect from '$lib/components/ui/SearchableSelect.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import TagSelector from '$lib/components/TagSelector.svelte';
	import { goto } from '$app/navigation';
	import CaretDown from 'phosphor-svelte/lib/CaretDown';

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
		tags?: Array<{
			name: string;
			usageCount: number;
			createdAt: string;
			createdBy: string;
		}>;
		templates?: Array<any>;
		members?: Array<{
			userId: string;
			firstName?: string;
			lastName?: string;
			email: string;
			role: string;
			status: string;
		}>;
		paymentTypes?: Array<{
			id: string;
			code: string;
			name: string;
			icon?: string;
		}>;
		paymentProviders?: Array<{
			id: string;
			name: string;
			type?: string;
			icon?: string;
			color?: string;
		}>;
		currentUserId?: string;
		isEdit?: boolean;
		vaultId: string;
	}

	let { data, categories, tags = [], templates = [], members = [], paymentTypes = [], paymentProviders = [], currentUserId, isEdit = false, vaultId }: Props = $props();

	// State for searchable categories
	let allCategories = $state(categories);
	let searchableCategories = $state(categories);
	let isSearching = $state(false);

	// State for searchable templates
	let allTemplates = $state(templates);
	let searchableTemplates = $state(templates);
	let isSearchingTemplates = $state(false);
	let selectedTemplateId = $state<string>('');

	// Watch for template selection changes
	$effect(() => {
		if (selectedTemplateId) {
			handleTemplateSelect(selectedTemplateId);
		}
	});

	const { form, errors, enhance, submitting } = superForm(data);

	// State for payment and tags - initialize from form data in edit mode
	let selectedTagNames = $state<string[]>(
		$form.tagNames ? $form.tagNames.split(',').filter(Boolean) : []
	);
	let showAdvancedOptions = $state(false);
	let paymentType = $state<string>($form.paymentType || '');
	let paymentProvider = $state<string>($form.paymentProvider || '');

	// Make tags reactive so new tags appear immediately
	let allTags = $state(tags);

	// Get selected payment type to filter providers
	let selectedPaymentType = $derived(
		paymentTypes.find(pt => pt.code === paymentType)
	);

	let showProviderSelect = $derived(
		paymentType === 'e_wallet' ||
		paymentType === 'bank_transfer' ||
		paymentType === 'credit_card' ||
		paymentType === 'debit_card'
	);

	let providerOptions = $derived(() => {
		if (!selectedPaymentType) return [];

		if (paymentType === 'e_wallet') {
			return paymentProviders.filter(p => p.type === 'e_wallet');
		}
		if (paymentType === 'bank_transfer' ||
			paymentType === 'credit_card' ||
			paymentType === 'debit_card') {
			return paymentProviders.filter(p => p.type === 'bank');
		}
		return [];
	});

	// Map payment type IDs to codes for backwards compatibility
	const paymentTypeIdToCode: Record<string, string> = {
		'pt_cash': 'cash',
		'pt_ewallet': 'e_wallet',
		'pt_credit': 'credit_card',
		'pt_debit': 'debit_card',
		'pt_transfer': 'bank_transfer'
	};

	// Map payment provider IDs to names
	const paymentProviderIdToName: Record<string, string> = {
		'pp_gopay': 'GoPay',
		'pp_ovo': 'OVO',
		'pp_dana': 'Dana',
		'pp_shopeepay': 'ShopeePay',
		'pp_linkaja': 'LinkAja',
		'pp_bca': 'BCA',
		'pp_mandiri': 'Mandiri',
		'pp_bni': 'BNI',
		'pp_bri': 'BRI',
		'pp_permata': 'Permata',
		'pp_cimb': 'CIMB'
	};

	function handleTemplateSelect(templateId: string) {
		const template = allTemplates.find(t => t.id === templateId);
		if (!template) return;

		// Pre-fill form with template data
		if (template.categoryId) $form.categoryId = template.categoryId;
		if (template.defaultAmount) $form.amount = template.defaultAmount;
		if (template.note) $form.note = template.note;

		// Handle defaultUserId - if template has "__creator__", use current user
		if (template.defaultUserId !== undefined) {
			if (template.defaultUserId === '__creator__') {
				$form.userId = currentUserId || '';
			} else {
				$form.userId = template.defaultUserId;
			}
		}

		// Map payment type ID to code
		if (template.paymentTypeId) {
			paymentType = paymentTypeIdToCode[template.paymentTypeId] || '';
		}

		// Map payment provider ID to name
		if (template.paymentProviderId) {
			paymentProvider = paymentProviderIdToName[template.paymentProviderId] || '';
		}

		if (template.tags && template.tags.length > 0) {
			selectedTagNames = template.tags.map((t: any) => t.name);
		}

		// Clear template selection after applying
		selectedTemplateId = '';
		searchableTemplates = allTemplates;
	}

	function handleTagsChange(tagNames: string[]) {
		selectedTagNames = tagNames;
	}

	// Tags are auto-created on submission with Twitter-style system
	async function handleCreateTag(name: string): Promise<any> {
		// Twitter-style tags are auto-created on use
		// Just return a mock tag object to update the UI
		const newTag = {
			name: name.toLowerCase().trim(),
			usageCount: 0,
			createdAt: new Date().toISOString(),
			createdBy: ''
		};
		allTags = [...allTags, newTag];
		return newTag;
	}

	function handleCancel() {
		goto(`/vaults/${vaultId}/expenses`);
	}

	function formatDateForInput(date: Date | string): string {
		// Handle both Date objects and ISO strings
		const dateObj = typeof date === 'string' ? new Date(date) : date;

		// Format for datetime-local input (YYYY-MM-DDTHH:MM)
		const year = dateObj.getFullYear();
		const month = String(dateObj.getMonth() + 1).padStart(2, '0');
		const day = String(dateObj.getDate()).padStart(2, '0');
		const hours = String(dateObj.getHours()).padStart(2, '0');
		const minutes = String(dateObj.getMinutes()).padStart(2, '0');

		return `${year}-${month}-${day}T${hours}:${minutes}`;
	}

	// Set default date to current date and time, or format existing date
	if (!$form.date) {
		$form.date = formatDateForInput(new Date());
	} else {
		// Ensure existing date is in the correct format for datetime-local input
		$form.date = formatDateForInput($form.date);
	}

	// Client-side search function for categories
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

	// Client-side search function for templates
	function searchTemplates(searchTerm: string) {
		if (!searchTerm.trim()) {
			searchableTemplates = allTemplates;
			return;
		}

		const term = searchTerm.toLowerCase();

		// Filter templates by name and note
		const filtered = allTemplates.filter(template => {
			return (
				template.name.toLowerCase().includes(term) ||
				template.note?.toLowerCase().includes(term)
			);
		});

		// Sort by relevance (exact match first, then by usage count)
		filtered.sort((a, b) => {
			// Exact name match comes first
			if (a.name.toLowerCase() === term) return -1;
			if (b.name.toLowerCase() === term) return 1;

			// Name starts with term
			if (a.name.toLowerCase().startsWith(term) && !b.name.toLowerCase().startsWith(term)) return -1;
			if (b.name.toLowerCase().startsWith(term) && !a.name.toLowerCase().startsWith(term)) return 1;

			// Fall back to usage count (already sorted from database)
			return b.usageCount - a.usageCount;
		});

		searchableTemplates = filtered;
	}
</script>

<form method="POST" use:enhance class="space-y-3">
	<!-- Template Selector (only for new expenses, not edit) -->
	{#if !isEdit && templates.length > 0}
		<div>
			<label for="templateId" class="block text-xs font-medium text-muted-foreground mb-1">
				Quick Template <span class="text-xs text-muted-foreground/60">(optional)</span>
			</label>
			<SearchableSelect
				name="templateId"
				bind:value={selectedTemplateId}
				options={searchableTemplates.map(t => ({
					id: t.id,
					name: t.name,
					icon: t.icon,
					color: t.category?.color || '#6B7280'
				}))}
				placeholder="Choose template..."
				searchPlaceholder="Search templates..."
				onSearch={searchTemplates}
				isLoading={isSearchingTemplates}
				class="w-full h-8 text-sm"
			/>
		</div>
	{/if}
	<!-- Hidden fields for payment and tags -->
	<input type="hidden" name="paymentType" value={paymentType} />
	<input type="hidden" name="paymentProvider" value={paymentProvider} />
	<input type="hidden" name="tagNames" value={selectedTagNames.join(',')} />

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
			class="w-full h-8 text-sm dark:[color-scheme:dark]"
			aria-invalid={$errors.date ? 'true' : undefined}
		/>
		{#if $errors.date}
			<p class="mt-0.5 text-xs text-destructive">{$errors.date}</p>
		{/if}
	</div>

	<div>
		<label for="userId" class="block text-xs font-medium text-muted-foreground mb-1">
			Who spent? <span class="text-xs text-muted-foreground/60">(optional)</span>
		</label>
		<Select
			id="userId"
			name="userId"
			bind:value={$form.userId}
			class="w-full h-8 text-sm"
		>
			<option value="">-- Vault Expense --</option>
			{#each members as member}
				<option value={member.userId}>
					{member.firstName && member.lastName
						? `${member.firstName} ${member.lastName}`
						: member.email}
					{member.role === 'owner' ? ' (Owner)' : ''}
				</option>
			{/each}
		</Select>
		{#if $errors.userId}
			<p class="mt-0.5 text-xs text-destructive">{$errors.userId}</p>
		{/if}
	</div>

    <div>
        <label for="note" class="block text-xs font-medium text-muted-foreground mb-1">
            What did you spend on?
        </label>
        <Textarea
                id="note"
                name="note"
                bind:value={$form.note}
                placeholder="e.g., Grocery shopping at Whole Foods, Gas station fill-up, Coffee with friends..."
                class="w-full text-sm leading-tight"
                rows={2}
        />
        {#if $errors.note}
            <p class="mt-0.5 text-xs text-destructive">{$errors.note}</p>
        {/if}
    </div>

	<!-- Advanced Options (collapsible) -->
	<div class="border-t pt-3">
		<button
			type="button"
			onclick={() => showAdvancedOptions = !showAdvancedOptions}
			class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
		>
			<CaretDown class="w-4 h-4 transition-transform {showAdvancedOptions ? 'rotate-180' : ''}" />
			<span>Advanced Options</span>
			{#if (paymentType || selectedTagNames.length > 0) && !showAdvancedOptions}
				<span class="text-xs text-primary">({paymentType ? '1' : '0'}{selectedTagNames.length > 0 ? ` + ${selectedTagNames.length} tags` : ''})</span>
			{/if}
		</button>

		{#if showAdvancedOptions}
			<div class="space-y-3 pl-6">
				<!-- Payment Type -->
				<div>
					<label for="payment-type" class="block text-xs font-medium text-muted-foreground mb-1">
						Payment Type
					</label>
					<select
						id="payment-type"
						bind:value={paymentType}
						class="w-full h-8 px-3 py-1 text-sm border rounded-md bg-background text-foreground"
					>
						<option value="">Select payment type...</option>
						{#each paymentTypes as type}
							<option value={type.code}>{type.name}</option>
						{/each}
					</select>
				</div>

				<!-- Payment Provider -->
				{#if showProviderSelect}
					<div>
						<label for="payment-provider" class="block text-xs font-medium text-muted-foreground mb-1">
							Payment Provider
						</label>
						<SearchableSelect
							name="paymentProvider"
							bind:value={paymentProvider}
							options={providerOptions().map(p => ({
								id: p.name,
								name: p.name,
								color: p.color || '#6B7280',
								icon: p.icon
							}))}
							placeholder="Choose provider"
							searchPlaceholder="Search providers..."
							onSearch={(term) => {}}
							class="w-full"
						/>
					</div>
				{/if}

				<!-- Tags -->
				<div>
					<label class="block text-xs font-medium text-muted-foreground mb-1">
						Tags
					</label>
					<TagSelector
						availableTags={allTags}
						bind:selectedTagNames={selectedTagNames}
						onTagsChange={handleTagsChange}
						onCreateTag={handleCreateTag}
						allowCreate={true}
						placeholder="Add tags..."
					/>
				</div>
			</div>
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