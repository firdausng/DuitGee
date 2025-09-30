import * as v from "valibot";

// Notification types
export const notificationTypes = [
    'vault_invitation',
    'expense_added',
    'vault_member_joined',
    'vault_member_left',
    'category_created',
    'vault_created',
    'vault_updated',
    'system_announcement'
] as const;

export type NotificationType = typeof notificationTypes[number];

// Base notification schema
const notificationSchema = v.object({
    id: v.pipe(v.string()),
    userId: v.pipe(v.string()),
    type: v.pipe(v.string(), v.picklist(notificationTypes)),
    title: v.pipe(v.string(), v.minLength(1, 'Title is required')),
    message: v.pipe(v.string(), v.minLength(1, 'Message is required')),
    isRead: v.boolean(),
    relatedId: v.nullable(v.string()), // Related vault, expense, etc.
    relatedType: v.nullable(v.string()), // 'vault', 'expense', 'user', etc.
    actionUrl: v.nullable(v.string()), // URL to navigate to when clicked
    metadata: v.nullable(v.string()), // JSON string for additional data
    createdAt: v.pipe(v.string()),
    readAt: v.nullable(v.string()),
});

export const createNotificationSchema = v.omit(notificationSchema, ['id', 'createdAt', 'readAt']);
export const updateNotificationSchema = v.partial(
    v.pick(notificationSchema, ['isRead', 'readAt'])
);

export type Notification = v.InferOutput<typeof notificationSchema>;
export type CreateNotification = v.InferOutput<typeof createNotificationSchema>;
export type UpdateNotification = v.InferOutput<typeof updateNotificationSchema>;

// Helper function to create notification data
export function createNotificationData(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    options?: {
        relatedId?: string;
        relatedType?: string;
        actionUrl?: string;
        metadata?: Record<string, any>;
    }
): CreateNotification {
    return {
        userId,
        type,
        title,
        message,
        isRead: false,
        relatedId: options?.relatedId || null,
        relatedType: options?.relatedType || null,
        actionUrl: options?.actionUrl || null,
        metadata: options?.metadata ? JSON.stringify(options.metadata) : null
    };
}