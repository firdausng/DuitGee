<script lang="ts">
	import { Sun, Moon } from 'phosphor-svelte';
	import { theme } from '$lib/stores/theme.svelte.js';
	import Button from './Button.svelte';

	interface Props {
		variant?: 'default' | 'ghost' | 'outline';
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	}

	let {
		variant = 'ghost',
		size = 'sm',
		class: className = ''
	}: Props = $props();
</script>

<Button
	{variant}
	{size}
	onclick={() => theme.toggle()}
	title={theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'}
	class="relative {className}"
>
	{#if theme.isDark}
		<Sun class="w-4 h-4 transition-transform duration-200" />
		<span class="sr-only">Switch to light mode</span>
	{:else}
		<Moon class="w-4 h-4 transition-transform duration-200" />
		<span class="sr-only">Switch to dark mode</span>
	{/if}
</Button>