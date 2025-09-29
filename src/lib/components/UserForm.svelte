<script lang="ts">
	import SuperDebug, {type Infer, superForm, type SuperValidated} from "sveltekit-superforms";
	import { valibotClient } from 'sveltekit-superforms/adapters';
	import {type UserSchema, userSchema} from '$lib/schemas/expense';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	interface Props {
		formData: SuperValidated<Infer<UserSchema>>;
		isEdit?: boolean;
	}

	let { formData, isEdit = false }: Props = $props();

	const { form, errors, enhance, submitting } = superForm(formData, {
		validators: valibotClient(userSchema),
		resetForm: !isEdit,
	});

	function handleCancel() {
		// dispatch('cancel');
	}
</script>

<form method="POST" use:enhance class="space-y-6">
	<div>
		<label for="name" class="block text-sm font-medium text-gray-700 mb-2">
			Full Name *
		</label>
		<Input
			id="name"
			name="name"
			bind:value={$form.name}
			placeholder="Enter full name"
			class="w-full"
			aria-invalid={$errors.name ? 'true' : undefined}
		/>
		{#if $errors.name}
			<p class="mt-1 text-sm text-red-600">{$errors.name}</p>
		{/if}
	</div>

	<div>
		<label for="email" class="block text-sm font-medium text-gray-700 mb-2">
			Email Address *
		</label>
		<Input
			id="email"
			name="email"
			type="email"
			bind:value={$form.email}
			placeholder="Enter email address"
			class="w-full"
			aria-invalid={$errors.email ? 'true' : undefined}
		/>
		{#if $errors.email}
			<p class="mt-1 text-sm text-red-600">{$errors.email}</p>
		{/if}
	</div>

	<div class="flex gap-3 pt-4">
		<Button type="submit" disabled={$submitting} class="flex-1 md:flex-none">
			{#if $submitting}
				{isEdit ? 'Updating...' : 'Creating...'}
			{:else}
				{isEdit ? 'Update User' : 'Create User'}
			{/if}
		</Button>
		<Button type="button" variant="outline" onclick={handleCancel} class="flex-1 md:flex-none">
			Cancel
		</Button>
	</div>
</form>