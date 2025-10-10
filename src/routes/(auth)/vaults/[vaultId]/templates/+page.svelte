<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import CreateExpenseTemplateForm from '$lib/components/CreateExpenseTemplateForm.svelte';
	import EditExpenseTemplateForm from '$lib/components/EditExpenseTemplateForm.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import AlertDialog from '$lib/components/ui/AlertDialog.svelte';
	import Plus from 'phosphor-svelte/lib/Plus';
	import Pencil from 'phosphor-svelte/lib/Pencil';
	import Trash from 'phosphor-svelte/lib/Trash';
	import Lightning from 'phosphor-svelte/lib/Lightning';
	import Clock from 'phosphor-svelte/lib/Clock';
    import type {CreateExpenseTemplate, ExpenseTemplate, UpdateExpenseTemplate} from "$lib/schemas/expense";


	let { data } = $props();

	let showCreateDialog = $state(false);
	let showEditDialog = $state(false);
	let showDeleteDialog = $state(false);
	let selectedTemplate = $state<ExpenseTemplate|null>(null);
	let isSubmitting = $state(false);

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(amount);
	}

	function handleCreate() {
		selectedTemplate = null;
		showCreateDialog = true;
	}

	function handleEdit(template: ExpenseTemplate) {
        console.log('data.members', data.members);
		selectedTemplate = {
			...template,
			defaultUserId: template.defaultUserId
		};
		showEditDialog = true;
	}

	function handleDelete(template: any) {
		selectedTemplate = template;
		showDeleteDialog = true;
	}

	async function submitCreateTemplate(formData: CreateExpenseTemplate) {
		isSubmitting = true;

        //currentUserId
		try {
            const response = await fetch(`/api/vaults/${data.vault.id}/templates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${authManager.authState?.accessToken}`
                },
                body: JSON.stringify(formData)
            });

			if (response.ok) {
				// Close dialog and refresh data without full page reload
				showCreateDialog = false;
				await invalidateAll();
			} else {
				console.error('Failed to create template');
				alert('Failed to create template. Please try again.');
			}
		} catch (error) {
			console.error('Error creating template:', error);
			alert('An error occurred. Please try again.');
		} finally {
			isSubmitting = false;
		}
	}

	async function submitEditTemplate(formData: UpdateExpenseTemplate) {
		isSubmitting = true;

		try {
            const response = await fetch(`/api/vaults/${data.vault.id}/templates/${selectedTemplate!.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${authManager.authState?.accessToken}`
                },
                body: JSON.stringify(formData)
            });

			if (response.ok) {
				// Close dialog and refresh data without full page reload
				showEditDialog = false;
				selectedTemplate = null;
				await invalidateAll();
			} else {
				console.error('Failed to update template');
				alert('Failed to update template. Please try again.');
			}
		} catch (error) {
			console.error('Error updating template:', error);
			alert('An error occurred. Please try again.');
		} finally {
			isSubmitting = false;
		}
	}

	function cancelDialog() {
		showCreateDialog = false;
		showEditDialog = false;
		selectedTemplate = null;
		isSubmitting = false;
	}

	async function submitDeleteTemplate() {
		if (!selectedTemplate) return;

		isSubmitting = true;

		try {
			const response = await fetch(`/api/vaults/${data.vault.id}/templates/${selectedTemplate.id}`, {
				method: 'DELETE',
				headers: {
					// 'Authorization': `Bearer ${authManager.authState?.accessToken}`
				}
			});

			if (response.ok) {
				// Close dialog and refresh data without full page reload
				showDeleteDialog = false;
				selectedTemplate = null;
				await invalidateAll();
			} else {
				console.error('Failed to delete template');
				alert('Failed to delete template. Please try again.');
			}
		} catch (error) {
			console.error('Error deleting template:', error);
			alert('An error occurred. Please try again.');
		} finally {
			isSubmitting = false;
		}
	}

	const paymentTypeLabels: Record<string, string> = {
		cash: 'Cash',
		e_wallet: 'E-Wallet',
		credit_card: 'Credit Card',
		debit_card: 'Debit Card',
		bank_transfer: 'Bank Transfer'
	};
</script>

<svelte:head>
	<title>Templates - {data.vault.name} - DuitGee</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
	<!-- Header -->
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-xl sm:text-2xl font-bold text-foreground">Expense Templates</h1>
			<p class="text-sm text-muted-foreground mt-1">Quick templates for common expenses</p>
		</div>
		<Button onclick={handleCreate}>
			<Plus class="w-4 h-4 mr-2" />
			<span class="hidden sm:inline">New Template</span>
			<span class="sm:hidden">New</span>
		</Button>
	</div>

	<!-- Templates List -->
	{#if data.templates.length === 0}
		<div class="bg-background border rounded-lg p-8 text-center">
			<Lightning class="w-12 h-12 mx-auto text-muted-foreground mb-3" />
			<h3 class="text-lg font-medium text-foreground mb-2">No templates yet</h3>
			<p class="text-sm text-muted-foreground mb-4">
				Create templates for expenses you add frequently
			</p>
			<Button onclick={handleCreate}>
				<Plus class="w-4 h-4 mr-2" />
				Create Your First Template
			</Button>
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each data.templates as template}
				<div class="bg-background border rounded-lg p-4 hover:shadow-md transition-shadow">
					<!-- Template Header -->
					<div class="flex items-start justify-between mb-3">
						<div class="flex items-center gap-3 flex-1 min-w-0">
							<span class="text-3xl flex-shrink-0">{template.icon}</span>
							<div class="flex-1 min-w-0">
								<h3 class="font-medium text-foreground truncate">{template.name}</h3>
								{#if template.description}
									<p class="text-xs text-muted-foreground truncate">{template.description}</p>
								{/if}
							</div>
						</div>
					</div>

					<!-- Template Details -->
					<div class="space-y-2 mb-4">
						{#if template.categoryName}
							<div class="flex items-center gap-2">
								<div class="w-3 h-3 rounded-full" style="background-color: {data.categories.find(c => c.name === template.categoryName)}"></div>
								<span class="text-sm text-muted-foreground">{template.categoryName}</span>
							</div>
						{/if}

						{#if template.defaultAmount}
							<div class="text-sm">
								<span class="text-muted-foreground">Amount: </span>
								<span class="font-medium text-foreground">{formatCurrency(template.defaultAmount)}</span>
							</div>
						{/if}

						{#if template.paymentType}
							<div class="text-sm">
								<span class="text-muted-foreground">Payment: </span>
								<span class="text-foreground">
									{paymentTypeLabels[template.paymentType] || template.paymentType}
									{#if template.paymentProvider}
										- {template.paymentProvider}
									{/if}
								</span>
							</div>
						{/if}

						{#if template.usageCount > 0}
							<div class="flex items-center gap-1 text-xs text-muted-foreground">
								<Clock class="w-3 h-3" />
								<span>Used {template.usageCount} {template.usageCount === 1 ? 'time' : 'times'}</span>
							</div>
						{/if}
					</div>

					<!-- Actions -->
					<div class="flex gap-2 pt-3 border-t">
						<Button
							variant="outline"
							size="sm"
							onclick={() => handleEdit(template)}
							class="flex-1"
						>
							<Pencil class="w-4 h-4 mr-1" />
							Edit
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onclick={() => handleDelete(template)}
						>
							<Trash class="w-4 h-4" />
						</Button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Create Dialog -->
{#if showCreateDialog}
	<Dialog
		title="Create Template"
		bind:open={showCreateDialog}
		onClose={cancelDialog}
	>
		{#snippet children()}
			<CreateExpenseTemplateForm
				categories={data.categories}
				paymentTypes={data.paymentTypes}
				paymentProviders={data.paymentProviders}
				members={data.members}
				currentUserId={data.currentUserId}
				vaultId={data.vault.id}
				onSubmit={submitCreateTemplate}
				onCancel={cancelDialog}
				isSubmitting={isSubmitting}
			/>
		{/snippet}
	</Dialog>
{/if}

<!-- Edit Dialog -->
{#if showEditDialog && selectedTemplate}
	<Dialog
		title="Edit Template"
		bind:open={showEditDialog}
		onClose={cancelDialog}
	>
		{#snippet children()}
			<EditExpenseTemplateForm
				template={selectedTemplate}
				categories={data.categories}
				paymentTypes={data.paymentTypes}
				paymentProviders={data.paymentProviders}
				members={data.members}
				currentUserId={data.currentUserId}
				vaultId={data.vault.id}
				onSubmit={submitEditTemplate}
				onCancel={cancelDialog}
				isSubmitting={isSubmitting}
			/>
		{/snippet}
	</Dialog>
{/if}

<!-- Delete Confirmation -->
{#if showDeleteDialog && selectedTemplate}
	<Dialog
		title="Delete Template"
		description="Are you sure you want to delete '{selectedTemplate.name}'? This action cannot be undone."
		bind:open={showDeleteDialog}
		onClose={() => {
			showDeleteDialog = false;
			selectedTemplate = null;
		}}
	>
		{#snippet children()}
			<div class="flex gap-3 justify-end mt-4">
				<Button
					type="button"
					variant="outline"
					onclick={() => {
						showDeleteDialog = false;
						selectedTemplate = null;
					}}
				>
					Cancel
				</Button>
				<Button
					type="button"
					variant="destructive"
					onclick={submitDeleteTemplate}
					disabled={isSubmitting}
				>
					{isSubmitting ? 'Deleting...' : 'Delete'}
				</Button>
			</div>
		{/snippet}
	</Dialog>
{/if}
