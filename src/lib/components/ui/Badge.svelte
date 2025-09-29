<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		variant?: 'default' | 'secondary' | 'destructive' | 'outline';
		class?: string;
	}

	let { variant = 'default', class: className = '', ...restProps }: Props = $props();

	const variants = {
		default: 'bg-dark text-background hover:bg-dark/80',
		secondary: 'bg-muted text-muted-foreground hover:bg-muted/80',
		destructive: 'bg-destructive text-background hover:bg-destructive/80',
		outline: 'text-foreground border border-input'
	};

	const badgeClasses = cn(
		'inline-flex items-center rounded-9px px-2.5 py-0.5 text-xs font-semibold transition-colors theme-transition-fast focus:outline-none focus:ring-2 focus:ring-dark focus:ring-offset-2',
		variants[variant],
		className
	);
</script>

<div class={badgeClasses} {...restProps}>
	<slot />
</div>