<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { valibotClient } from 'sveltekit-superforms/adapters';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { ofetch } from 'ofetch';
	import { Spinner } from '$lib/components/ui/spinner';
    import {updateVaultRequestSchema} from "$lib/schemas/vaults";
    import {Checkbox} from "$lib/components/ui/checkbox";

	let { data } = $props();

	let isLoading = $state(false);
	let showDeleteConfirm = $state(false);
	let isDeleting = $state(false);

	const { form, errors, enhance, delayed, constraints } = superForm(data.form, {
		validators: valibotClient(updateVaultRequestSchema),
		SPA: true,
		async onUpdate({ form }) {
			if (!form.valid) {
				throw new Error('Form is not valid');
			}

			isLoading = true;

			try {
				const response = await ofetch('/api/updateVault', {
					method: 'POST',
					body: form.data,
					headers: {
						'Content-Type': 'application/json'
					}
				});

				if (response.success === false) {
					throw new Error('Failed to update vault');
				}

				// Redirect back to vault
				await goto(`/vaults/${data.vaultId}`);
			} catch (error: any) {
				console.error({
					...error,
					message: '[vault:edit:action] Failed to update vault'
				});
			} finally {
				isLoading = false;
			}
		}
	});

	function handleBack() {
		goto(`/vaults/${data.vaultId}`);
	}

	async function handleDelete() {
		if (!showDeleteConfirm) {
			showDeleteConfirm = true;
			return;
		}

		isDeleting = true;

		try {
			const response = await ofetch('/api/deleteVault', {
				method: 'POST',
				body: {
					id: data.vaultId,
				},
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (response.success === false) {
				throw new Error('Failed to delete expense');
			}

			// Redirect back to vault
			await goto(`/vaults/${data.vaultId}`);
		} catch (error: any) {
			console.error({
				...error,
				message: '[vault:edit:delete] Failed to delete vault'
			});
		} finally {
			isDeleting = false;
			showDeleteConfirm = false;
		}
	}

	function cancelDelete() {
		showDeleteConfirm = false;
	}

    const colorOptions = [
        { value: '#3B82F6', label: 'Blue' },
        { value: '#10B981', label: 'Green' },
        { value: '#F59E0B', label: 'Amber' },
        { value: '#EF4444', label: 'Red' },
        { value: '#8B5CF6', label: 'Purple' },
        { value: '#EC4899', label: 'Pink' },
        { value: '#06B6D4', label: 'Cyan' },
        { value: '#6366F1', label: 'Indigo' },
    ];

    const iconOptions = ['🏦', '💰', '💳', '💵', '🏢', '🏠', '🚗', '✈️', '🍔', '🎮', '📱', '🎯'];

</script>

<svelte:head>
	<title>Edit Vault - DuitGee</title>
</svelte:head>

<div class="container mx-auto py-8 px-4 max-w-2xl">
	<!-- Header -->
	<div class="mb-6">
		<Button variant="ghost" onclick={handleBack} class="mb-4 -ml-2">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-4 w-4 mr-2"
				viewBox="0 0 20 20"
				fill="currentColor"
			>
				<path
					fill-rule="evenodd"
					d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
					clip-rule="evenodd"
				/>
			</svg>
			Back to Vault
		</Button>

		<h1 class="text-2xl font-bold">Edit Expense</h1>
		<p class="text-sm text-muted-foreground mt-1">
			Update your expense details or delete it
		</p>
	</div>

	<!-- Expense Form -->
	{#if isLoading || isDeleting}
		<Spinner />
	{:else}
		<Card>
			<CardHeader>
				<CardTitle>Vault Details</CardTitle>
				<CardDescription>
					Update the vault information
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form method="POST" use:enhance class="space-y-6">
					<!-- Hidden fields -->
					<input type="hidden" name="id" bind:value={$form.id} />

                    <!-- isDefault Field -->
                    <div class="space-y-2 flex items-center gap-3">
                        <Checkbox id="isDefault"
                                  name="isDefault"
                                  aria-invalid={$errors.isDefault ? 'true' : undefined}
                                  bind:checked={$form.isDefault}
                                  {...$constraints.isDefault}
                                  disabled={isLoading}
                                  class={$errors.isDefault ? 'border-destructive' : ''}

                        />
                        <div class="grid gap-2">
                            <Label for="terms-2">Set this as default vault</Label>
                            <p class="text-muted-foreground text-sm">
                                By clicking this checkbox, this vault will be opened automatically when you open the app.
                            </p>
                        </div>
                        {#if $errors.isDefault}
                            <p class="text-sm text-destructive">{$errors.isDefault}</p>
                        {/if}
                    </div>

                    <!-- Name Field -->
                    <div class="space-y-2">
                        <Label for="name">
                            Vault Name <span class="text-destructive">*</span>
                        </Label>
                        <Input
                                id="name"
                                name="name"
                                aria-invalid={$errors.name ? 'true' : undefined}
                                bind:value={$form.name}
                                {...$constraints.name}
                                disabled={isLoading}
                                placeholder="e.g., Personal Expenses, Work Travel"
                                class={$errors.name ? 'border-destructive' : ''}
                        />
                        {#if $errors.name}
                            <p class="text-sm text-destructive">{$errors.name}</p>
                        {/if}
                    </div>

                    <!-- Description Field -->
                    <div class="space-y-2">
                        <Label for="description">Description</Label>
                        <textarea
                                id="description"
                                name="description"
                                bind:value={$form.description}
                                disabled={isLoading}
                                placeholder="Optional description for this vault"
                                rows="3"
                                class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        ></textarea>
                        {#if $errors.description}
                            <p class="text-sm text-destructive">{$errors.description}</p>
                        {/if}
                    </div>

                    <!-- Color Picker -->
                    <div class="space-y-2">
                        <Label>Vault Color</Label>
                        <div class="grid grid-cols-8 gap-2">
                            {#each colorOptions as color}
                                <button
                                        type="button"
                                        class="w-10 h-10 rounded-md border-2 transition-all hover:scale-110"
                                        class:ring-2={$form.color === color.value}
                                        class:ring-ring={$form.color === color.value}
                                        class:ring-offset-2={$form.color === color.value}
                                        style="background-color: {color.value}"
                                        onclick={() => $form.color = color.value}
                                        disabled={isLoading}
                                        aria-label={color.label}
                                ></button>
                            {/each}
                        </div>
                        {#if $errors.color}
                            <p class="text-sm text-destructive">{$errors.color}</p>
                        {/if}
                    </div>

                    <!-- Icon Picker -->
                    <div class="space-y-2">
                        <Label>Vault Icon</Label>
                        <div class="grid grid-cols-6 sm:grid-cols-12 gap-2">
                            {#each iconOptions as iconOption}
                                <button
                                        type="button"
                                        class="w-10 h-10 text-2xl rounded-md border-2 transition-all hover:scale-110 flex items-center justify-center"
                                        class:ring-2={$form.icon === iconOption}
                                        class:ring-ring={$form.icon === iconOption}
                                        class:ring-offset-2={$form.icon === iconOption}
                                        class:border-primary={$form.icon === iconOption}
                                        onclick={() => $form.icon = iconOption}
                                        disabled={isLoading}
                                        aria-label={`Icon ${iconOption}`}
                                >
                                    {iconOption}
                                </button>
                            {/each}
                        </div>
                        {#if $errors.icon}
                            <p class="text-sm text-destructive">{$errors.icon}</p>
                        {/if}
                    </div>

					<!-- Actions -->
					<div class="space-y-3 pt-4">
						<div class="flex gap-3">
							<Button type="submit" disabled={$delayed} class="flex-1">
								{#if $delayed}
									Updating...
								{:else}
									Update Vault
								{/if}
							</Button>
							<Button type="button" variant="outline" onclick={handleBack} disabled={$delayed}>
								Cancel
							</Button>
						</div>

						<!-- Delete Section -->
						{#if showDeleteConfirm}
							<div class="border border-destructive rounded-lg p-4 space-y-3">
								<p class="text-sm text-destructive font-medium">
									Are you sure you want to delete this expense? This action cannot be undone.
								</p>
								<div class="flex gap-2">
									<Button
										type="button"
										variant="destructive"
										onclick={handleDelete}
										disabled={isDeleting}
										class="flex-1"
									>
										{#if isDeleting}
											Deleting...
										{:else}
											Confirm Delete
										{/if}
									</Button>
									<Button
										type="button"
										variant="outline"
										onclick={cancelDelete}
										disabled={isDeleting}
									>
										Cancel
									</Button>
								</div>
							</div>
						{:else}
							<Button
								type="button"
								variant="outline"
								onclick={handleDelete}
								class="w-full text-destructive hover:text-destructive"
							>
								Delete Expense
							</Button>
						{/if}
					</div>
				</form>
			</CardContent>
		</Card>
	{/if}
</div>
