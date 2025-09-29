<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		class?: string;
		id?: string;
		name?: string;
		rows?: number;
	}

	let {
		value = $bindable(),
		placeholder,
		disabled = false,
		class: className = '',
		id,
		name,
		rows = 3,
		...restProps
	}: Props = $props();

	const textareaClasses = cn(
		'flex min-h-[80px] w-full rounded-input border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground theme-transition-fast',
		'focus:border-input-hover focus:outline-none focus:ring-2 focus:ring-dark focus:ring-offset-2 focus:ring-offset-background',
		'disabled:cursor-not-allowed disabled:opacity-50 resize-none',
		className
	);
</script>

<textarea
	{id}
	{name}
	{placeholder}
	{disabled}
	{rows}
	bind:value
	class={textareaClasses}
	{...restProps}
></textarea>