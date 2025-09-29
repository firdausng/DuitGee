<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		class?: string;
		for?: string;
	}

	let { class: className = '', for: htmlFor, ...restProps }: Props = $props();

	const labelClasses = cn(
		'text-sm font-medium text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
		className
	);
</script>

<label class={labelClasses} for={htmlFor} {...restProps}>
	<slot />
</label>