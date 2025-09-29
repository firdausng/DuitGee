<script lang="ts">
	import { Button as ButtonPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';

	interface Props {
		variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
		size?: 'default' | 'sm' | 'md' | 'lg' | 'icon';
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		class?: string;
		onclick?: () => void;
		href?: string;
	}

	let {
		variant = 'default',
		size = 'default',
		disabled = false,
		type = 'button',
		class: className = '',
		onclick,
		href,
		...restProps
	}: Props = $props();

	const variants = {
		default:
			'bg-dark text-background hover:bg-dark/90 focus-visible:ring-dark shadow-btn',
		destructive:
			'bg-destructive text-background hover:bg-destructive/90 focus-visible:ring-destructive shadow-btn',
		outline:
			'border border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-dark shadow-btn',
		secondary:
			'bg-muted text-muted-foreground hover:bg-muted/80 focus-visible:ring-dark shadow-btn',
		ghost: 'hover:bg-accent hover:text-accent-foreground focus-visible:ring-dark',
		link: 'text-dark underline-offset-4 hover:underline focus-visible:ring-dark'
	};

	const sizes = {
		default: 'h-10 px-4 py-2',
		sm: 'h-8 px-3 text-sm',
		md: 'h-10 px-4 py-2',
		lg: 'h-12 px-8 text-lg',
		icon: 'h-10 w-10'
	};

	const buttonVariants = cn(
		'inline-flex items-center justify-center whitespace-nowrap rounded-button text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
		variants[variant],
		sizes[size],
		className
	);
</script>

{#if href}
	<a {href} class={buttonVariants} {...restProps}>
		<slot />
	</a>
{:else}
	<ButtonPrimitive.Root
		{type}
		{disabled}
		class={buttonVariants}
		onclick={onclick}
		{...restProps}
	>
		<slot />
	</ButtonPrimitive.Root>
{/if}