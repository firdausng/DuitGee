<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		value?: string | number;
		type?: string;
		placeholder?: string;
		disabled?: boolean;
		class?: string;
		id?: string;
		name?: string;
		step?: string;
		min?: string;
		max?: string;
		'aria-invalid'?: string;
	}

	let {
		value = $bindable(),
		type = 'text',
		placeholder,
		disabled = false,
		class: className = '',
		id,
		name,
		step,
		min,
		max,
		'aria-invalid': ariaInvalid,
		...restProps
	}: Props = $props();

	const inputClasses = cn(
		'flex h-spacing-input w-full rounded-input border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground theme-transition-fast',
		'focus:border-input-hover focus:outline-none focus:ring-2 focus:ring-dark focus:ring-offset-2 focus:ring-offset-background',
		'disabled:cursor-not-allowed disabled:opacity-50',
		'file:border-0 file:bg-transparent file:text-sm file:font-medium',
		className
	);
</script>

<input
	{id}
	{name}
	{type}
	{placeholder}
	{disabled}
	{step}
	{min}
	{max}
	bind:value
	class={inputClasses}
	aria-invalid={ariaInvalid}
	{...restProps}
/>