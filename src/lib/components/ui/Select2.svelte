<script lang="ts">
	import { Select as SelectPrimitive } from 'bits-ui';
	import { ChevronDown, Check } from 'phosphor-svelte';
	import { cn } from '$lib/utils';

	interface Props {
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		class?: string;
		items: { value: string; label: string }[];
	}

	let {
		value = $bindable(),
		placeholder = 'Select an option...',
		disabled = false,
		class: className = '',
		items
	}: Props = $props();

	let selected = $state({ value: value || '', label: items.find(item => item.value === value)?.label || '' });

	$effect(() => {
		if (selected?.value !== value) {
			value = selected?.value || '';
		}
	});

	$effect(() => {
		if (value && value !== selected?.value) {
			const item = items.find(item => item.value === value);
			if (item) {
				selected = item;
			}
		}
	});
</script>

<SelectPrimitive.Root bind:selected {disabled}>
	<SelectPrimitive.Trigger
		class={cn(
			'flex h-spacing-input w-full items-center justify-between rounded-input border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground theme-transition-fast',
			'focus:border-input-hover focus:outline-none focus:ring-2 focus:ring-dark focus:ring-offset-2 focus:ring-offset-background',
			'disabled:cursor-not-allowed disabled:opacity-50',
			'[&>span]:line-clamp-1',
			className
		)}
	>
		<SelectPrimitive.Value {placeholder} />
		<SelectPrimitive.Icon>
			<ChevronDown class="h-4 w-4 opacity-50" />
		</SelectPrimitive.Icon>
	</SelectPrimitive.Trigger>
	<SelectPrimitive.Content
		class="relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-input border border-border bg-background text-foreground shadow-popover"
		sideOffset={4}
	>
		<SelectPrimitive.Viewport class="p-1">
			{#each items as item}
				<SelectPrimitive.Item
					value={item.value}
					class={cn(
						'relative flex w-full cursor-default select-none items-center rounded-5px py-1.5 pl-8 pr-2 text-sm outline-none',
						'focus:bg-accent focus:text-accent-foreground',
						'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
					)}
				>
					<span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
						<SelectPrimitive.ItemIndicator>
							<Check class="h-4 w-4" />
						</SelectPrimitive.ItemIndicator>
					</span>
					<SelectPrimitive.ItemText>{item.label}</SelectPrimitive.ItemText>
				</SelectPrimitive.Item>
			{/each}
		</SelectPrimitive.Viewport>
	</SelectPrimitive.Content>
</SelectPrimitive.Root>