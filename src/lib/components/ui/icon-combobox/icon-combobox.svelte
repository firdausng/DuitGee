<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { cn } from '$lib/utils';

	export type IconItem = {
		icon: string;
		name: string;
		keywords?: string[];
		group: string;
	};

	type Props = {
		icons: IconItem[];
		value?: string;
		onValueChange?: (value: string) => void;
		disabled?: boolean;
		error?: string;
		label: string;
		placeholder?: string;
		required?: boolean;
		name: string;
	};

	let {
		icons,
		value = $bindable(),
		onValueChange,
		disabled = false,
		error,
		label,
		placeholder = 'Search icons...',
		required = false,
		name
	}: Props = $props();

	let searchQuery = $state('');
	let isOpen = $state(false);
	let inputRef: HTMLInputElement | null = $state(null);

	// Group icons by category
	const groupedIcons = $derived(
		icons.reduce((acc, icon) => {
			if (!acc[icon.group]) {
				acc[icon.group] = [];
			}
			acc[icon.group].push(icon);
			return acc;
		}, {} as Record<string, IconItem[]>)
	);

	// Filter icons based on search
	const filteredGroups = $derived(() => {
		if (!searchQuery) return groupedIcons;

		const query = searchQuery.toLowerCase();
		const filtered: Record<string, IconItem[]> = {};

		Object.entries(groupedIcons).forEach(([group, iconList]) => {
			const matchingIcons = iconList.filter(icon =>
				icon.name.toLowerCase().includes(query) ||
				icon.keywords?.some(keyword => keyword.toLowerCase().includes(query)) ||
				group.toLowerCase().includes(query)
			);
			if (matchingIcons.length > 0) {
				filtered[group] = matchingIcons;
			}
		});

		return filtered;
	});

	// Get current icon object
	const currentIcon = $derived(icons.find(icon => icon.icon === value));

	function handleSelect(icon: string) {
		value = icon;
		searchQuery = '';
		isOpen = false;
		onValueChange?.(icon);
	}

	function handleInputFocus() {
		isOpen = true;
	}

	function handleInputBlur() {
		// Delay to allow click on icon
		setTimeout(() => {
			isOpen = false;
		}, 200);
	}

	function handleClear() {
		value = '';
		searchQuery = '';
		onValueChange?.('');
		inputRef?.focus();
	}
</script>

<div class="space-y-2">
	<Label for={name}>{label}{#if required}<span class="text-destructive ml-1">*</span>{/if}</Label>

	<div class="relative">
		<!-- Hidden input for form submission -->
		<input type="hidden" {name} value={value || ''} />

		<!-- Display/Search Input -->
		<div class="relative">
			<Input
				bind:ref={inputRef}
				type="text"
				placeholder={searchQuery ? placeholder : (currentIcon?.name || placeholder)}
				bind:value={searchQuery}
				onfocus={handleInputFocus}
				onblur={handleInputBlur}
				{disabled}
				class={cn(error ? 'border-destructive' : '', 'pr-20 pl-10')}
			/>

			<!-- Current icon display -->
			{#if value && !searchQuery}
				<div class="absolute left-3 top-1/2 -translate-y-1/2 text-xl pointer-events-none">
					{value}
				</div>
			{/if}

			{#if value}
				<button
					type="button"
					onclick={handleClear}
					class="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
					disabled={disabled}
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
					</svg>
				</button>
			{/if}

			<button
				type="button"
				onclick={() => { isOpen = !isOpen; inputRef?.focus(); }}
				class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
				disabled={disabled}
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
				</svg>
			</button>
		</div>

		<!-- Dropdown with Grid Layout -->
		{#if isOpen}
			<div class="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
				<div class="max-h-80 overflow-auto p-2">
					{#each Object.entries(filteredGroups()) as [group, iconList]}
						<div class="mb-3 last:mb-0">
							<div class="text-xs font-semibold text-muted-foreground mb-2 px-1">{group}</div>
							<div class="grid grid-cols-6 sm:grid-cols-8 gap-1">
								{#each iconList as iconItem}
									<button
										type="button"
										class="flex flex-col items-center justify-center p-2 rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors group relative"
										onmousedown={(e) => {
											e.preventDefault();
											handleSelect(iconItem.icon);
										}}
										title={iconItem.name}
									>
										<span class="text-2xl">{iconItem.icon}</span>
										<!-- Tooltip on hover -->
										<span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-popover border rounded shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
											{iconItem.name}
										</span>
									</button>
								{/each}
							</div>
						</div>
					{:else}
						<div class="px-2 py-6 text-center text-sm text-muted-foreground">
							No icons found
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	{#if error}
		<p class="text-sm text-destructive">{error}</p>
	{/if}
</div>
