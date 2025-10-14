<script lang="ts">
    import {adminAuthClientBase} from "$lib/auth-client-base";
    import {onMount} from "svelte";
    import Button from '$lib/components/ui/Button.svelte';
    import Dialog from '$lib/components/ui/Dialog.svelte';
    import CreateOrganizationForm from '$lib/components/CreateOrganizationForm.svelte';
    import Users from 'phosphor-svelte/lib/Users';
    import Buildings from 'phosphor-svelte/lib/Buildings';
    import Spinner from 'phosphor-svelte/lib/CircleNotch';
    import Plus from 'phosphor-svelte/lib/Plus';
    import type {UserWithRole} from "better-auth/plugins";

    let {data} = $props()

    const userPageSize = $state(10);
    const userCurrentPage = $state(0);

    const adminClient = adminAuthClientBase({basePath: data.basePath});
    let userData= $state<{
        users: UserWithRole[];
        total: number;
        limit: number | undefined;
        offset: number | undefined;
    } | {
        users: never[];
        total: number;
    }>();
    let isLoadingUsers = $state(true);

    onMount(async () => {
        await fetchUsers();
    })

    async function fetchUsers() {
        try {
            const response = await adminClient.admin.listUsers({
                query: {
                    limit: userPageSize,
                    offset: (userCurrentPage - 1) * userPageSize
                },
            });
            if(response.data){
                userData = response.data;
            }
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            isLoadingUsers = false;
        }
    }


    const organizations = adminClient.useListOrganizations;


    // Organization creation state
    let showCreateOrgDialog = $state(false);
    let isSubmittingOrg = $state(false);

    function handleOpenCreateOrgDialog() {
        showCreateOrgDialog = true;
    }

    function handleCloseCreateOrgDialog() {
        showCreateOrgDialog = false;
        isSubmittingOrg = false;
    }

    async function handleCreateOrganization(payload: { name: string; slug: string; metadata?: Record<string, any> }) {
        isSubmittingOrg = true;
        try {
            const { data, error } = await adminClient.organization.create({
                name: payload.name, // required
                slug: payload.slug, // required
                // logo: "https://example.com/logo.png",
                metadata: payload.metadata,
                keepCurrentActiveOrganization: false,
            });

            if (error) {
                throw new Error(error.message || 'Failed to create organization');
            }

            handleCloseCreateOrgDialog();
            // Refresh organizations list
            $organizations.refetch();
        } catch (error) {
            console.error('Failed to create organization:', error);
            alert('Failed to create organization. Please try again.');
        } finally {
            isSubmittingOrg = false;
        }
    }


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
</script>

<svelte:head>
    <title>Admin - DuitGee</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
    <!-- Header -->
    <div class="mb-6">
        <h1 class="text-xl sm:text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p class="text-sm text-muted-foreground mt-1">Manage users and organizations</p>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div class="bg-gradient-to-r from-primary to-accent rounded-lg p-4 sm:p-6 text-primary-foreground shadow-lg">
            <div class="flex items-center gap-3">
                <Users class="w-8 h-8" />
                <div>
                    <p class="text-sm opacity-90">Total Users</p>
                    <p class="text-2xl sm:text-3xl font-bold">
                        {isLoadingUsers ? '...' : userData?.total || 0}
                    </p>
                </div>
            </div>
        </div>
        <div class="bg-gradient-to-r from-accent to-primary rounded-lg p-4 sm:p-6 text-primary-foreground shadow-lg">
            <div class="flex items-center gap-3">
                <Buildings class="w-8 h-8" />
                <div>
                    <p class="text-sm opacity-90">Organizations</p>
                    <p class="text-2xl sm:text-3xl font-bold">
                        {$organizations.isPending ? '...' : ($organizations.data?.length || 0)}
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Users Section -->
    <div class="bg-background border rounded-lg shadow-card mb-6">
        <div class="px-4 py-4 sm:px-6 border-b">
            <div class="flex items-center gap-2">
                <Users class="w-5 h-5 text-foreground" />
                <h2 class="text-lg font-semibold text-foreground">Users</h2>
            </div>
        </div>
        <div class="p-4 sm:p-6">
            {#if isLoadingUsers}
                <div class="flex items-center justify-center py-12">
                    <div class="flex items-center space-x-3 text-muted-foreground">
                        <Spinner class="w-6 h-6 animate-spin" />
                        <span class="text-sm font-medium">Loading users...</span>
                    </div>
                </div>
            {:else if !userData?.users || userData.users.length === 0}
                <div class="text-center py-8">
                    <Users class="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 class="mt-2 text-sm font-medium text-foreground">No users found</h3>
                    <p class="mt-1 text-sm text-muted-foreground">No users are registered yet.</p>
                </div>
            {:else}
                <div class="overflow-x-auto -mx-4 sm:-mx-6">
                    <div class="inline-block min-w-full align-middle">
                        <table class="min-w-full divide-y divide-border">
                            <thead>
                                <tr class="bg-muted/50">
                                    <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th scope="col" class="hidden sm:table-cell px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" class="hidden md:table-cell px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th scope="col" class="hidden md:table-cell px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Created At
                                    </th>
                                    <th scope="col" class="hidden lg:table-cell px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Email Verified
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-background divide-y divide-border">
                                {#each userData.users as user}
                                    <tr class="hover:bg-muted/30 transition-colors">
                                        <td class="px-3 py-4 whitespace-nowrap">
                                            <div class="flex flex-col">
                                                <div class="text-sm font-medium text-foreground">
                                                    {user.name || 'N/A'}
                                                </div>
                                                <div class="sm:hidden text-xs text-muted-foreground truncate max-w-[200px]">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td class="hidden sm:table-cell px-3 py-4 whitespace-nowrap">
                                            <div class="text-sm text-foreground">{user.email}</div>
                                        </td>
                                        <td class="hidden md:table-cell px-3 py-4 whitespace-nowrap">
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {
                                                user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                            }">
                                                {user.role || 'user'}
                                            </span>
                                        </td>
                                        <td class="hidden md:table-cell px-3 py-4 whitespace-nowrap">
                                            <div class="text-sm text-muted-foreground">
                                                {formatDate(user.createdAt)}
                                            </div>
                                        </td>
                                        <td class="hidden lg:table-cell px-3 py-4 whitespace-nowrap">
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {
                                                user.emailVerified ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            }">
                                                {user.emailVerified ? 'Verified' : 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Pagination Info -->
                {#if userData.total > userPageSize}
                    <div class="mt-4 flex items-center justify-between border-t pt-4">
                        <div class="text-sm text-muted-foreground">
                            Showing {((userCurrentPage - 1) * userPageSize) + 1} to {Math.min(userCurrentPage * userPageSize, userData.total)} of {userData.total} users
                        </div>
                        <div class="text-xs text-muted-foreground">
                            Page {userCurrentPage} of {Math.ceil(userData.total / userPageSize)}
                        </div>
                    </div>
                {/if}
            {/if}
        </div>
    </div>

    <!-- Organizations Section -->
    <div class="bg-background border rounded-lg shadow-card">
        <div class="px-4 py-4 sm:px-6 border-b">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <Buildings class="w-5 h-5 text-foreground" />
                    <h2 class="text-lg font-semibold text-foreground">Organizations</h2>
                </div>
                <Button onclick={handleOpenCreateOrgDialog} size="sm">
                    <Plus class="w-4 h-4 mr-2" />
                    <span class="hidden sm:inline">New Organization</span>
                    <span class="sm:hidden">New</span>
                </Button>
            </div>
        </div>
        <div class="p-4 sm:p-6">
            {#if $organizations.isPending}
                <div class="flex items-center justify-center py-12">
                    <div class="flex items-center space-x-3 text-muted-foreground">
                        <Spinner class="w-6 h-6 animate-spin" />
                        <span class="text-sm font-medium">Loading organizations...</span>
                    </div>
                </div>
            {:else if $organizations.error}
                <div class="text-center py-8">
                    <Buildings class="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 class="mt-2 text-sm font-medium text-foreground">Failed to load organizations</h3>
                    <p class="mt-1 text-sm text-muted-foreground">{$organizations.error.message || 'An error occurred'}</p>
                </div>
            {:else if !$organizations.data || $organizations.data.length === 0}
                <div class="text-center py-8">
                    <Buildings class="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 class="mt-2 text-sm font-medium text-foreground">No organizations found</h3>
                    <p class="mt-1 text-sm text-muted-foreground">No organizations have been created yet.</p>
                </div>
            {:else}
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {#each $organizations.data as org}
                        <div class="bg-background border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <a href={`/admin/organizations/${org.slug}`}>
                                <div class="flex items-start gap-3">
                                    <div class="flex-shrink-0">
                                        <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <Buildings class="w-6 h-6 text-primary" />
                                        </div>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <h3 class="font-medium text-foreground truncate">
                                            {org.name}
                                        </h3>
                                        {#if org.slug}
                                            <p class="text-xs text-muted-foreground truncate">
                                                {org.slug}
                                            </p>
                                        {/if}
                                        <p class="text-xs text-muted-foreground mt-2">
                                            Created: {formatDate(org.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </a>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div>

<!-- Create Organization Dialog -->
{#if showCreateOrgDialog}
    <Dialog
        title="Create New Organization"
        bind:open={showCreateOrgDialog}
        onClose={handleCloseCreateOrgDialog}
    >
        {#snippet children()}
            <CreateOrganizationForm
                onSubmit={handleCreateOrganization}
                onCancel={handleCloseCreateOrgDialog}
                isSubmitting={isSubmittingOrg}
            />
        {/snippet}
    </Dialog>
{/if}