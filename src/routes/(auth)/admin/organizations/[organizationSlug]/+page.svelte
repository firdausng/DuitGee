<script lang="ts">
    import {adminAuthClientBase} from "$lib/auth-client-base";
    import {onMount} from "svelte";
    import { goto } from '$app/navigation';
    import Button from '$lib/components/ui/Button.svelte';
    import Buildings from 'phosphor-svelte/lib/Buildings';
    import Users from 'phosphor-svelte/lib/Users';
    import UserPlus from 'phosphor-svelte/lib/UserPlus';
    import UsersThree from 'phosphor-svelte/lib/UsersThree';
    import Spinner from 'phosphor-svelte/lib/CircleNotch';
    import ArrowLeft from 'phosphor-svelte/lib/ArrowLeft';
    import Crown from 'phosphor-svelte/lib/Crown';
    import EnvelopeSimple from 'phosphor-svelte/lib/EnvelopeSimple';

    let {data} = $props()

    const adminClient = adminAuthClientBase({basePath: data.basePath});

    let currentOrganization = $state<any>();
    let isLoading = $state(true);

    onMount(async () => {
        try {
            const { data:organization, error: organizationError } = await adminClient.organization.getFullOrganization({
                query: {
                    organizationSlug: data.organizationSlug,
                    membersLimit: 100,
                },
            });

            if (organizationError) {
                console.error("Failed to load organization:", organizationError);
            } else {
                currentOrganization = organization;
            }
        } catch (error) {
            console.error("Failed to load organization:", error);
        } finally {
            isLoading = false;
        }
    })

    function formatDate(dateString: string | Date | undefined): string {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-MY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function getRoleBadgeColor(role: string): string {
        switch (role) {
            case 'owner':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'admin':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    }
</script>

<svelte:head>
    <title>{currentOrganization?.name || 'Organization'} - Admin - DuitGee</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
    <!-- Back Button -->
    <div class="mb-4">
        <Button variant="ghost" size="sm" onclick={() => goto('/admin')}>
            <ArrowLeft class="w-4 h-4 mr-2" />
            Back to Admin
        </Button>
    </div>

    {#if isLoading}
        <div class="flex items-center justify-center py-12">
            <div class="flex items-center space-x-3 text-muted-foreground">
                <Spinner class="w-6 h-6 animate-spin" />
                <span class="text-sm font-medium">Loading organization...</span>
            </div>
        </div>
    {:else if !currentOrganization}
        <div class="text-center py-12">
            <Buildings class="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 class="mt-2 text-sm font-medium text-foreground">Organization not found</h3>
            <p class="mt-1 text-sm text-muted-foreground">The organization you're looking for doesn't exist.</p>
        </div>
    {:else}
        <!-- Header -->
        <div class="bg-background border rounded-lg shadow-card mb-6 p-6">
            <div class="flex items-start justify-between gap-4">
                <div class="flex items-start gap-4">
                    <div class="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        {#if currentOrganization.logo}
                            <img src={currentOrganization.logo} alt={currentOrganization.name} class="w-16 h-16 rounded-lg object-cover" />
                        {:else}
                            <Buildings class="w-8 h-8 text-primary" />
                        {/if}
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold text-foreground">{currentOrganization.name}</h1>
                        <p class="text-sm text-muted-foreground">@{currentOrganization.slug}</p>
                        <p class="text-xs text-muted-foreground mt-1">
                            Created: {formatDate(currentOrganization.createdAt)}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Metadata -->
            {#if currentOrganization.metadata && Object.keys(currentOrganization.metadata).length > 0}
                <div class="mt-6 pt-6 border-t">
                    <h3 class="text-sm font-medium text-foreground mb-3">Metadata</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {#each Object.entries(currentOrganization.metadata) as [key, value]}
                            <div class="bg-muted/50 rounded-lg p-3">
                                <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">{key}</p>
                                <p class="text-sm text-foreground mt-1">{JSON.stringify(value)}</p>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div class="bg-gradient-to-r from-primary to-accent rounded-lg p-4 text-primary-foreground shadow-lg">
                <div class="flex items-center gap-3">
                    <Users class="w-6 h-6" />
                    <div>
                        <p class="text-xs opacity-90">Members</p>
                        <p class="text-2xl font-bold">{currentOrganization.members?.length || 0}</p>
                    </div>
                </div>
            </div>
            <div class="bg-gradient-to-r from-accent to-primary rounded-lg p-4 text-primary-foreground shadow-lg">
                <div class="flex items-center gap-3">
                    <UsersThree class="w-6 h-6" />
                    <div>
                        <p class="text-xs opacity-90">Teams</p>
                        <p class="text-2xl font-bold">{currentOrganization.teams?.length || 0}</p>
                    </div>
                </div>
            </div>
            <div class="bg-gradient-to-r from-primary to-accent rounded-lg p-4 text-primary-foreground shadow-lg">
                <div class="flex items-center gap-3">
                    <UserPlus class="w-6 h-6" />
                    <div>
                        <p class="text-xs opacity-90">Invitations</p>
                        <p class="text-2xl font-bold">{currentOrganization.invitations?.length || 0}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Members Section -->
        <div class="bg-background border rounded-lg shadow-card mb-6">
            <div class="px-4 py-4 sm:px-6 border-b">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <Users class="w-5 h-5 text-foreground" />
                        <h2 class="text-lg font-semibold text-foreground">Members</h2>
                    </div>
                </div>
            </div>
            <div class="p-4 sm:p-6">
                {#if !currentOrganization.members || currentOrganization.members.length === 0}
                    <div class="text-center py-8">
                        <Users class="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 class="mt-2 text-sm font-medium text-foreground">No members</h3>
                        <p class="mt-1 text-sm text-muted-foreground">This organization has no members yet.</p>
                    </div>
                {:else}
                    <div class="space-y-3">
                        {#each currentOrganization.members as member}
                            <div class="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                                <div class="flex items-center gap-3">
                                    {#if member.user?.image}
                                        <img src={member.user.image} alt={member.user.name} class="w-10 h-10 rounded-full" />
                                    {:else}
                                        <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Users class="w-5 h-5 text-primary" />
                                        </div>
                                    {/if}
                                    <div>
                                        <div class="flex items-center gap-2">
                                            <p class="text-sm font-medium text-foreground">{member.user?.name || 'Unknown'}</p>
                                            {#if member.role === 'owner'}
                                                <Crown class="w-4 h-4 text-yellow-500" />
                                            {/if}
                                        </div>
                                        <div class="flex items-center gap-2 mt-0.5">
                                            <EnvelopeSimple class="w-3 h-3 text-muted-foreground" />
                                            <p class="text-xs text-muted-foreground">{member.user?.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getRoleBadgeColor(member.role)}">
                                        {member.role}
                                    </span>
                                    <p class="text-xs text-muted-foreground hidden sm:block">
                                        Joined: {formatDate(member.createdAt)}
                                    </p>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>

        <!-- Teams Section -->
        <div class="bg-background border rounded-lg shadow-card">
            <div class="px-4 py-4 sm:px-6 border-b">
                <div class="flex items-center gap-2">
                    <UsersThree class="w-5 h-5 text-foreground" />
                    <h2 class="text-lg font-semibold text-foreground">Teams</h2>
                </div>
            </div>
            <div class="p-4 sm:p-6">
                {#if !currentOrganization.teams || currentOrganization.teams.length === 0}
                    <div class="text-center py-8">
                        <UsersThree class="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 class="mt-2 text-sm font-medium text-foreground">No teams</h3>
                        <p class="mt-1 text-sm text-muted-foreground">This organization has no teams yet.</p>
                    </div>
                {:else}
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {#each currentOrganization.teams as team}
                            <div class="bg-background border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div class="flex items-start gap-3">
                                    <div class="flex-shrink-0">
                                        <div class="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                                            <UsersThree class="w-5 h-5 text-accent" />
                                        </div>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <h3 class="font-medium text-foreground truncate">{team.name}</h3>
                                        <p class="text-xs text-muted-foreground mt-1">
                                            Created: {formatDate(team.createdAt)}
                                        </p>
                                        {#if team.updatedAt && team.updatedAt !== team.createdAt}
                                            <p class="text-xs text-muted-foreground">
                                                Updated: {formatDate(team.updatedAt)}
                                            </p>
                                        {/if}
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>