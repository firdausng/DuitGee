<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Label from '$lib/components/ui/Label.svelte';
	import Trash from 'phosphor-svelte/lib/Trash';
	import Plus from 'phosphor-svelte/lib/Plus';

	interface Props {
		onSubmit: (data: { name: string; slug: string; metadata?: Record<string, any> }) => Promise<void>;
		onCancel: () => void;
		isSubmitting?: boolean;
	}

	let {
		onSubmit,
		onCancel,
		isSubmitting = false
	}: Props = $props();

	let orgName = $state('');
	let orgSlug = $state('');
	let metadataEntries = $state<Array<{ key: string; value: string }>>([]);

	// Auto-generate slug from name
	$effect(() => {
		if (orgName && !orgSlug) {
			orgSlug = orgName
				.toLowerCase()
				.trim()
				.replace(/[^\w\s-]/g, '')
				.replace(/[\s_-]+/g, '-')
				.replace(/^-+|-+$/g, '');
		}
	});

	function addMetadataEntry() {
		metadataEntries = [...metadataEntries, { key: '', value: '' }];
	}

	function removeMetadataEntry(index: number) {
		metadataEntries = metadataEntries.filter((_, i) => i !== index);
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!orgName.trim() || !orgSlug.trim()) {
			alert('Please fill in all required fields');
			return;
		}

		// Convert metadata entries to object
		const metadata: Record<string, any> = {};
		metadataEntries.forEach(entry => {
			if (entry.key.trim()) {
				// Try to parse value as JSON, otherwise use as string
				try {
					metadata[entry.key.trim()] = JSON.parse(entry.value);
				} catch {
					metadata[entry.key.trim()] = entry.value;
				}
			}
		});

		await onSubmit({
			name: orgName.trim(),
			slug: orgSlug.trim(),
			metadata: Object.keys(metadata).length > 0 ? metadata : undefined
		});
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	<!-- Organization Name -->
	<div class="space-y-2">
		<Label for="org-name">Organization Name <span class="text-destructive">*</span></Label>
		<Input
			id="org-name"
			bind:value={orgName}
			placeholder="e.g., Acme Corporation"
			disabled={isSubmitting}
		/>
		<p class="text-xs text-muted-foreground">The display name for your organization</p>
	</div>

	<!-- Organization Slug -->
	<div class="space-y-2">
		<Label for="org-slug">Slug <span class="text-destructive">*</span></Label>
		<Input
			id="org-slug"
			bind:value={orgSlug}
			placeholder="e.g., acme-corporation"
			disabled={isSubmitting}
		/>
		<p class="text-xs text-muted-foreground">
			URL-friendly identifier. Auto-generated from name if left empty.
		</p>
	</div>

	<!-- Metadata Section -->
	<div class="space-y-2">
		<div class="flex items-center justify-between">
			<Label>Metadata (Optional)</Label>
			<Button
				type="button"
				variant="outline"
				size="sm"
				onclick={addMetadataEntry}
				disabled={isSubmitting}
			>
				<Plus class="w-4 h-4 mr-1" />
				Add Field
			</Button>
		</div>

		{#if metadataEntries.length > 0}
			<div class="space-y-3 mt-2">
				{#each metadataEntries as entry, index}
					<div class="flex gap-2 items-start">
						<div class="flex-1 grid grid-cols-2 gap-2">
							<Input
								placeholder="Key"
								bind:value={entry.key}
								disabled={isSubmitting}
							/>
							<Input
								placeholder="Value"
								bind:value={entry.value}
								disabled={isSubmitting}
							/>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onclick={() => removeMetadataEntry(index)}
							disabled={isSubmitting}
							class="h-10 w-10 p-0 flex-shrink-0"
						>
							<Trash class="w-4 h-4 text-destructive" />
						</Button>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-xs text-muted-foreground">
				Add custom key-value pairs for additional organization data
			</p>
		{/if}
	</div>

	<!-- Action Buttons -->
	<div class="flex gap-3 justify-end pt-4">
		<Button
			type="button"
			variant="outline"
			onclick={onCancel}
			disabled={isSubmitting}
		>
			Cancel
		</Button>
		<Button
			type="submit"
			disabled={isSubmitting || !orgName.trim() || !orgSlug.trim()}
		>
			{isSubmitting ? 'Creating...' : 'Create Organization'}
		</Button>
	</div>
</form>
