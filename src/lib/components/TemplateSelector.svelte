<script lang="ts">
	import Lightning from 'phosphor-svelte/lib/Lightning';
	import Clock from 'phosphor-svelte/lib/Clock';

	type ExpenseTemplate = {
		id: string;
		name: string;
		icon: string;
		defaultAmount?: number;
		category?: {
			name: string;
			color: string;
		} | null;
		usageCount: number;
	};

	interface Props {
		templates: ExpenseTemplate[];
		onSelectTemplate: (template: ExpenseTemplate) => void;
		maxVisible?: number;
	}

	let {
		templates,
		onSelectTemplate,
		maxVisible = 6
	}: Props = $props();

	// Sort by usage count and recent usage
	let sortedTemplates = $derived(
		[...templates].sort((a, b) => b.usageCount - a.usageCount).slice(0, maxVisible)
	);

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(amount);
	}
</script>

{#if sortedTemplates.length > 0}
	<div class="bg-background border rounded-lg p-3 sm:p-4">
		<div class="flex items-center gap-2 mb-3">
			<Lightning class="w-4 h-4 text-primary" weight="fill" />
			<h3 class="text-sm font-medium text-foreground">Quick Add</h3>
		</div>

		<!-- Mobile: Horizontal Scroll -->
		<div class="sm:hidden overflow-x-auto -mx-3 px-3">
			<div class="flex gap-2 pb-2">
				{#each sortedTemplates as template}
					<button
						type="button"
						onclick={() => onSelectTemplate(template)}
						class="flex-shrink-0 w-32 bg-accent/50 hover:bg-accent rounded-lg p-2.5 border-2 border-transparent hover:border-primary transition-all active:scale-95"
					>
						<div class="flex flex-col gap-1.5">
							<span class="text-2xl">{template.icon}</span>
							<span class="text-xs font-medium text-foreground truncate text-left">
								{template.name}
							</span>
							{#if template.defaultAmount}
								<span class="text-xs text-muted-foreground text-left">
									{formatCurrency(template.defaultAmount)}
								</span>
							{/if}
							{#if template.category}
								<div class="flex items-center gap-1">
									<div
										class="w-2 h-2 rounded-full"
										style="background-color: {template.category.color}"
									></div>
									<span class="text-xs text-muted-foreground truncate">
										{template.category.name}
									</span>
								</div>
							{/if}
						</div>
					</button>
				{/each}
			</div>
		</div>

		<!-- Desktop: Grid -->
		<div class="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
			{#each sortedTemplates as template}
				<button
					type="button"
					onclick={() => onSelectTemplate(template)}
					class="flex items-center gap-3 p-3 bg-accent/50 hover:bg-accent rounded-lg border-2 border-transparent hover:border-primary transition-all text-left"
				>
					<span class="text-2xl flex-shrink-0">{template.icon}</span>
					<div class="flex-1 min-w-0">
						<div class="text-sm font-medium text-foreground truncate">
							{template.name}
						</div>
						{#if template.defaultAmount}
							<div class="text-xs text-muted-foreground">
								{formatCurrency(template.defaultAmount)}
							</div>
						{/if}
						{#if template.category}
							<div class="flex items-center gap-1 mt-1">
								<div
									class="w-2 h-2 rounded-full"
									style="background-color: {template.category.color}"
								></div>
								<span class="text-xs text-muted-foreground truncate">
									{template.category.name}
								</span>
							</div>
						{/if}
					</div>
					{#if template.usageCount > 0}
						<div class="flex items-center gap-1 text-xs text-muted-foreground">
							<Clock class="w-3 h-3" />
							<span>{template.usageCount}</span>
						</div>
					{/if}
				</button>
			{/each}
		</div>
	</div>
{/if}
