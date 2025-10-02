<script lang="ts">
	import UserPlus from 'phosphor-svelte/lib/UserPlus';
	import Check from 'phosphor-svelte/lib/Check';
	import X from 'phosphor-svelte/lib/X';
	import Clock from 'phosphor-svelte/lib/Clock';
	import Users from 'phosphor-svelte/lib/Users';
	import Stool from 'phosphor-svelte/lib/Stool';
    import Button from '$lib/components/ui/Button.svelte';
    import { enhance } from '$app/forms';

    let { data } = $props();

    // Get invitations from server-side load function
    let invitations = $state(data.invitations || []);

    // Format time ago
    function timeAgo(dateString: string) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }

    // Get role badge color
    function getRoleBadgeColor(role: string) {
        switch (role) {
            case 'owner':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'admin':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'member':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    }

    // Get permissions badge color
    function getPermissionsBadgeColor(permissions: string) {
        switch (permissions) {
            case 'admin':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'write':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'read':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    }
</script>

<svelte:head>
    <title>Vault Invitations - DuitGee</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="mb-8">
        <div class="flex items-center space-x-3 mb-2">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <UserPlus class="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 class="text-2xl font-bold text-foreground">Vault Invitations</h1>
        </div>
        <p class="text-muted-foreground">
            Manage your pending vault invitations. Accept or decline invitations to join shared vaults.
        </p>
    </div>

    <!-- Empty State -->
    {#if invitations.length === 0}
        <div class="text-center py-12">
            <div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus class="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 class="text-lg font-semibold text-foreground mb-2">No Pending Invitations</h3>
            <p class="text-muted-foreground mb-6">
                You don't have any pending vault invitations at the moment.
            </p>
            <Button href="/vaults" variant="outline">
                <Stool class="w-4 h-4 mr-2" />
                Browse Vaults
            </Button>
        </div>

    <!-- Invitations List -->
    {:else}
        <div class="space-y-4">
            {#each invitations as invitation (invitation.invitation.id)}
                <div class="bg-background border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div class="flex items-start justify-between">
                        <!-- Invitation Details -->
                        <div class="flex-1">
                            <div class="flex items-center space-x-3 mb-3">
                                <!-- Vault Icon -->
                                <div
                                    class="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-semibold"
                                    style="background-color: {invitation.vault.color}20; border: 1px solid {invitation.vault.color}; color: {invitation.vault.color}"
                                >
                                    {invitation.vault.icon || invitation.vault.name.charAt(0).toUpperCase()}
                                </div>

                                <!-- Vault Info -->
                                <div>
                                    <h3 class="font-semibold text-foreground text-lg">
                                        {invitation.vault.name}
                                    </h3>
                                    {#if invitation.vault.description}
                                        <p class="text-sm text-muted-foreground mt-1">
                                            {invitation.vault.description}
                                        </p>
                                    {/if}
                                </div>
                            </div>

                            <!-- Invitation Details -->
                            <div class="flex items-center space-x-4 mb-4">
                                <!-- Role Badge -->
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getRoleBadgeColor(invitation.invitation.role)}">
                                    {invitation.invitation.role}
                                </span>

                                <!-- Permissions Badge -->
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getPermissionsBadgeColor(invitation.invitation.permissions)}">
                                    {invitation.invitation.permissions} access
                                </span>

                                <!-- Time -->
                                <div class="flex items-center text-xs text-muted-foreground">
                                    <Clock class="w-3 h-3 mr-1" />
                                    Invited {timeAgo(invitation.invitation.invitedAt)}
                                </div>
                            </div>

                            <!-- Inviter Info -->
                            {#if invitation.inviter}
                                <div class="flex items-center text-sm text-muted-foreground">
                                    <Users class="w-4 h-4 mr-2" />
                                    <span>Invited by {invitation.inviter.name || invitation.inviter.email}</span>
                                </div>
                            {/if}
                        </div>

                        <!-- Actions -->
                        <div class="flex space-x-2 ml-6">
                            <!-- Accept Form -->
                            <form method="POST" action="?/accept" use:enhance>
                                <input type="hidden" name="invitationId" value={invitation.invitation.id} />
                                <Button
                                    type="submit"
                                    size="sm"
                                    class="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <Check class="w-4 h-4 mr-1" />
                                    Accept
                                </Button>
                            </form>

                            <!-- Decline Form -->
                            <form method="POST" action="?/decline" use:enhance>
                                <input type="hidden" name="invitationId" value={invitation.invitation.id} />
                                <Button
                                    type="submit"
                                    variant="outline"
                                    size="sm"
                                    class="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                    <X class="w-4 h-4 mr-1" />
                                    Decline
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
