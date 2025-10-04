import type {CreateNotification} from "$lib/schemas/expense";

export async function createNotification(
    notificationData: CreateNotification,
    db: D1Database
): Promise<Notification> {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    // For now, return mock data
    // In real implementation, insert into database
    const notification: Notification = {
        id,
        ...notificationData,
        createdAt,
        readAt: null
    };

    console.log('Creating notification:', notification);

    // TODO: Insert into database
    // await db.prepare(`
    //     INSERT INTO notifications (id, userId, type, title, message, isRead, relatedId, relatedType, actionUrl, metadata, createdAt)
    //     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    // `).bind(
    //     id,
    //     notificationData.userId,
    //     notificationData.type,
    //     notificationData.title,
    //     notificationData.message,
    //     notificationData.isRead,
    //     notificationData.relatedId,
    //     notificationData.relatedType,
    //     notificationData.actionUrl,
    //     notificationData.metadata,
    //     createdAt
    // ).run();

    return notification;
}

/**
 * Get notifications for a user
 */
export async function getNotifications(
    userId: string,
    db: D1Database,
    options?: {
        limit?: number;
        offset?: number;
        unreadOnly?: boolean;
    }
): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;

    // Mock data for now
    const mockNotifications: Notification[] = [
        {
            id: '1',
            userId,
            type: 'vault_invitation',
            title: 'Vault Invitation',
            message: 'You have been invited to join "Family Budget" vault',
            isRead: false,
            relatedId: 'vault-123',
            relatedType: 'vault',
            actionUrl: '/vaults/vault-123',
            metadata: null,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            readAt: null
        },
        {
            id: '2',
            userId,
            type: 'expense_added',
            title: 'New Expense Added',
            message: 'John added an expense of $25.50 for "Lunch"',
            isRead: false,
            relatedId: 'expense-456',
            relatedType: 'expense',
            actionUrl: '/vaults/vault-123/expenses',
            metadata: JSON.stringify({ amount: 25.50, category: 'Food' }),
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
            readAt: null
        },
        {
            id: '3',
            userId,
            type: 'vault_member_joined',
            title: 'Member Joined',
            message: 'Sarah has joined the "Family Budget" vault',
            isRead: true,
            relatedId: 'vault-123',
            relatedType: 'vault',
            actionUrl: '/vaults/vault-123/members',
            metadata: null,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            readAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        }
    ];

    // Filter for unread if requested
    const filteredNotifications = options?.unreadOnly
        ? mockNotifications.filter(n => !n.isRead)
        : mockNotifications;

    // Apply pagination
    const paginatedNotifications = filteredNotifications.slice(offset, offset + limit);
    const unreadCount = mockNotifications.filter(n => !n.isRead).length;

    // TODO: Implement actual database queries
    // const query = options?.unreadOnly
    //     ? `SELECT * FROM notifications WHERE userId = ? AND isRead = false ORDER BY createdAt DESC LIMIT ? OFFSET ?`
    //     : `SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?`;

    // const countQuery = options?.unreadOnly
    //     ? `SELECT COUNT(*) as total FROM notifications WHERE userId = ? AND isRead = false`
    //     : `SELECT COUNT(*) as total FROM notifications WHERE userId = ?`;

    return {
        notifications: paginatedNotifications,
        total: filteredNotifications.length,
        unreadCount
    };
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
    notificationId: string,
    userId: string,
    db: D1Database
): Promise<boolean> {
    const readAt = new Date().toISOString();

    console.log(`Marking notification ${notificationId} as read for user ${userId}`);

    // TODO: Update in database
    // await db.prepare(`
    //     UPDATE notifications
    //     SET isRead = true, readAt = ?
    //     WHERE id = ? AND userId = ?
    // `).bind(readAt, notificationId, userId).run();

    return true;
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(
    userId: string,
    db: D1Database
): Promise<boolean> {
    const readAt = new Date().toISOString();

    console.log(`Marking all notifications as read for user ${userId}`);

    // TODO: Update in database
    // await db.prepare(`
    //     UPDATE notifications
    //     SET isRead = true, readAt = ?
    //     WHERE userId = ? AND isRead = false
    // `).bind(readAt, userId).run();

    return true;
}

/**
 * Delete a notification
 */
export async function deleteNotification(
    notificationId: string,
    userId: string,
    db: D1Database
): Promise<boolean> {
    console.log(`Deleting notification ${notificationId} for user ${userId}`);

    // TODO: Delete from database
    // await db.prepare(`
    //     DELETE FROM notifications
    //     WHERE id = ? AND userId = ?
    // `).bind(notificationId, userId).run();

    return true;
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(
    userId: string,
    db: D1Database
): Promise<number> {
    // TODO: Implement actual database query
    // const result = await db.prepare(`
    //     SELECT COUNT(*) as count FROM notifications
    //     WHERE userId = ? AND isRead = false
    // `).bind(userId).first();

    // return result?.count || 0;

    // Mock data for now
    return 2;
}