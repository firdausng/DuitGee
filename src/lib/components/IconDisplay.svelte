<script lang="ts">
	import * as Icons from 'phosphor-svelte';

	interface Props {
		icon?: string;
		iconType?: 'emoji' | 'phosphor';
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	}

	let { icon, iconType = 'emoji', size = 'md', class: className = '' }: Props = $props();

	// Size mappings for Phosphor icons
	const sizeMap = {
		sm: 16,
		md: 20,
		lg: 24
	};

	// Get the Phosphor icon component
	function getPhosphorIcon(iconName: string) {
		// Convert kebab-case or snake_case to PascalCase
		const pascalCase = iconName
			.split(/[-_]/)
			.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join('');

		// Try different icon variations
		const variations = [
			pascalCase,
			pascalCase + 'Icon',
			pascalCase.replace(/Icon$/, ''),
		];

		for (const variation of variations) {
			if (Icons[variation as keyof typeof Icons]) {
				return Icons[variation as keyof typeof Icons];
			}
		}

		// Fallback to a default icon
		return Icons.Circle;
	}
</script>

{#if icon}
	{#if iconType === 'phosphor'}
		{@const IconComponent = getPhosphorIcon(icon)}
		<IconComponent size={sizeMap[size]} class={className} />
	{:else}
		<!-- Emoji display -->
		<span class="inline-block {className}" style="font-size: {sizeMap[size]}px; line-height: 1;">
			{icon}
		</span>
	{/if}
{/if}
