<script lang="ts">
    import Button from '$lib/components/ui/Button.svelte';
    import { Bell, Check, X, Eye, UserPlus, Receipt, Users, Gear, Megaphone, Clock, CaretLeft, CaretRight } from 'phosphor-svelte';
    import { goto } from '$app/navigation';

    let { data } = $props();

    // Get notification icon based on type
    function getNotificationIcon(type: string) {
        switch (type) {
            case 'vault_invitation':
                return UserPlus;
            case 'expense_added':
                return Receipt;
            case 'vault_member_joined':
            case 'vault_member_left':
                return Users;
            case 'category_created':
                return Gear;
            case 'system_announcement':
                return Megaphone;
            default:
                return Bell;
        }
    }

    // Get notification icon color
    function getNotificationIconColor(type: string) {
        switch (type) {
            case 'vault_invitation':
                return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
            case 'expense_added':
                return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
            case 'vault_member_joined':
                return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30';
            case 'vault_member_left':
                return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
            case 'category_created':
                return 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30';
            case 'system_announcement':
                return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
            default:
                return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
        }
    }

    // Format time ago
    function timeAgo(dateString: string) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    }

    // Mark notification as read
    async function markAsRead(notificationId: string) {
        try {
            const response = await fetch(`/api/notifications/${notificationId}`, {
                method: 'PUT'
            });

            if (response.ok) {
                // Refresh the page to show updated state
                goto(window.location.pathname, { replaceState: true });
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    // Mark all as read
    async function markAllAsRead() {
        try {
            const response = await fetch('/api/notifications', {
                method: 'PUT'
            });

            if (response.ok) {
                goto(window.location.pathname, { replaceState: true });
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }

    // Delete notification
    async function deleteNotification(notificationId: string) {
        try {
            const response = await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                goto(window.location.pathname, { replaceState: true });
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }

    // Handle notification click
    function handleNotificationClick(notification: any) {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }

        if (notification.actionUrl) {
            setTimeout(() => {
                window.location.href = notification.actionUrl;
            }, 100);
        }
    }

    // Generate pagination URLs
    function getPageUrl(page: number) {
        const url = new URL(window.location);
        url.searchParams.set('page', page.toString());
        return url.toString();
    }
</script>

<svelte:head>
    <title>Notifications - Duitgee</title>
</svelte:head>

<div class="min-h-screen bg-background">
    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <!-- Page Header -->
        <div class="mb-8">
            <div class="md:flex md:items-center md:justify-between">
                <div class="min-w-0 flex-1">
                    <h1 class="text-2xl font-bold text-foreground sm:text-3xl">Notifications</h1>
                    <p class="mt-1 text-muted-foreground">
                        Stay updated with your vault activities and invitations
                        {#if data.unreadCount > 0}
                            • <span class="font-medium text-blue-600">{data.unreadCount} unread</span>
                        {/if}
                    </p>
                </div>
                {#if data.unreadCount > 0}
                    <div class="mt-4 md:mt-0">
                        <Button onclick={markAllAsRead} variant="outline">
                            <Check class="h-4 w-4 mr-2" />
                            Mark all read
                        </Button>
                    </div>
                {/if}
            </div>
        </div>

        <!-- Notifications List -->
        {#if data.notifications.length === 0}
            <!-- Empty State -->
            <div class="text-center py-12">
                <Bell class="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 class="mt-2 text-sm font-medium text-foreground">No notifications</h3>
                <p class="mt-1 text-sm text-muted-foreground">
                    You're all caught up! New notifications will appear here.
                </p>
            </div>
        {:else}
            <!-- Notifications -->
            <div class="space-y-4">
                {#each data.notifications as notification}
                    <div class="overflow-hidden rounded-lg bg-card shadow transition-shadow hover:shadow-md {!notification.isRead ? 'ring-2 ring-blue-500/20' : ''}">
                        <div class="p-6">
                            <div class="flex items-start space-x-4">
                                <!-- Icon -->
                                <div class="flex-shrink-0">
                                    <div class="w-10 h-10 rounded-full flex items-center justify-center {getNotificationIconColor(notification.type)}">
                                        <svelte:component
                                            this={getNotificationIcon(notification.type)}
                                            class="w-5 h-5"
                                        />
                                    </div>
                                </div>

                                <!-- Content -->
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center space-x-2">
                                            <h3 class="text-sm font-medium text-foreground">
                                                {notification.title}
                                            </h3>
                                            {#if !notification.isRead}
                                                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            {/if}
                                        </div>
                                        <div class="flex items-center space-x-2">
                                            <span class="text-xs text-muted-foreground">
                                                {timeAgo(notification.createdAt)}
                                            </span>
                                        </div>
                                    </div>

                                    <p class="mt-1 text-sm text-muted-foreground">
                                        {notification.message}
                                    </p>

                                    <!-- Actions -->
                                    <div class="mt-4 flex items-center space-x-3">
                                        {#if notification.actionUrl}
                                            <Button
                                                size="sm"
                                                onclick={() => handleNotificationClick(notification)}
                                            >
                                                View
                                            </Button>
                                        {/if}

                                        {#if !notification.isRead}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onclick={() => markAsRead(notification.id)}
                                            >
                                                <Eye class="w-4 h-4 mr-1" />
                                                Mark read
                                            </Button>
                                        {/if}

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onclick={() => deleteNotification(notification.id)}
                                            class="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <X class="w-4 h-4 mr-1" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>

            <!-- Pagination -->
            {#if data.totalPages > 1}
                <div class="mt-8 flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <span class="text-sm text-muted-foreground">
                            Showing {(data.currentPage - 1) * data.limit + 1} to {Math.min(data.currentPage * data.limit, data.total)} of {data.total} notifications
                        </span>
                    </div>

                    <div class="flex items-center space-x-2">
                        {#if data.currentPage > 1}
                            <a href={getPageUrl(data.currentPage - 1)}>
                                <Button variant="outline" size="sm">
                                    <CaretLeft class="w-4 h-4 mr-1" />
                                    Previous
                                </Button>
                            </a>
                        {/if}

                        <span class="text-sm text-muted-foreground">
                            Page {data.currentPage} of {data.totalPages}
                        </span>

                        {#if data.currentPage < data.totalPages}
                            <a href={getPageUrl(data.currentPage + 1)}>
                                <Button variant="outline" size="sm">
                                    Next
                                    <CaretRight class="w-4 h-4 ml-1" />
                                </Button>
                            </a>
                        {/if}
                    </div>
                </div>
            {/if}
        {/if}
    </div>
</div>