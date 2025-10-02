<script lang="ts">
    import { onMount } from 'svelte';
	import UserPlus from 'phosphor-svelte/lib/UserPlus';
    import { authManager } from "$lib/stores/current-session.svelte";
    import { goto } from '$app/navigation';

    let invitationCount = $state(0);
    let loading = $state(false);

    // Fetch invitation count
    async function fetchInvitationCount() {
        try {
            loading = true;
            console.log('Fetching invitation count...');
            console.log('Access token:', authManager.authState?.accessToken ? 'Present' : 'Missing');

            const response = await fetch(`/api/vault-members/invitations/by-email?email=${authManager.authState?.user.email}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authManager.authState?.accessToken}`
                },
            });

            console.log('Response status:', response.status);
            const result = await response.json();
            console.log('Response data:', result);

            if (result.success) {
                invitationCount = result.data.length;
                console.log('Invitation count:', invitationCount);
            } else {
                console.error('API returned error:', result.error);
            }
        } catch (error) {
            console.error('Error fetching invitation count:', error);
        } finally {
            loading = false;
        }
    }

    // Handle click to go to invitations page
    function handleClick() {
        goto('/invitations');
    }

    // Fetch invitations on mount
    onMount(() => {
        fetchInvitationCount();

        // Refresh count every 5 minutes
        // const interval = setInterval(fetchInvitationCount, 5 * 60 * 1000);
        //
        // return () => clearInterval(interval);
    });
</script>

<!-- Only show if there are pending invitations -->
{#if invitationCount > 0}
    <button
        onclick={handleClick}
        class="relative inline-flex items-center justify-center p-2 rounded-md transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        title="You have {invitationCount} pending vault invitation{invitationCount === 1 ? '' : 's'}"
    >
        <UserPlus class="w-4 h-4 text-muted-foreground" />

        <!-- Badge showing count -->
        <span class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-medium text-white">
            {invitationCount > 9 ? '9+' : invitationCount}
        </span>
    </button>
{/if}
