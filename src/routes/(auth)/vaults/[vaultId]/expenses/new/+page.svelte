<script lang="ts">
	import CreateExpenseForm from '$lib/components/CreateExpenseForm.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { goto } from '$app/navigation';
	import Plus from 'phosphor-svelte/lib/Plus';
	import X from 'phosphor-svelte/lib/X';
	import Lightning from 'phosphor-svelte/lib/Lightning';
	import Clock from 'phosphor-svelte/lib/Clock';

	let { data } = $props();

	// State to track if user has selected template or skipped
	// Show form if there's a templateId in URL or if user skipped
	let showForm = $state(!!data.selectedTemplate || data.isSkipped);
	let selectedTemplateId = $state<string | null>(data.selectedTemplate?.id || null);

	// Watch for changes in data (when URL param changes)
	$effect(() => {
		if (data.selectedTemplate) {
			showForm = true;
			selectedTemplateId = data.selectedTemplate.id;
		} else if (data.isSkipped) {
			showForm = true;
			selectedTemplateId = null;
		} else {
			// No template selected and not skipped, show template selection
			showForm = false;
			selectedTemplateId = null;
		}
	});

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(amount);
	}

	function handleSkip() {
		// Navigate with skip parameter to maintain state via URL
		goto(`/vaults/${data.vaultId}/expenses/new?skip=true`);
	}

	function handleSelectTemplate(templateId: string) {
		selectedTemplateId = templateId;
		// Reload page with templateId to pre-fill form
		goto(`/vaults/${data.vaultId}/expenses/new?templateId=${templateId}`);
	}

	function handleCreateTemplate() {
		goto(`/vaults/${data.vaultId}/templates`);
	}

	function handleBackToTemplates() {
		// Navigate without any parameters to show template selection
		goto(`/vaults/${data.vaultId}/expenses/new`);
	}

	function handleSuccess() {
		goto(`/vaults/${data.vaultId}/expenses`);
	}

	function handleCancel() {
		goto(`/vaults/${data.vaultId}/expenses`);
	}
</script>

<svelte:head>
	<title>New Expense - Expense Tracker</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-4">
	{#if !showForm}
		<!-- Template Selection View -->
		<div class="mb-4 flex items-center justify-between">
			<h1 class="text-lg font-semibold text-foreground">Quick Start</h1>
			<div class="flex gap-2">
				<Button variant="outline" size="sm" onclick={handleSkip}>
					<X class="w-4 h-4 mr-1" />
					Skip
				</Button>
				<Button variant="default" size="sm" onclick={handleCreateTemplate}>
					<Plus class="w-4 h-4 mr-1" />
					New Template
				</Button>
			</div>
		</div>

		<!-- Templates Grid -->
		{#if data.templates.length === 0}
			<div class="bg-background rounded-lg border border-border p-8 text-center">
				<Lightning class="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
				<h2 class="text-base font-medium text-foreground mb-2">No templates yet</h2>
				<p class="text-sm text-muted-foreground mb-4">
					Create templates for your frequent expenses to save time.
				</p>
				<div class="flex gap-2 justify-center">
					<Button variant="outline" onclick={handleSkip}>Skip for now</Button>
					<Button onclick={handleCreateTemplate}>Create Template</Button>
				</div>
			</div>
		{:else}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
				{#each data.templates as template}
					<button
						type="button"
						onclick={() => handleSelectTemplate(template.id)}
						class="bg-background rounded-lg border border-border p-4 text-left hover:border-primary hover:shadow-md transition-all group"
					>
						<!-- Icon and Name -->
						<div class="flex items-start gap-3 mb-3">
							{#if template.icon}
								<span class="text-2xl flex-shrink-0">{template.icon}</span>
							{:else}
								<Lightning class="w-6 h-6 text-muted-foreground flex-shrink-0" />
							{/if}
							<div class="flex-1 min-w-0">
								<h3 class="font-medium text-foreground truncate group-hover:text-primary transition-colors">
									{template.name}
								</h3>
								{#if template.categoryName}
									<p class="text-xs text-muted-foreground truncate">
										{template.categoryName}
									</p>
								{/if}
							</div>
						</div>

						<!-- Amount -->
						{#if template.defaultAmount}
							<div class="text-lg font-semibold text-foreground mb-2">
								{formatCurrency(template.defaultAmount)}
							</div>
						{/if}

						<!-- Note -->
						{#if template.note}
							<p class="text-xs text-muted-foreground line-clamp-2 mb-3">
								{template.note}
							</p>
						{/if}

						<!-- Usage Stats -->
						<div class="flex items-center gap-2 text-xs text-muted-foreground">
							<Clock class="w-3 h-3" />
							<span>Used {template.usageCount} {template.usageCount === 1 ? 'time' : 'times'}</span>
						</div>
					</button>
				{/each}
			</div>

			<!-- Skip button at bottom for mobile -->
			<div class="mt-6 sm:hidden">
				<Button variant="ghost" class="w-full" onclick={handleSkip}>
					Skip and create expense manually
				</Button>
			</div>
		{/if}
	{:else}
		<!-- Expense Form View -->
		<div class="max-w-lg mx-auto">
			<!-- Header -->
			<div class="mb-4 flex items-center justify-between">
				<h1 class="text-lg font-semibold text-foreground">Add Expense</h1>
				{#if data.templates.length > 0}
					<Button variant="ghost" size="sm" onclick={handleBackToTemplates}>
						← Back to Templates
					</Button>
				{/if}
			</div>

			<!-- Form -->
			<div class="bg-background rounded-lg border border-border p-4">
				<CreateExpenseForm
					data={data.form}
					categories={data.categories}
					members={data.members}
					paymentTypes={data.paymentTypes}
					paymentProviders={data.paymentProviders}
					currentUserId={data.currentUserId}
					vaultId={data.vaultId}
				/>
			</div>
		</div>
	{/if}
</div>