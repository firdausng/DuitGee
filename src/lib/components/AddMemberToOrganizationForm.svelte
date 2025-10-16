<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Label from '$lib/components/ui/Label.svelte';
	import type {UserWithRole} from "better-auth/plugins";

	interface Props {
		users: UserWithRole[];
		currentMembers: any[];
		onSubmit: (data: { userId: string; role: string }) => Promise<void>;
		onCancel: () => void;
		isSubmitting?: boolean;
	}

	let {
		users,
		currentMembers = [],
		onSubmit,
		onCancel,
		isSubmitting = false
	}: Props = $props();

	let selectedUserId = $state('');
	let selectedRole = $state('member');
	let searchQuery = $state('');

	// Filter users who are not already members
	let availableUsers = $derived.by(() => {
		const memberUserIds = new Set(currentMembers.map(m => m.userId));
		const filtered = users.filter(u => !memberUserIds.has(u.id));

		if (!searchQuery.trim()) return filtered;

		const query = searchQuery.toLowerCase();
		return filtered.filter(u =>
			u.name?.toLowerCase().includes(query) ||
			u.email.toLowerCase().includes(query)
		);
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!selectedUserId) {
			alert('Please select a user');
			return;
		}

		await onSubmit({
			userId: selectedUserId,
			role: selectedRole
		});
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	<!-- Search Users -->
	<div class="space-y-2">
		<Label for="search-user">Search User</Label>
		<input
			id="search-user"
			type="text"
			bind:value={searchQuery}
			placeholder="Search by name or email..."
			disabled={isSubmitting}
			class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
		/>
	</div>

	<!-- User Selection -->
	<div class="space-y-2">
		<Label for="user-select">Select User <span class="text-destructive">*</span></Label>

		{#if availableUsers.length === 0}
			<div class="text-center py-8 bg-muted/20 rounded-lg">
				<p class="text-sm text-muted-foreground">
					{searchQuery ? 'No users found matching your search' : 'All users are already members'}
				</p>
			</div>
		{:else}
			<div class="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2">
				{#each availableUsers as user}
					<label
						class="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 {selectedUserId === user.id ? 'border border-primary bg-primary/5' : 'border border-transparent'}"
					>
						<input
							type="radio"
							name="user"
							value={user.id}
							bind:group={selectedUserId}
							disabled={isSubmitting}
							class="mt-1"
						/>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2">
								<p class="font-medium text-foreground truncate">{user.name || 'Unknown'}</p>
								{#if user.role === 'admin'}
									<span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
										Admin
									</span>
								{/if}
							</div>
							<p class="text-sm text-muted-foreground truncate">{user.email}</p>
							{#if user.emailVerified}
								<span class="inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
									Verified
								</span>
							{:else}
								<span class="inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
									Unverified
								</span>
							{/if}
						</div>
					</label>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Role Selection -->
	<div class="space-y-2">
		<Label for="role-select">Role <span class="text-destructive">*</span></Label>
		<select
			id="role-select"
			bind:value={selectedRole}
			disabled={isSubmitting}
			class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
		>
			<option value="member">Member</option>
			<option value="admin">Admin</option>
		</select>
		<p class="text-xs text-muted-foreground">
			Select the role for the new member in this organization
		</p>
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
			disabled={isSubmitting || !selectedUserId || availableUsers.length === 0}
		>
			{isSubmitting ? 'Adding...' : 'Add Member'}
		</Button>
	</div>
</form>
