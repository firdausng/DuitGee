<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { CaretDown, MagnifyingGlass } from 'phosphor-svelte';

	interface Option {
		id: string;
		name: string;
		icon?: string;
		color?: string;
		group?: {
			name: string;
			color?: string;
		};
	}

	interface Props {
		value?: string;
		placeholder?: string;
		options: Option[];
		disabled?: boolean;
		class?: string;
		name?: string;
		searchPlaceholder?: string;
		onSearch?: (term: string) => void;
		isLoading?: boolean;
	}

	let {
		value = $bindable(),
		placeholder = 'Select an option...',
		options = [],
		disabled = false,
		class: className = '',
		name = '',
		searchPlaceholder = 'Search...',
		onSearch,
		isLoading = false
	}: Props = $props();

	const dispatch = createEventDispatcher();

	let isOpen = $state(false);
	let searchTerm = $state('');
	let searchInput: HTMLInputElement;
	let dropdownContainer: HTMLDivElement;

	// Find selected option
	const selectedOption = $derived(options.find(opt => opt.id === value));

	// All options are always shown by default, filtering happens via the onSearch callback
	const filteredOptions = $derived(options);

	// Immediate search for client-side filtering
	function handleSearch(term: string) {
		onSearch?.(term);
	}

	function toggleDropdown() {
		if (disabled) return;

		isOpen = !isOpen;

		if (isOpen) {
			// Focus search input when opening
			setTimeout(() => {
				searchInput?.focus();
			}, 0);
		} else {
			// Clear search when closing
			searchTerm = '';
			// Reset to show all options when closing
			handleSearch('');
		}
	}

	function selectOption(option: Option) {
		value = option.id;
		isOpen = false;
		searchTerm = '';
		// Reset to show all options when clearing search
		handleSearch('');
		dispatch('change', option);
	}

	function handleSearchInput(event: Event) {
		const target = event.target as HTMLInputElement;
		searchTerm = target.value;
		handleSearch(searchTerm);
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent) {
		if (dropdownContainer && !dropdownContainer.contains(event.target as Node)) {
			isOpen = false;
			searchTerm = '';
			// Reset to show all options when closing
			handleSearch('');
		}
	}

	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleClickOutside);
		}
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div class="relative" bind:this={dropdownContainer}>
	<!-- Hidden input for form submission -->
	{#if name}
		<input type="hidden" {name} bind:value />
	{/if}

	<!-- Trigger Button -->
	<button
		type="button"
		onclick={toggleDropdown}
		{disabled}
		class="flex h-8 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-1 text-sm text-foreground transition-colors hover:border-border-input-hover focus:border-border-input-hover focus:outline-none focus:ring-1 focus:ring-dark disabled:cursor-not-allowed disabled:opacity-50 {className}"
		aria-haspopup="listbox"
		aria-expanded={isOpen}
	>
		<span class="flex items-center gap-2 truncate">
			{#if selectedOption}
				{#if selectedOption.icon}
					<span class="text-xs">{selectedOption.icon}</span>
				{/if}
				<span>{selectedOption.name}</span>
				{#if selectedOption.group}
					<span class="text-xs text-muted-foreground">({selectedOption.group.name})</span>
				{/if}
			{:else}
				<span class="text-muted-foreground">{placeholder}</span>
			{/if}
		</span>
		<CaretDown class="h-3 w-3 text-muted-foreground transition-transform {isOpen ? 'rotate-180' : ''}" />
	</button>

	<!-- Dropdown -->
	{#if isOpen}
		<div class="absolute z-50 mt-1 w-full rounded-md border border-border bg-background shadow-lg">
			<!-- Search Input -->
			<div class="flex items-center border-b border-border px-3 py-2">
				<MagnifyingGlass class="h-3 w-3 text-muted-foreground mr-2" />
				<input
					bind:this={searchInput}
					type="text"
					placeholder={searchPlaceholder}
					bind:value={searchTerm}
					oninput={handleSearchInput}
					class="flex-1 text-xs bg-transparent outline-none placeholder:text-muted-foreground"
				/>
				{#if isLoading}
					<div class="h-3 w-3 animate-spin rounded-full border border-muted-foreground border-t-transparent"></div>
				{/if}
			</div>

			<!-- Options List -->
			<div class="max-h-48 overflow-y-auto">
				{#if filteredOptions.length === 0}
					<div class="px-3 py-2 text-xs text-muted-foreground text-center">
						{searchTerm ? 'No categories found' : 'No options available'}
					</div>
				{:else}
					{#each filteredOptions as option}
						<button
							type="button"
							onclick={() => selectOption(option)}
							class="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-accent transition-colors"
						>
							{#if option.icon}
								<span class="text-xs">{option.icon}</span>
							{/if}
							<div class="flex-1 min-w-0">
								<div class="font-medium text-foreground truncate">{option.name}</div>
								{#if option.group}
									<div class="text-muted-foreground truncate">{option.group.name}</div>
								{/if}
							</div>
							{#if option.color}
								<div
									class="w-3 h-3 rounded-full border border-border flex-shrink-0"
									style="background-color: {option.color}"
								></div>
							{/if}
						</button>
					{/each}
				{/if}
			</div>
		</div>
	{/if}
</div>