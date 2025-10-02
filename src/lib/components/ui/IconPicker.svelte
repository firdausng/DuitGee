<script lang="ts">
	interface Props {
		value?: string;
		onChange?: (icon: string) => void;
	}

	let { value = $bindable('📝'), onChange }: Props = $props();

	let showPicker = $state(false);

	const iconCategories = [
		{
			name: 'Common',
			icons: ['📝', '💰', '🏷️', '⭐', '❤️', '✅', '⚡', '🔥', '💡', '🎯']
		},
		{
			name: 'Work & Business',
			icons: ['💼', '📊', '📈', '💻', '🖥️', '📱', '⌨️', '🖨️', '📞', '📧']
		},
		{
			name: 'Shopping & Food',
			icons: ['🛒', '🛍️', '🍔', '🍕', '☕', '🍜', '🥗', '🍰', '🥤', '🍷']
		},
		{
			name: 'Transport',
			icons: ['🚗', '🚕', '🚌', '🚇', '✈️', '🚲', '🏍️', '⛽', '🚦', '🅿️']
		},
		{
			name: 'Home & Living',
			icons: ['🏠', '🏡', '🛏️', '🛋️', '🚿', '🔑', '🔒', '💡', '🔌', '🧹']
		},
		{
			name: 'Health & Fitness',
			icons: ['💊', '🏥', '⚕️', '💪', '🏃', '🧘', '🏋️', '⛹️', '🤸', '🧠']
		},
		{
			name: 'Entertainment',
			icons: ['🎮', '🎬', '🎵', '🎸', '🎨', '📚', '🎭', '🎪', '🎲', '🎯']
		},
		{
			name: 'Nature & Weather',
			icons: ['🌞', '🌙', '⭐', '🌧️', '⛈️', '🌈', '🌸', '🌺', '🌻', '🌲']
		},
		{
			name: 'Animals',
			icons: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯']
		},
		{
			name: 'Symbols',
			icons: ['✨', '💫', '🔔', '🎁', '🎈', '🎉', '🎊', '💝', '💖', '💯']
		}
	];

	function selectIcon(icon: string) {
		value = icon;
		onChange?.(icon);
		showPicker = false;
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.icon-picker-container')) {
			showPicker = false;
		}
	}

	$effect(() => {
		if (showPicker) {
			document.addEventListener('click', handleClickOutside);
			return () => {
				document.removeEventListener('click', handleClickOutside);
			};
		}
	});
</script>

<div class="icon-picker-container relative">
	<button
		type="button"
		onclick={() => showPicker = !showPicker}
		class="w-16 h-16 border-2 rounded-lg bg-background hover:bg-accent transition-colors flex items-center justify-center text-3xl cursor-pointer"
	>
		{value}
	</button>

	{#if showPicker}
		<div class="absolute z-50 mt-2 w-80 bg-background border-2 border-border rounded-lg shadow-xl max-h-96 overflow-y-auto">
			<div class="p-3 sticky top-0 bg-background border-b border-border">
				<h4 class="text-sm font-semibold text-foreground">Select Icon</h4>
			</div>

			<div class="p-2 space-y-3">
				{#each iconCategories as category}
					<div>
						<h5 class="text-xs font-medium text-muted-foreground px-2 mb-1">{category.name}</h5>
						<div class="grid grid-cols-10 gap-1">
							{#each category.icons as icon}
								<button
									type="button"
									onclick={() => selectIcon(icon)}
									class="w-8 h-8 rounded flex items-center justify-center text-xl hover:bg-accent transition-colors {value === icon ? 'bg-primary/20 ring-2 ring-primary' : ''}"
									title={icon}
								>
									{icon}
								</button>
							{/each}
						</div>
					</div>
				{/each}
			</div>

			<div class="p-3 border-t border-border bg-muted/50">
				<p class="text-xs text-muted-foreground">
					Tip: You can also use any emoji from your system emoji picker
				</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.icon-picker-container {
		display: inline-block;
	}
</style>
