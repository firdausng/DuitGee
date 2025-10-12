<script lang="ts">
    import Button from '$lib/components/ui/Button.svelte';

    let {data} = $props();

    let {basePath, vaults, vaultMembers, expenses, expenseTemplates, userList, authUsers, sessions, accounts, verifications, matchedUsers} = data;

    let showPreviewModal = $state(false);
    let previewScript = $state('');

    function formatDate(date: string | number | null): string {
        if (!date) return 'N/A';
        // Handle both ISO strings and timestamps
        const dateObj = typeof date === 'number' ? new Date(date) : new Date(date);
        return dateObj.toLocaleString();
    }

    function formatCurrency(amount: number | null): string {
        if (amount === null) return 'N/A';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MYR' }).format(amount);
    }

    function generateScript(): string {
        let script = `-- User ID Migration Script
-- This script updates all user ID references in the app database
-- from app user IDs to auth user IDs based on email matching
-- Generated: ${new Date().toISOString()}
-- Matched users: ${matchedUsers.matched.length}

BEGIN TRANSACTION;

`;

        // Generate UPDATE statements for each matched user
        matchedUsers.matched.forEach((match) => {
            const appUserId = match.appUser.id;
            const authUserId = match.authUser?.id;
            const email = match.appUser.email;

            script += `-- Update for user: ${email}\n`;
            script += `-- App DB ID: ${appUserId} -> Auth DB ID: ${authUserId}\n\n`;

            // Update vaults table
            script += `-- Update vaults table\n`;
            script += `UPDATE vaults SET owner_id = '${authUserId}' WHERE owner_id = '${appUserId}';\n`;
            script += `UPDATE vaults SET created_by = '${authUserId}' WHERE created_by = '${appUserId}';\n`;
            script += `UPDATE vaults SET updated_by = '${authUserId}' WHERE updated_by = '${appUserId}';\n`;
            script += `UPDATE vaults SET deleted_by = '${authUserId}' WHERE deleted_by = '${appUserId}';\n\n`;

            // Update vault_members table
            script += `-- Update vault_members table\n`;
            script += `UPDATE vault_members SET user_id = '${authUserId}' WHERE user_id = '${appUserId}';\n`;
            script += `UPDATE vault_members SET invited_by = '${authUserId}' WHERE invited_by = '${appUserId}';\n`;
            script += `UPDATE vault_members SET updated_by = '${authUserId}' WHERE updated_by = '${appUserId}';\n`;
            script += `UPDATE vault_members SET deleted_by = '${authUserId}' WHERE deleted_by = '${appUserId}';\n\n`;

            // Update expenses table
            script += `-- Update expenses table\n`;
            script += `UPDATE expenses SET user_id = '${authUserId}' WHERE user_id = '${appUserId}';\n`;
            script += `UPDATE expenses SET created_by = '${authUserId}' WHERE created_by = '${appUserId}';\n`;
            script += `UPDATE expenses SET updated_by = '${authUserId}' WHERE updated_by = '${appUserId}';\n`;
            script += `UPDATE expenses SET deleted_by = '${authUserId}' WHERE deleted_by = '${appUserId}';\n\n`;

            // Update expense_templates table
            script += `-- Update expense_templates table\n`;
            script += `UPDATE expense_templates SET user_id = '${authUserId}' WHERE user_id = '${appUserId}';\n`;
            script += `UPDATE expense_templates SET default_user_id = '${authUserId}' WHERE default_user_id = '${appUserId}';\n`;
            script += `UPDATE expense_templates SET created_by = '${authUserId}' WHERE created_by = '${appUserId}';\n`;
            script += `UPDATE expense_templates SET updated_by = '${authUserId}' WHERE updated_by = '${appUserId}';\n`;
            script += `UPDATE expense_templates SET deleted_by = '${authUserId}' WHERE deleted_by = '${appUserId}';\n\n`;

            script += `------------------------------------------------------------\n\n`;
        });

        script += `COMMIT;

-- End of migration script
-- Please review carefully before executing
-- Recommendation: Backup your database before running this script
`;

        return script;
    }

    function previewMigrationScript() {
        previewScript = generateScript();
        showPreviewModal = true;
    }

    function downloadMigrationScript() {
        const script = generateScript();
        const blob = new Blob([script], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user_id_migration_${new Date().toISOString().split('T')[0]}.sql`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function copyToClipboard() {
        navigator.clipboard.writeText(previewScript);
    }

    function closePreviewModal() {
        showPreviewModal = false;
    }
</script>

<svelte:head>
    <title>Migrate - DuitGee</title>
</svelte:head>

<div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b border-border bg-card">
        <div class="container mx-auto px-4 py-6">
            <h1 class="text-3xl font-bold text-foreground">Migration Dashboard</h1>
            <p class="text-muted-foreground mt-2">View all data for migration purposes</p>
        </div>
    </header>

    <!-- Content -->
    <main class="container mx-auto px-4 py-6 space-y-12">
        <!-- User Matching Summary -->
        <section>
            <div class="bg-card border border-border rounded-lg shadow-sm p-6">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h2 class="text-2xl font-bold text-foreground">User Matching Summary</h2>
                        <p class="text-muted-foreground mt-1">Comparison between App DB and Auth DB users based on email</p>
                    </div>
                    <div class="flex gap-3">
                        <Button
                            onclick={previewMigrationScript}
                            variant="outline"
                            class="flex items-center gap-2"
                            disabled={matchedUsers.matched.length === 0}
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Preview Script
                        </Button>
                        <Button
                            onclick={downloadMigrationScript}
                            class="flex items-center gap-2"
                            disabled={matchedUsers.matched.length === 0}
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download SQL
                        </Button>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div class="text-green-600 dark:text-green-400 text-sm font-medium mb-1">Matched Users</div>
                        <div class="text-3xl font-bold text-green-700 dark:text-green-300">{matchedUsers.stats.matchedCount}</div>
                        <div class="text-xs text-green-600 dark:text-green-500 mt-1">Users in both databases</div>
                    </div>

                    <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <div class="text-yellow-600 dark:text-yellow-400 text-sm font-medium mb-1">App DB Only</div>
                        <div class="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{matchedUsers.stats.appUsersOnlyCount}</div>
                        <div class="text-xs text-yellow-600 dark:text-yellow-500 mt-1">Missing in Auth DB</div>
                    </div>

                    <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div class="text-blue-600 dark:text-blue-400 text-sm font-medium mb-1">Auth DB Only</div>
                        <div class="text-3xl font-bold text-blue-700 dark:text-blue-300">{matchedUsers.stats.authUsersOnlyCount}</div>
                        <div class="text-xs text-blue-600 dark:text-blue-500 mt-1">Missing in App DB</div>
                    </div>
                </div>

                <!-- Matched Users Table -->
                {#if matchedUsers.matched.length > 0}
                <div class="mb-6">
                    <h3 class="text-lg font-semibold text-foreground mb-3">Matched Users ({matchedUsers.matched.length})</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-muted/50">
                                <tr>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">App DB ID</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Auth DB ID</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">App Name</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Auth Name</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-border">
                                {#each matchedUsers.matched as match}
                                    <tr class="hover:bg-muted/30">
                                        <td class="px-4 py-2 text-foreground">{match.appUser.email}</td>
                                        <td class="px-4 py-2 font-mono text-xs text-foreground/80">{match.appUser.id}</td>
                                        <td class="px-4 py-2 font-mono text-xs text-foreground/80">{match.authUser?.id}</td>
                                        <td class="px-4 py-2 text-foreground/90">{match.appUser.firstName} {match.appUser.lastName}</td>
                                        <td class="px-4 py-2 text-foreground/90">{match.authUser?.name || 'N/A'}</td>
                                        <td class="px-4 py-2">
                                            <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                                Matched
                                            </span>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/if}

                <!-- App DB Only Users -->
                {#if matchedUsers.appUsersOnly.length > 0}
                <div class="mb-6">
                    <h3 class="text-lg font-semibold text-foreground mb-3">Users in App DB Only ({matchedUsers.appUsersOnly.length})</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-muted/50">
                                <tr>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Created At</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-border">
                                {#each matchedUsers.appUsersOnly as match}
                                    <tr class="hover:bg-muted/30">
                                        <td class="px-4 py-2 text-foreground">{match.appUser.email}</td>
                                        <td class="px-4 py-2 font-mono text-xs text-foreground/80">{match.appUser.id}</td>
                                        <td class="px-4 py-2 text-foreground/90">{match.appUser.firstName} {match.appUser.lastName}</td>
                                        <td class="px-4 py-2 text-foreground/70 text-xs">{formatDate(match.appUser.createdAt)}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/if}

                <!-- Auth DB Only Users -->
                {#if matchedUsers.authUsersOnly.length > 0}
                <div>
                    <h3 class="text-lg font-semibold text-foreground mb-3">Users in Auth DB Only ({matchedUsers.authUsersOnly.length})</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-muted/50">
                                <tr>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Email Verified</th>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Created At</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-border">
                                {#each matchedUsers.authUsersOnly as match}
                                    <tr class="hover:bg-muted/30">
                                        <td class="px-4 py-2 text-foreground">{match.authUser.email}</td>
                                        <td class="px-4 py-2 font-mono text-xs text-foreground/80">{match.authUser.id}</td>
                                        <td class="px-4 py-2 text-foreground/90">{match.authUser.name}</td>
                                        <td class="px-4 py-2">
                                            {#if match.authUser.emailVerified}
                                                <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                                    Verified
                                                </span>
                                            {:else}
                                                <span class="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300">
                                                    Not Verified
                                                </span>
                                            {/if}
                                        </td>
                                        <td class="px-4 py-2 text-foreground/70 text-xs">{formatDate(match.authUser.createdAt)}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/if}
            </div>
        </section>

        <!-- App Database Section -->
        <section>
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-foreground">App Database</h2>
                <p class="text-muted-foreground">Main application data from the duitgee database</p>
            </div>
            <div class="space-y-8">
        <!-- Vaults Table -->
        <div class="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-border">
                <h2 class="text-xl font-semibold text-foreground">Vaults ({vaults?.length || 0})</h2>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-muted/50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Description</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Owner ID</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Icon</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Is Personal</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Created At</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Created By</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                        {#each vaults || [] as vault}
                            <tr class="hover:bg-muted/30">
                                <td class="px-4 py-3 text-sm font-mono text-foreground/90">{vault.id}</td>
                                <td class="px-4 py-3 text-sm font-medium text-foreground">{vault.name}</td>
                                <td class="px-4 py-3 text-sm text-foreground/80">{vault.description || 'N/A'}</td>
                                <td class="px-4 py-3 text-sm font-mono text-foreground/90">{vault.ownerId}</td>
                                <td class="px-4 py-3 text-sm">{vault.icon || 'N/A'}</td>
                                <td class="px-4 py-3 text-sm">
                                    {#if vault.isPersonal}
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">Personal</span>
                                    {:else}
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">Shared</span>
                                    {/if}
                                </td>
                                <td class="px-4 py-3 text-sm text-foreground/70">{formatDate(vault.createdAt)}</td>
                                <td class="px-4 py-3 text-sm font-mono text-foreground/70">{vault.createdBy}</td>
                            </tr>
                        {:else}
                            <tr>
                                <td colspan="8" class="px-4 py-8 text-center text-muted-foreground">No vaults found</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Vault Members Table -->
        <div class="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-border">
                <h2 class="text-xl font-semibold text-foreground">Vault Members ({vaultMembers?.length || 0})</h2>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-muted/50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Vault ID</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">User ID</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Role</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Permissions</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Invited By</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Invited At</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Joined At</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                        {#each vaultMembers || [] as member}
                            <tr class="hover:bg-muted/30">
                                <td class="px-4 py-3 text-sm font-mono text-foreground/90">{member.id}</td>
                                <td class="px-4 py-3 text-sm font-mono text-foreground/90">{member.vaultId}</td>
                                <td class="px-4 py-3 text-sm font-mono text-foreground/90">{member.userId}</td>
                                <td class="px-4 py-3 text-sm">
                                    <span class="px-2 py-1 rounded-full text-xs font-medium {
                                        member.role === 'owner' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                        member.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                    }">
                                        {member.role}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-sm text-foreground/80">{member.permissions}</td>
                                <td class="px-4 py-3 text-sm">
                                    <span class="px-2 py-1 rounded-full text-xs font-medium {
                                        member.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                        member.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                    }">
                                        {member.status}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-sm font-mono text-foreground/70">{member.invitedBy || 'N/A'}</td>
                                <td class="px-4 py-3 text-sm text-foreground/70">{formatDate(member.invitedAt)}</td>
                                <td class="px-4 py-3 text-sm text-foreground/70">{formatDate(member.joinedAt)}</td>
                            </tr>
                        {:else}
                            <tr>
                                <td colspan="9" class="px-4 py-8 text-center text-muted-foreground">No vault members found</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Expenses Table -->
        <div class="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-border">
                <h2 class="text-xl font-semibold text-foreground">Expenses ({expenses?.length || 0})</h2>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-muted/50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Vault ID</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Amount</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Note</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">User ID</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Payment Type</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Payment Provider</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Created By</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                        {#each expenses || [] as expense}
                            <tr class="hover:bg-muted/30">
                                <td class="px-4 py-3 text-sm font-mono text-foreground/90">{expense.id}</td>
                                <td class="px-4 py-3 text-sm font-mono text-foreground/90">{expense.vaultId}</td>
                                <td class="px-4 py-3 text-sm font-semibold text-foreground">{formatCurrency(expense.amount)}</td>
                                <td class="px-4 py-3 text-sm text-foreground/90">{expense.categoryName || 'N/A'}</td>
                                <td class="px-4 py-3 text-sm text-foreground/80 max-w-xs truncate">{expense.note || 'N/A'}</td>
                                <td class="px-4 py-3 text-sm font-mono text-foreground/90">{expense.userId || 'Vault'}</td>
                                <td class="px-4 py-3 text-sm text-foreground/80">{expense.paymentType || 'N/A'}</td>
                                <td class="px-4 py-3 text-sm text-foreground/80">{expense.paymentProvider || 'N/A'}</td>
                                <td class="px-4 py-3 text-sm text-foreground/70">{formatDate(expense.date)}</td>
                                <td class="px-4 py-3 text-sm font-mono text-foreground/70">{expense.createdBy}</td>
                            </tr>
                        {:else}
                            <tr>
                                <td colspan="10" class="px-4 py-8 text-center text-muted-foreground">No expenses found</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Expense Templates Table -->
        <div class="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-border">
                <h2 class="text-xl font-semibold text-foreground">Expense Templates ({expenseTemplates?.length || 0})</h2>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-muted/50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Vault ID</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Default Amount</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">User ID (Creator)</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Default User ID</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Usage Count</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Last Used</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                        {#each expenseTemplates || [] as template}
                            <tr class="hover:bg-muted/30">
                                <td class="px-4 py-3 text-sm font-mono text-foreground/90">{template.id}</td>
                                <td class="px-4 py-3 text-sm font-mono text-foreground/90">{template.vaultId}</td>
                                <td class="px-4 py-3 text-sm font-medium text-foreground">{template.name}</td>
                                <td class="px-4 py-3 text-sm text-foreground/90">{template.categoryName || 'N/A'}</td>
                                <td class="px-4 py-3 text-sm text-foreground/90">{template.defaultAmount ? formatCurrency(template.defaultAmount) : 'N/A'}</td>
                                <td class="px-4 py-3 text-sm font-mono text-foreground/90">{template.userId}</td>
                                <td class="px-4 py-3 text-sm font-mono text-foreground/90">{template.defaultUserId || 'Vault'}</td>
                                <td class="px-4 py-3 text-sm text-foreground/90">{template.usageCount || 0}</td>
                                <td class="px-4 py-3 text-sm text-foreground/70">{formatDate(template.lastUsedAt)}</td>
                            </tr>
                        {:else}
                            <tr>
                                <td colspan="9" class="px-4 py-8 text-center text-muted-foreground">No expense templates found</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Users (App DB) Table -->
        <div class="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-border">
                <h2 class="text-xl font-semibold text-foreground">Users ({userList?.length || 0})</h2>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-muted/50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">First Name</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Last Name</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Created At</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Updated At</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                        {#each userList || [] as user}
                            <tr class="hover:bg-muted/30">
                                <td class="px-4 py-3 text-sm font-mono text-foreground/90">{user.id}</td>
                                <td class="px-4 py-3 text-sm text-foreground">{user.email}</td>
                                <td class="px-4 py-3 text-sm text-foreground/90">{user.firstName || 'N/A'}</td>
                                <td class="px-4 py-3 text-sm text-foreground/90">{user.lastName || 'N/A'}</td>
                                <td class="px-4 py-3 text-sm text-foreground/90">{user.name || 'N/A'}</td>
                                <td class="px-4 py-3 text-sm text-foreground/70">{formatDate(user.createdAt)}</td>
                                <td class="px-4 py-3 text-sm text-foreground/70">{formatDate(user.updatedAt)}</td>
                            </tr>
                        {:else}
                            <tr>
                                <td colspan="7" class="px-4 py-8 text-center text-muted-foreground">No users found</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
            </div>
        </section>

        <!-- Auth Database Section -->
        <section>
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-foreground">Auth Database</h2>
                <p class="text-muted-foreground">Authentication data from the duitgee-auth database</p>
            </div>
            <div class="space-y-8">
        <!-- Auth Users Table -->
        <div class="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-border">
                <h2 class="text-xl font-semibold text-foreground">Users ({authUsers?.length || 0})</h2>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-muted/50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email Verified</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Image</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Role</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Banned</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Created At</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                        {#each authUsers || [] as user}
                            <tr class="hover:bg-muted/30">
                                <td class="px-4 py-3 text-sm font-mono text-foreground/90">{user.id}</td>
                                <td class="px-4 py-3 text-sm text-foreground">{user.name}</td>
                                <td class="px-4 py-3 text-sm text-foreground">{user.email}</td>
                                <td class="px-4 py-3 text-sm">
                                    {#if user.emailVerified}
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                            Verified
                                        </span>
                                    {:else}
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300">
                                            Not Verified
                                        </span>
                                    {/if}
                                </td>
                                <td class="px-4 py-3 text-sm">
                                    {#if user.image}
                                        <img src={user.image} alt="Profile" class="w-8 h-8 rounded-full" />
                                    {:else}
                                        <span class="text-foreground/50">N/A</span>
                                    {/if}
                                </td>
                                <td class="px-4 py-3 text-sm">
                                    <span class="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                        {user.role || 'user'}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-sm">
                                    {#if user.banned}
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                            Banned
                                        </span>
                                    {:else}
                                        <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                            Active
                                        </span>
                                    {/if}
                                </td>
                                <td class="px-4 py-3 text-sm text-foreground/70">{formatDate(user.createdAt)}</td>
                            </tr>
                        {:else}
                            <tr>
                                <td colspan="8" class="px-4 py-8 text-center text-muted-foreground">No auth users found</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Sessions Table -->
        <div class="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-border">
                <h2 class="text-xl font-semibold text-foreground">Sessions ({sessions?.length || 0})</h2>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-muted/50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">User ID</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Token</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">IP Address</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">User Agent</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Expires At</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Created At</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                        {#each sessions || [] as session}
                            <tr class="hover:bg-muted/30">
                                <td class="px-4 py-3 text-sm font-mono text-foreground/90">{session.id}</td>
                                <td class="px-4 py-3 text-sm font-mono text-foreground/90">{session.userId}</td>
                                <td class="px-4 py-3 text-sm font-mono text-foreground/70 max-w-xs truncate">{session.token}</td>
                                <td class="px-4 py-3 text-sm text-foreground/80">{session.ipAddress || 'N/A'}</td>
                                <td class="px-4 py-3 text-sm text-foreground/70 max-w-xs truncate">{session.userAgent || 'N/A'}</td>
                                <td class="px-4 py-3 text-sm text-foreground/70">{formatDate(session.expiresAt)}</td>
                                <td class="px-4 py-3 text-sm text-foreground/70">{formatDate(session.createdAt)}</td>
                            </tr>
                        {:else}
                            <tr>
                                <td colspan="7" class="px-4 py-8 text-center text-muted-foreground">No sessions found</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Accounts Table -->
        <div class="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-border">
                <h2 class="text-xl font-semibold text-foreground">Accounts ({accounts?.length || 0})</h2>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-muted/50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">User ID</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Provider ID</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Account ID</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Scope</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Access Token Expires</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Created At</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                        {#each accounts || [] as account}
                            <tr class="hover:bg-muted/30">
                                <td class="px-4 py-3 text-sm font-mono text-foreground/90">{account.id}</td>
                                <td class="px-4 py-3 text-sm font-mono text-foreground/90">{account.userId}</td>
                                <td class="px-4 py-3 text-sm">
                                    <span class="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                        {account.providerId}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-sm font-mono text-foreground/80">{account.accountId}</td>
                                <td class="px-4 py-3 text-sm text-foreground/70 max-w-xs truncate">{account.scope || 'N/A'}</td>
                                <td class="px-4 py-3 text-sm text-foreground/70">{formatDate(account.accessTokenExpiresAt)}</td>
                                <td class="px-4 py-3 text-sm text-foreground/70">{formatDate(account.createdAt)}</td>
                            </tr>
                        {:else}
                            <tr>
                                <td colspan="7" class="px-4 py-8 text-center text-muted-foreground">No accounts found</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Verifications Table -->
        <div class="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-border">
                <h2 class="text-xl font-semibold text-foreground">Verifications ({verifications?.length || 0})</h2>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-muted/50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Identifier</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Value</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Expires At</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Created At</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Updated At</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                        {#each verifications || [] as verification}
                            <tr class="hover:bg-muted/30">
                                <td class="px-4 py-3 text-sm font-mono text-foreground/90">{verification.id}</td>
                                <td class="px-4 py-3 text-sm text-foreground">{verification.identifier}</td>
                                <td class="px-4 py-3 text-sm font-mono text-foreground/70">{verification.value}</td>
                                <td class="px-4 py-3 text-sm text-foreground/70">{formatDate(verification.expiresAt)}</td>
                                <td class="px-4 py-3 text-sm text-foreground/70">{formatDate(verification.createdAt)}</td>
                                <td class="px-4 py-3 text-sm text-foreground/70">{formatDate(verification.updatedAt)}</td>
                            </tr>
                        {:else}
                            <tr>
                                <td colspan="6" class="px-4 py-8 text-center text-muted-foreground">No verifications found</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
            </div>
        </section>
    </main>

    <!-- Preview Modal -->
    {#if showPreviewModal}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        role="dialog"
        aria-modal="true"
        onclick={closePreviewModal}
        onkeydown={(e) => e.key === 'Escape' && closePreviewModal()}
    >
        <div
            class="bg-card border border-border rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
            role="document"
            onclick={(e) => e.stopPropagation()}
        >
            <!-- Modal Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-border">
                <div>
                    <h3 class="text-xl font-bold text-foreground">Migration Script Preview</h3>
                    <p class="text-sm text-muted-foreground mt-1">Review the SQL migration script before downloading</p>
                </div>
                <button
                    onclick={closePreviewModal}
                    class="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close modal"
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Modal Body -->
            <div class="flex-1 overflow-auto px-6 py-4">
                <pre class="bg-muted/30 border border-border rounded-lg p-4 text-sm font-mono overflow-x-auto">{previewScript}</pre>
            </div>

            <!-- Modal Footer -->
            <div class="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
                <div class="text-sm text-muted-foreground">
                    <span class="font-medium">{matchedUsers.matched.length}</span> users will be migrated
                </div>
                <div class="flex gap-3">
                    <Button
                        onclick={copyToClipboard}
                        variant="outline"
                        class="flex items-center gap-2"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy to Clipboard
                    </Button>
                    <Button
                        onclick={() => {
                            downloadMigrationScript();
                            closePreviewModal();
                        }}
                        class="flex items-center gap-2"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download SQL
                    </Button>
                </div>
            </div>
        </div>
    </div>
    {/if}
</div>
