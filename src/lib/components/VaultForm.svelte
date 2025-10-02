<script lang="ts">
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { valibotClient } from 'sveltekit-superforms/adapters';
	import { type VaultSchema, vaultSchema } from '$lib/schemas/expense';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import Label from '$lib/components/ui/Label.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import IconDisplay from '$lib/components/IconDisplay.svelte';
	import Palette from 'phosphor-svelte/lib/Palette';
	import Lock from 'phosphor-svelte/lib/Lock';
	import Globe from 'phosphor-svelte/lib/Globe';
	import Vault from 'phosphor-svelte/lib/Vault';

	interface Props {
		formData: SuperValidated<Infer<VaultSchema>>;
		isEdit?: boolean;
		vault?: {
			id: string;
			name: string;
			isPersonal: boolean;
		};
	}

	let { formData, isEdit = false, vault }: Props = $props();

	const { form, errors, enhance, submitting } = superForm(formData, {
		validators: valibotClient(vaultSchema),
		resetForm: !isEdit,
		dataType: 'form'
	});

	function handleCancel() {
		window.history.back();
	}

	// Initialize default values if not already set
	$effect(() => {
		// Ensure color has a valid value
		if (!$form.color || $form.color === '') {
			console.log('Setting default color');
			$form.color = '#3B82F6';
		}

		// Ensure iconType has a value
		if (!$form.iconType || $form.iconType === '') {
			console.log('Setting default iconType');
			$form.iconType = 'emoji';
		}

		// Sync selectedIconType with form iconType
		if ($form.iconType && selectedIconType !== $form.iconType) {
			selectedIconType = $form.iconType as 'emoji' | 'phosphor';
		}

		// Ensure icon has a value
		if (!$form.icon || $form.icon === '') {
			console.log('Setting default icon');
			$form.icon = '🏦';
		}

		// Set default for isPersonal only for new vaults
		if (!isEdit && ($form.isPersonal === undefined || $form.isPersonal === null)) {
			console.log('Setting default isPersonal');
			$form.isPersonal = true;
		}
	});

	let selectedIconType: 'emoji' | 'phosphor' = $state($form.iconType || 'emoji');
	let showColorPicker = $state(false);
	let showIconPicker = $state(false);

	// Icon options
	const iconOptions = [
		{ emoji: '🏦', phosphor: 'vault', label: 'Bank/Vault' },
		{ emoji: '💰', phosphor: 'money', label: 'Money' },
		{ emoji: '💳', phosphor: 'credit-card', label: 'Credit Card' },
		{ emoji: '🏠', phosphor: 'house', label: 'Home' },
		{ emoji: '🚗', phosphor: 'car', label: 'Car' },
		{ emoji: '🛒', phosphor: 'shopping-cart', label: 'Shopping' },
		{ emoji: '🍽️', phosphor: 'fork-knife', label: 'Food' },
		{ emoji: '✈️', phosphor: 'airplane', label: 'Travel' },
		{ emoji: '💊', phosphor: 'pill', label: 'Health' },
		{ emoji: '🎓', phosphor: 'graduation-cap', label: 'Education' },
		{ emoji: '🎯', phosphor: 'target', label: 'Goals' },
		{ emoji: '📱', phosphor: 'device-mobile', label: 'Tech' }
	];

	// Color options
	const colorOptions = [
		'#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444',
		'#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
	];

	function selectColor(color: string) {
		$form.color = color;
		showColorPicker = false;
        console.log('color', color)
	}

	function selectIcon(option: typeof iconOptions[0]) {
		if (selectedIconType === 'emoji') {
			$form.icon = option.emoji;
		} else {
			$form.icon = option.phosphor;
		}
		$form.iconType = selectedIconType;
		showIconPicker = false;
	}

	$effect(() => {
		$form.iconType = selectedIconType;
	});
</script>

<form method="POST" use:enhance class="space-y-6">
	<!-- Vault Name -->
	<div class="space-y-2">
		<Label for="name">Vault Name</Label>
		<Input
			id="name"
			name="name"
			type="text"
			placeholder="Enter vault name"
			bind:value={$form.name}
			disabled={(vault?.isPersonal && isEdit) || $submitting}
			aria-invalid={$errors.name ? 'true' : undefined}
		/>
		{#if $errors.name}
			<p class="text-sm text-destructive">{$errors.name}</p>
		{/if}
		{#if vault?.isPersonal && isEdit}
			<p class="text-sm text-muted-foreground">Personal vault names cannot be changed.</p>
		{/if}
	</div>

	<!-- Description -->
	<div class="space-y-2">
		<Label for="description">Description (Optional)</Label>
		<Textarea
			id="description"
			name="description"
			placeholder="Enter vault description"
			bind:value={$form.description}
			disabled={$submitting}
			rows={3}
		/>
		{#if $errors.description}
			<p class="text-sm text-destructive">{$errors.description}</p>
		{/if}
	</div>

	<!-- Vault Type (only for create) -->
	{#if !isEdit}
		<div class="space-y-2">
			<Label>Vault Type</Label>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<button
					type="button"
					onclick={() => ($form.isPersonal = true)}
					class="relative flex items-center p-4 border rounded-input transition-colors theme-transition-fast {$form.isPersonal
						? 'border-dark bg-accent text-accent-foreground'
						: 'border-input bg-background hover:bg-accent'}"
				>
					<Lock class="w-5 h-5 mr-3 flex-shrink-0" />
					<div class="text-left">
						<h3 class="font-medium">Personal Vault</h3>
						<p class="text-sm text-muted-foreground">Private to you only</p>
					</div>
				</button>
				<button
					type="button"
					onclick={() => ($form.isPersonal = false)}
					class="relative flex items-center p-4 border rounded-input transition-colors theme-transition-fast {!$form.isPersonal
						? 'border-dark bg-accent text-accent-foreground'
						: 'border-input bg-background hover:bg-accent'}"
				>
					<Globe class="w-5 h-5 mr-3 flex-shrink-0" />
					<div class="text-left">
						<h3 class="font-medium">Shared Vault</h3>
						<p class="text-sm text-muted-foreground">Share with others</p>
					</div>
				</button>
			</div>
		</div>
	{/if}

	<!-- Color Selection -->
	<div class="space-y-2">
		<Label>Vault Color</Label>
		<div class="flex items-center space-x-3">
			<button
				type="button"
				onclick={() => (showColorPicker = !showColorPicker)}
				class="flex items-center space-x-2 px-3 py-2 border border-input rounded-input bg-background hover:bg-accent transition-colors theme-transition-fast"
				disabled={$submitting}
			>
				<div class="w-6 h-6 rounded-full border-2 border-border" style="background-color: {$form.color}"></div>
				<span class="text-sm">{$form.color}</span>
				<Palette class="w-4 h-4" />
			</button>
		</div>
		{#if showColorPicker}
			<div class="grid grid-cols-5 gap-2 p-4 border border-border rounded-input bg-background">
				{#each colorOptions as color}
					<button
						type="button"
						onclick={() => selectColor(color)}
						class="w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 {$form.color === color
							? 'border-foreground ring-2 ring-dark ring-offset-2 ring-offset-background'
							: 'border-border'}"
						style="background-color: {color}"
						title={color}
					></button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Icon Selection -->
	<div class="space-y-2">
		<Label>Vault Icon</Label>
		<div class="space-y-3">
			<!-- Icon Type Toggle -->
			<div class="flex items-center space-x-2">
				<button
					type="button"
					onclick={() => (selectedIconType = 'emoji')}
					class="px-3 py-1 text-sm rounded-5px transition-colors theme-transition-fast {selectedIconType === 'emoji'
						? 'bg-dark text-background'
						: 'bg-muted text-muted-foreground hover:bg-muted/80'}"
					disabled={$submitting}
				>
					Emoji
				</button>
				<button
					type="button"
					onclick={() => (selectedIconType = 'phosphor')}
					class="px-3 py-1 text-sm rounded-5px transition-colors theme-transition-fast {selectedIconType === 'phosphor'
						? 'bg-dark text-background'
						: 'bg-muted text-muted-foreground hover:bg-muted/80'}"
					disabled={$submitting}
				>
					Icon
				</button>
			</div>

			<!-- Current Icon Display -->
			<button
				type="button"
				onclick={() => (showIconPicker = !showIconPicker)}
				class="flex items-center space-x-3 px-3 py-2 border border-input rounded-input bg-background hover:bg-accent transition-colors theme-transition-fast"
				disabled={$submitting}
			>
				<div class="w-8 h-8 flex items-center justify-center rounded-input" style="background-color: {$form.color}20; border: 2px solid {$form.color}">
					{#if $form.icon}
						<IconDisplay icon={$form.icon} iconType={$form.iconType} size="md" />
					{:else}
						<Vault class="w-5 h-5" style="color: {$form.color}" />
					{/if}
				</div>
				<span class="text-sm">Choose Icon</span>
			</button>

			<!-- Icon Picker -->
			{#if showIconPicker}
				<div class="grid grid-cols-4 gap-2 p-4 border border-border rounded-input bg-background">
					{#each iconOptions as option}
						<button
							type="button"
							onclick={() => selectIcon(option)}
							class="flex flex-col items-center p-3 rounded-input border border-input hover:bg-accent transition-colors theme-transition-fast"
							title={option.label}
						>
							{#if selectedIconType === 'emoji'}
								<span class="text-xl mb-1">{option.emoji}</span>
							{:else}
								<IconDisplay icon={option.phosphor} iconType="phosphor" size="lg" />
							{/if}
							<span class="text-xs text-muted-foreground">{option.label}</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Hidden inputs for form submission -->
		<input type="hidden" name="icon" bind:value={$form.icon} />
		<input type="hidden" name="iconType" bind:value={$form.iconType} />
		<input type="hidden" name="color" bind:value={$form.color} />
		{#if !isEdit}
			<input type="hidden" name="isPersonal" bind:value={$form.isPersonal} />
		{/if}
	</div>

	{#if $errors.color}
		<p class="text-sm text-destructive">{$errors.color}</p>
	{/if}

	<!-- Form Actions -->
	<div class="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
		<Button type="submit" disabled={$submitting} class="w-full sm:w-auto">
			{#if $submitting}
				{isEdit ? 'Saving...' : 'Creating...'}
			{:else}
				{isEdit ? 'Save Changes' : 'Create Vault'}
			{/if}
		</Button>
		<Button
			type="button"
			variant="outline"
			onclick={handleCancel}
			disabled={$submitting}
			class="w-full sm:w-auto"
		>
			Cancel
		</Button>
	</div>
</form>
