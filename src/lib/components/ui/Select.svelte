<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		value?: string;
		disabled?: boolean;
		class?: string;
		name?: string;
		'aria-invalid'?: string;
	}

	let {
		value = $bindable(),
		disabled = false,
		class: className = '',
		name,
		'aria-invalid': ariaInvalid,
		...restProps
	}: Props = $props();

	const selectClasses = cn(
		'flex h-spacing-input w-full rounded-input border border-input bg-background px-3 py-2 text-sm text-foreground theme-transition-fast',
		'focus:border-input-hover focus:outline-none focus:ring-2 focus:ring-dark focus:ring-offset-2 focus:ring-offset-background',
		'disabled:cursor-not-allowed disabled:opacity-50',
		className
	);
</script>

<select
	{name}
	{disabled}
	bind:value
	class={selectClasses}
	aria-invalid={ariaInvalid}
	{...restProps}
>
	<slot />
</select>