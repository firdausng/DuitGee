<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		class?: string;
	}

	let { class: className = '', ...restProps }: Props = $props();

	const cardClasses = cn(
		'rounded-card border border-border bg-background text-foreground shadow-card theme-transition',
		className
	);
</script>

<div class={cardClasses} {...restProps}>
	<slot />
</div>