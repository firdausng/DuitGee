<script lang="ts">
    import { onMount } from 'svelte';
    import { DropdownMenu } from 'bits-ui';
	import Bell from 'phosphor-svelte/lib/Bell';
	import Check from 'phosphor-svelte/lib/Check';
	import X from 'phosphor-svelte/lib/X';
	import Eye from 'phosphor-svelte/lib/Eye';
	import UserPlus from 'phosphor-svelte/lib/UserPlus';
	import Receipt from 'phosphor-svelte/lib/Receipt';
	import Users from 'phosphor-svelte/lib/Users';
	import Gear from 'phosphor-svelte/lib/Gear';
	import Megaphone from 'phosphor-svelte/lib/Megaphone';
	import Clock from 'phosphor-svelte/lib/Clock';
    import Button from '$lib/components/ui/Button.svelte';
    import {authManager} from "$lib/stores/current-session.svelte";

    let notifications = $state([]);
    let unreadCount = $state(0);
    let loading = $state(false);
    let open = $state(false);

    // Fetch notifications when dropdown opens
    async function fetchNotifications() {
        try {
            const response = await fetch('/api/notifications?limit=10', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authManager.authState?.accessToken}`
                },
            });
            const result = await response.json();

            if (result.success) {
                notifications = result.data.notifications;
                unreadCount = result.data.unreadCount;
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
        }
    }

    // Mark notification as read
    async function markAsRead(notificationId: string) {
        try {
            const response = await fetch(`/api/notifications/${notificationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authManager.authState?.accessToken}`
                },
            });

            if (response.ok) {
                // Update local state
                notifications = notifications.map(n =>
                    n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
                );
                unreadCount = Math.max(0, unreadCount - 1);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    // Mark all as read
    async function markAllAsRead() {
        try {
            const response = await fetch('/api/notifications', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authManager.authState?.accessToken}`
                },
            });

            if (response.ok) {
                notifications = notifications.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }));
                unreadCount = 0;
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }

    // Delete notification
    async function deleteNotification(notificationId: string) {
        try {
            const response = await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authManager.authState?.accessToken}`
                },
            });

            if (response.ok) {
                const notification = notifications.find(n => n.id === notificationId);
                notifications = notifications.filter(n => n.id !== notificationId);

                if (notification && !notification.isRead) {
                    unreadCount = Math.max(0, unreadCount - 1);
                }
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }

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
                return 'text-blue-600 dark:text-blue-400';
            case 'expense_added':
                return 'text-green-600 dark:text-green-400';
            case 'vault_member_joined':
                return 'text-purple-600 dark:text-purple-400';
            case 'vault_member_left':
                return 'text-orange-600 dark:text-orange-400';
            case 'category_created':
                return 'text-indigo-600 dark:text-indigo-400';
            case 'system_announcement':
                return 'text-red-600 dark:text-red-400';
            default:
                return 'text-gray-600 dark:text-gray-400';
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
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }

    // Handle notification click
    function handleNotificationClick(notification: any) {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }

        if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
        }

        open = false;
    }

    // Fetch notifications when component mounts


    // Fetch notifications when dropdown opens
    $effect(() => {
        if (open) {
            fetchNotifications();
        }
    });
</script>

<DropdownMenu.Root bind:open>
    <DropdownMenu.Trigger
        class="relative inline-flex items-center justify-center p-2 rounded-md transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
    >
        <Bell class="w-4 h-4 text-muted-foreground" />
        {#if unreadCount > 0}
            <span class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
            </span>
        {/if}
    </DropdownMenu.Trigger>

    <DropdownMenu.Portal>
        <DropdownMenu.Content
            class="w-80 rounded-lg border border-border bg-background shadow-lg z-[9999]"
            sideOffset={8}
            align="end"
            avoidCollisions={true}
            collisionPadding={8}
        >
            <!-- Header -->
            <div class="px-4 py-3 border-b border-border">
                <div class="flex items-center justify-between">
                    <h3 class="text-sm font-semibold text-foreground">Notifications</h3>
                    {#if unreadCount > 0}
                        <Button
                            variant="ghost"
                            size="sm"
                            class="text-xs"
                            onclick={markAllAsRead}
                        >
                            Mark all read
                        </Button>
                    {/if}
                </div>
            </div>

            <!-- Notifications List -->
            <div class="max-h-96 overflow-y-auto">
                {#if loading}
                    <div class="flex items-center justify-center py-8">
                        <div class="text-sm text-muted-foreground">Loading...</div>
                    </div>
                {:else if notifications.length === 0}
                    <div class="flex flex-col items-center justify-center py-8 px-4">
                        <Bell class="w-8 h-8 text-muted-foreground mb-2" />
                        <p class="text-sm text-muted-foreground text-center">No notifications</p>
                    </div>
                {:else}
                    {#each notifications as notification (notification.id)}
                        <div class="group relative">
                            <!-- Notification Item -->
                            <button
                                onclick={() => handleNotificationClick(notification)}
                                class="w-full px-4 py-3 text-left transition-colors hover:bg-accent border-b border-border last:border-b-0 {!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}"
                            >
                                <div class="flex items-start space-x-3">
                                    <!-- Icon -->
                                    <div class="flex-shrink-0 mt-0.5">
                                        <div class="w-6 h-6 rounded-full flex items-center justify-center {!notification.isRead ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}">
                                            <svelte:component
                                                this={getNotificationIcon(notification.type)}
                                                class="w-3 h-3 {getNotificationIconColor(notification.type)}"
                                            />
                                        </div>
                                    </div>

                                    <!-- Content -->
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center space-x-2">
                                            <p class="text-sm font-medium text-foreground truncate">
                                                {notification.title}
                                            </p>
                                            {#if !notification.isRead}
                                                <div class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                            {/if}
                                        </div>
                                        <p class="text-sm text-muted-foreground mt-1 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <div class="flex items-center space-x-1 mt-2">
                                            <Clock class="w-3 h-3 text-muted-foreground" />
                                            <span class="text-xs text-muted-foreground">
                                                {timeAgo(notification.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </button>

                            <!-- Action Buttons -->
                            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div class="flex items-center space-x-1">
                                    {#if !notification.isRead}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            class="w-6 h-6 p-0"
                                            onclick={(e) => {
                                                e.stopPropagation();
                                                markAsRead(notification.id);
                                            }}
                                            title="Mark as read"
                                        >
                                            <Eye class="w-3 h-3" />
                                        </Button>
                                    {/if}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        class="w-6 h-6 p-0 text-red-600 hover:text-red-700"
                                        onclick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notification.id);
                                        }}
                                        title="Delete"
                                    >
                                        <X class="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>

            <!-- Footer -->
            {#if notifications.length > 0}
                <div class="px-4 py-3 border-t border-border">
                    <a
                        href="/notifications"
                        class="text-sm text-primary hover:text-primary/80 transition-colors"
                        onclick={() => open = false}
                    >
                        View all notifications
                    </a>
                </div>
            {/if}
        </DropdownMenu.Content>
    </DropdownMenu.Portal>
</DropdownMenu.Root>

<style>
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
</style>
