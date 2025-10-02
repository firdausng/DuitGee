<script lang="ts">
	import SuperDebug, {type Infer, superForm, type SuperValidated} from "sveltekit-superforms";
	import { valibotClient } from 'sveltekit-superforms/adapters';
	import {type CategoryGroupSchema, categoryGroupSchema} from '$lib/schemas/expense';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import IconDisplay from '$lib/components/IconDisplay.svelte';
	import * as Icons from 'phosphor-svelte';

	interface Props {
		formData: SuperValidated<Infer<CategoryGroupSchema>>;
		isEdit?: boolean;
	}

	let { formData, isEdit = false }: Props = $props();

	const { form, errors, enhance, submitting } = superForm(formData, {
		validators: valibotClient(categoryGroupSchema),
		resetForm: !isEdit,
	});

	function handleCancel() {
		// dispatch('cancel');
	}

	// Default color and icon
	if (!$form.color) {
		$form.color = '#3B82F6';
	}
	if (!$form.icon) {
		$form.icon = '📂';
	}
	if (!$form.iconType) {
		$form.iconType = 'emoji';
	}

	let activeTab = $state($form.iconType || 'emoji');

	const colorOptions = [
		{ value: '#3B82F6', name: 'Blue' },
		{ value: '#EF4444', name: 'Red' },
		{ value: '#10B981', name: 'Green' },
		{ value: '#F59E0B', name: 'Yellow' },
		{ value: '#8B5CF6', name: 'Purple' },
		{ value: '#EC4899', name: 'Pink' },
		{ value: '#6B7280', name: 'Gray' },
		{ value: '#F97316', name: 'Orange' }
	];

	const emojiOptions = [
		'📂', '💰', '🏠', '🚗', '🍔', '🎬', '🛒', '⚡',
		'💧', '📱', '🎓', '🏥', '✈️', '🎉', '💊', '🔧'
	];

	const phosphorOptions = [
		{ name: 'Folder', icon: 'folder' },
		{ name: 'Money', icon: 'currency-dollar' },
		{ name: 'House', icon: 'house' },
		{ name: 'Car', icon: 'car' },
		{ name: 'Hamburger', icon: 'hamburger' },
		{ name: 'Film', icon: 'film-strip' },
		{ name: 'Shopping Cart', icon: 'shopping-cart' },
		{ name: 'Lightning', icon: 'lightning' },
		{ name: 'Drop', icon: 'drop' },
		{ name: 'Phone', icon: 'phone' },
		{ name: 'Student', icon: 'student' },
		{ name: 'Heart', icon: 'heart' },
		{ name: 'Airplane', icon: 'airplane' },
		{ name: 'Party', icon: 'confetti' },
		{ name: 'Pill', icon: 'pill' },
		{ name: 'Wrench', icon: 'wrench' },
		{ name: 'Coffee', icon: 'coffee' },
		{ name: 'Gas Pump', icon: 'gas-pump' },
		{ name: 'Bus', icon: 'bus' },
		{ name: 'Train', icon: 'train' },
		{ name: 'Gamepad', icon: 'gamepad' },
		{ name: 'Music', icon: 'music-note' },
		{ name: 'Book', icon: 'book' },
		{ name: 'Gift', icon: 'gift' }
	];

	function switchIconType(type: 'emoji' | 'phosphor') {
		activeTab = type;
		$form.iconType = type;
		// Reset icon when switching types
		$form.icon = type === 'emoji' ? '📂' : 'folder';
	}
</script>

<form method="POST" use:enhance class="space-y-6">
	<div>
		<label for="name" class="block text-sm font-medium text-gray-700 mb-2">
			Group Name *
		</label>
		<Input
			id="name"
			name="name"
			bind:value={$form.name}
			placeholder="Enter group name (e.g., Bills, Transportation)"
			class="w-full"
			aria-invalid={$errors.name ? 'true' : undefined}
		/>
		{#if $errors.name}
			<p class="mt-1 text-sm text-red-600">{$errors.name}</p>
		{/if}
	</div>

	<div>
		<label for="description" class="block text-sm font-medium text-gray-700 mb-2">
			Description
		</label>
		<Textarea
			id="description"
			name="description"
			bind:value={$form.description}
			placeholder="Optional description for this category group"
			class="w-full"
			rows="3"
			aria-invalid={$errors.description ? 'true' : undefined}
		/>
		{#if $errors.description}
			<p class="mt-1 text-sm text-red-600">{$errors.description}</p>
		{/if}
	</div>

	<div>
		<label class="block text-sm font-medium text-gray-700 mb-2">
			Icon
		</label>

		<!-- Icon Type Tabs -->
		<div class="flex border-b border-gray-200 mb-4">
			<button
				type="button"
				class="px-4 py-2 text-sm font-medium border-b-2 transition-colors {
					activeTab === 'emoji'
						? 'border-indigo-500 text-indigo-600'
						: 'border-transparent text-gray-500 hover:text-gray-700'
				}"
				onclick={() => switchIconType('emoji')}
			>
				😀 Emoji
			</button>
			<button
				type="button"
				class="px-4 py-2 text-sm font-medium border-b-2 transition-colors {
					activeTab === 'phosphor'
						? 'border-indigo-500 text-indigo-600'
						: 'border-transparent text-gray-500 hover:text-gray-700'
				}"
				onclick={() => switchIconType('phosphor')}
			>
				<Icons.Circle size={16} class="inline mr-1" />
				Phosphor
			</button>
		</div>

		<!-- Icon Selection -->
		{#if activeTab === 'emoji'}
			<div class="flex flex-wrap gap-2 mb-3">
				{#each emojiOptions as emoji}
					<button
						type="button"
						class="w-10 h-10 flex items-center justify-center text-xl border-2 rounded-lg {$form.icon === emoji && $form.iconType === 'emoji' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'}"
						onclick={() => {
							$form.icon = emoji;
							$form.iconType = 'emoji';
						}}
						title={emoji}
					>
						{emoji}
					</button>
				{/each}
			</div>
			<Input
				id="icon"
				name="icon"
				bind:value={$form.icon}
				placeholder="Or enter custom emoji"
				class="w-32"
				maxlength="4"
			/>
		{:else}
			<div class="grid grid-cols-6 gap-2 mb-3">
				{#each phosphorOptions as option}
					<button
						type="button"
						class="p-3 flex flex-col items-center justify-center border-2 rounded-lg hover:border-gray-400 transition-colors {$form.icon === option.icon && $form.iconType === 'phosphor' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}"
						onclick={() => {
							$form.icon = option.icon;
							$form.iconType = 'phosphor';
						}}
						title={option.name}
					>
						<IconDisplay icon={option.icon} iconType="phosphor" size="md" />
						<span class="text-xs text-gray-600 mt-1 text-center leading-tight">{option.name}</span>
					</button>
				{/each}
			</div>
			<Input
				id="icon"
				name="icon"
				bind:value={$form.icon}
				placeholder="Or enter Phosphor icon name"
				class="w-48"
			/>
		{/if}

		<!-- Hidden inputs for form submission -->
		<input type="hidden" name="iconType" bind:value={$form.iconType} />
	</div>

	<div>
		<label for="color" class="block text-sm font-medium text-gray-700 mb-2">
			Color *
		</label>
		<div class="flex flex-wrap gap-2 mb-3">
			{#each colorOptions as color}
				<button
					type="button"
					class="w-8 h-8 rounded-full border-2 {$form.color === color.value ? 'border-gray-800' : 'border-gray-300'}"
					style="background-color: {color.value}"
					onclick={() => ($form.color = color.value)}
					title={color.name}
				></button>
			{/each}
		</div>
		<Input
			id="color"
			name="color"
			type="color"
			bind:value={$form.color}
			class="w-20 h-10"
			aria-invalid={$errors.color ? 'true' : undefined}
		/>
		{#if $errors.color}
			<p class="mt-1 text-sm text-red-600">{$errors.color}</p>
		{/if}
	</div>

	<div class="flex gap-3 pt-4">
		<Button type="submit" disabled={$submitting} class="flex-1 md:flex-none">
			{#if $submitting}
				{isEdit ? 'Updating...' : 'Creating...'}
			{:else}
				{isEdit ? 'Update Group' : 'Create Group'}
			{/if}
		</Button>
		<Button type="button" variant="outline" onclick={handleCancel} class="flex-1 md:flex-none">
			Cancel
		</Button>
	</div>
</form>
