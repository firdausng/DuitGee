<script lang="ts">
	import Lightning from 'phosphor-svelte/lib/Lightning';
	import CaretDown from 'phosphor-svelte/lib/CaretDown';

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

	let isExpanded = $state(false);

	// Templates are already sorted by database (usageCount DESC, lastUsedAt DESC)
	// Just limit the visible count for initial display
	let visibleTemplates = $derived(
		maxVisible ? templates.slice(0, maxVisible) : templates
	);

	let hasMore = $derived(templates.length > maxVisible);
	let showAll = $state(false);

	let displayedTemplates = $derived(
		showAll ? templates : visibleTemplates
	);

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(amount);
	}
</script>

{#if templates.length > 0}
	<div class="border rounded-md">
		<!-- Collapsible Header -->
		<button
			type="button"
			onclick={() => isExpanded = !isExpanded}
			class="w-full flex items-center justify-between gap-2 px-3 py-2 hover:bg-accent transition-colors"
		>
			<div class="flex items-center gap-2">
				<Lightning class="w-3.5 h-3.5 text-primary" weight="fill" />
				<span class="text-xs font-medium text-foreground">Quick Templates</span>
				<span class="text-xs text-muted-foreground">({templates.length})</span>
			</div>
			<CaretDown class="w-3.5 h-3.5 text-muted-foreground transition-transform {isExpanded ? 'rotate-180' : ''}" />
		</button>

		{#if isExpanded}
			<div class="border-t">
				<!-- Horizontal Scroll for all screen sizes -->
				<div class="overflow-x-auto px-2 py-2">
					<div class="flex gap-2">
						{#each displayedTemplates as template}
							<button
								type="button"
								onclick={() => onSelectTemplate(template)}
								class="flex-shrink-0 px-2.5 py-1.5 bg-accent/50 hover:bg-accent rounded border border-transparent hover:border-primary transition-all active:scale-95"
							>
								<div class="text-left">
									<div class="text-xs font-medium text-foreground whitespace-nowrap">
										{template.name}
									</div>
									{#if template.defaultAmount}
										<div class="text-xs text-muted-foreground whitespace-nowrap">
											{formatCurrency(template.defaultAmount)}
										</div>
									{/if}
								</div>
							</button>
						{/each}

						{#if hasMore && !showAll}
							<button
								type="button"
								onclick={() => showAll = true}
								class="flex-shrink-0 px-2.5 py-1.5 bg-primary/10 hover:bg-primary/20 rounded border border-primary/20 hover:border-primary/40 transition-all"
							>
								<div class="text-xs font-medium text-primary whitespace-nowrap">
									Show All ({templates.length - maxVisible} more)
								</div>
							</button>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}
