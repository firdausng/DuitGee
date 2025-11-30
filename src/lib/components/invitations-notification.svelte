<script lang="ts">
	import { onMount } from 'svelte';
	import { ofetch } from 'ofetch';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';

	type Invitation = {
		id: string;
		vaultId: string;
		role: string | null;
		status: string;
		inviterId: string | null;
		inviteeId: string | null;
		vaultName: string;
		vaultIcon: string | null;
		vaultColor: string | null;
	};

	let invitations = $state<Invitation[]>([]);
	let showDropdown = $state(false);
	let isLoading = $state(true);
	let processingId = $state<string | null>(null);

	async function loadInvitations() {
		try {
			const response = await ofetch<{ success: boolean; data: Invitation[] }>(
				'/api/getPendingInvitations'
			);
			if (response.success) {
				invitations = response.data;
			}
		} catch (error) {
			console.error('Failed to fetch invitations:', error);
		} finally {
			isLoading = false;
		}
	}

	async function acceptInvitation(invitationId: string) {
		processingId = invitationId;
		try {
			const response = await ofetch('/api/acceptInvitation', {
				method: 'POST',
				body: { invitationId },
				headers: { 'Content-Type': 'application/json' }
			});

			if (response.success) {
				// Remove accepted invitation from list
				invitations = invitations.filter((inv) => inv.id !== invitationId);
				// Optionally reload to refresh vault list
				window.location.reload();
			}
		} catch (error) {
			console.error('Failed to accept invitation:', error);
			alert('Failed to accept invitation. Please try again.');
		} finally {
			processingId = null;
		}
	}

	function toggleDropdown() {
		showDropdown = !showDropdown;
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.invitation-dropdown')) {
			showDropdown = false;
		}
	}

	onMount(() => {
		loadInvitations();
		// Poll for new invitations every 30 seconds
		// const interval = setInterval(loadInvitations, 30000);
        //
		// document.addEventListener('click', handleClickOutside);
        //
		// return () => {
		// 	clearInterval(interval);
		// 	document.removeEventListener('click', handleClickOutside);
		// };
	});
</script>

<div class="invitation-dropdown relative">
	<button
		onclick={toggleDropdown}
		class="relative p-2 rounded-md hover:bg-accent transition-colors"
		aria-label="View invitations"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-5 w-5"
			viewBox="0 0 20 20"
			fill="currentColor"
		>
			<path
				d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"
			/>
		</svg>
		{#if invitations.length > 0}
			<span
				class="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold"
			>
				{invitations.length}
			</span>
		{/if}
	</button>

	{#if showDropdown}
		<div
			class="absolute right-0 mt-2 w-80 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
		>
			{#if isLoading}
				<div class="p-4 text-center text-sm text-muted-foreground">Loading...</div>
			{:else if invitations.length === 0}
				<div class="p-4 text-center text-sm text-muted-foreground">
					No pending invitations
				</div>
			{:else}
				<div class="p-2">
					<div class="px-3 py-2 text-sm font-semibold border-b">
						Pending Invitations ({invitations.length})
					</div>
					<div class="divide-y">
						{#each invitations as invitation (invitation.id)}
							<div class="p-3 hover:bg-accent/50 transition-colors">
								<div class="flex items-start gap-3">
									<div
										class="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
										style="background-color: {invitation.vaultColor}20;"
									>
										{invitation.vaultIcon || '🏦'}
									</div>
									<div class="flex-1 min-w-0">
										<p class="font-medium truncate">{invitation.vaultName}</p>
										<p class="text-xs text-muted-foreground">
											Role: {invitation.role || 'Member'}
										</p>
										<div class="flex gap-2 mt-2">
											<Button
												size="sm"
												onclick={() => acceptInvitation(invitation.id)}
												disabled={processingId === invitation.id}
												class="text-xs h-7"
											>
												{#if processingId === invitation.id}
													Accepting...
												{:else}
													Accept
												{/if}
											</Button>
											<!-- Could add reject button here -->
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
