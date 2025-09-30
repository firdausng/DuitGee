<script lang="ts">
    import Button from '$lib/components/ui/Button.svelte';
    import { UserPlus, Crown, Shield, User, Mailbox, Clock, Check, X, List } from 'phosphor-svelte';

    let { data } = $props();

    // Helper to get role display info
    function getRoleInfo(role: string) {
        switch (role) {
            case 'owner':
                return { icon: Crown, label: 'Owner', color: 'text-yellow-600 dark:text-yellow-400' };
            case 'admin':
                return { icon: Shield, label: 'Admin', color: 'text-blue-600 dark:text-blue-400' };
            case 'member':
                return { icon: User, label: 'Member', color: 'text-gray-600 dark:text-gray-400' };
            default:
                return { icon: User, label: 'Member', color: 'text-gray-600 dark:text-gray-400' };
        }
    }

    // Helper to get status info
    function getStatusInfo(status: string) {
        switch (status) {
            case 'active':
                return { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
            case 'pending':
                return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
            case 'declined':
                return { label: 'Declined', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
            default:
                return { label: 'Unknown', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' };
        }
    }

    // Helper to format date
    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Helper to get user display name
    function getDisplayName(member: any) {
        // console.log(member)
        // if (member.user.firstName && member.user.lastName) {
        //     return `${member.user.firstName} ${member.user.lastName}`;
        // }
        // if (member.user.firstName) return member.user.firstName;
        // if (member.user.lastName) return member.user.lastName;
        return member.user.email;
    }

    // Check if current user is owner or admin
    const canInvite = $derived(() => {
        const currentUserMember = data.members.find(m => m.user?.id === data.currentUserId);
        return currentUserMember && (currentUserMember.role === 'owner' || currentUserMember.role === 'admin');
    });
</script>

<svelte:head>
    <title>Members - {data.vault.name} - Duitgee</title>
</svelte:head>

<div class="min-h-screen bg-background">
    <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <!-- Page Header -->
        <div class="mb-8">
            <div class="md:flex md:items-center md:justify-between">
                <div class="min-w-0 flex-1">
                    <h1 class="text-2xl font-bold text-foreground sm:text-3xl">Vault Members</h1>
                    <p class="mt-1 text-muted-foreground">
                        Manage who has access to {data.vault.name}
                    </p>
                </div>
                {#if canInvite()}
                    <div class="mt-4 md:mt-0">
                        <a href={`/vaults/${data.vault.id}/members/invite`}>
                            <Button class="flex items-center space-x-2">
                                <UserPlus class="h-4 w-4" />
                                <span>Invite User</span>
                            </Button>
                        </a>
                    </div>
                {/if}
            </div>
        </div>

        <!-- Members List -->
        <div class="overflow-hidden rounded-lg bg-card shadow">
            <div class="px-6 py-4 border-b border-border">
                <h3 class="text-lg font-medium text-foreground">
                    Members ({data.members.length})
                </h3>
            </div>

            <div class="divide-y divide-border">
                {#each data.members as member}
                    <div class="px-6 py-4">
                        <div class="flex items-center justify-between">
                            <!-- User Info -->
                            <div class="flex items-center space-x-4">
                                <!-- Avatar -->
                                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                                    <span class="text-sm font-medium">
                                        {getDisplayName(member).substring(0, 2).toUpperCase()}
                                    </span>
                                </div>

                                <!-- Details -->
                                <div>
                                    <div class="flex items-center space-x-2">
                                        <p class="text-sm font-medium text-foreground">
                                            {getDisplayName(member)}
                                        </p>
                                        {#if member.user?.id === data.currentUserId}
                                            <span class="text-xs text-muted-foreground">(You)</span>
                                        {/if}
                                    </div>
                                    <div class="flex items-center space-x-1 text-xs text-muted-foreground">
                                        <Mailbox class="h-3 w-3" />
                                        <span>{member.email}</span>
                                    </div>
                                    <div class="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                                        <Clock class="h-3 w-3" />
                                        <span>Joined {formatDate(member.joinedAt)}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Role and Status -->
                            <div class="flex items-center space-x-4">
                                <!-- Role Badge -->
                                <div class="flex items-center space-x-1">
                                    {#if getRoleInfo(member.role).icon}
                                        <svelte:component this={getRoleInfo(member.role).icon}
                                            class="h-4 w-4 {getRoleInfo(member.role).color}"
                                        />
                                    {/if}
                                    <span class="text-sm font-medium {getRoleInfo(member.role).color}">
                                        {getRoleInfo(member.role).label}
                                    </span>
                                </div>

                                <!-- Status Badge -->
                                <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusInfo(member.status).color}">
                                    {getStatusInfo(member.status).label}
                                </span>

                                <!-- Actions -->
                                {#if canInvite() && member.userId !== data.currentUserId}
                                    <div class="relative">
                                        <Button variant="ghost" size="sm">
                                            <List class="h-4 w-4" />
                                        </Button>
                                        <!-- TODO: Add dropdown menu for member actions -->
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Empty State -->
        {#if data.members.length === 0}
            <div class="text-center py-12">
                <User class="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 class="mt-2 text-sm font-medium text-foreground">No members</h3>
                <p class="mt-1 text-sm text-muted-foreground">
                    Get started by inviting someone to this vault.
                </p>
                {#if canInvite()}
                    <div class="mt-6">
                        <a href={`/vaults/${data.vault.id}/members/invite`}>
                            <Button>
                                <UserPlus class="h-4 w-4 mr-2" />
                                Invite User
                            </Button>
                        </a>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>