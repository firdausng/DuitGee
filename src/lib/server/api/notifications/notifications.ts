import { Hono } from 'hono';
import * as v from "valibot";
import { vValidator } from "@hono/valibot-validator";
import {
    createNotification,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadNotificationCount
} from "$lib/server/api/notifications/handlers";
import { createNotificationSchema, updateNotificationSchema } from "$lib/server/api/notifications/schema";
import { describeRoute, resolver } from 'hono-openapi';

// Query parameters schema for GET notifications
const getNotificationsQuerySchema = v.object({
    limit: v.optional(v.pipe(v.string(), v.transform(Number), v.number(), v.minValue(1), v.maxValue(100)), '20'),
    offset: v.optional(v.pipe(v.string(), v.transform(Number), v.number(), v.minValue(0)), '0'),
    unreadOnly: v.optional(v.pipe(v.string(), v.transform(s => s === 'true')), 'false')
});

const NOTIFICATION_TAG = ['Notification'];
const commonNotificationConfig = {
    tags: NOTIFICATION_TAG,
};

export const notificationApi = new Hono<App.Api>()
    .get(
        '/',
        describeRoute({
            ...commonNotificationConfig,
            description: 'Get user\'s notifications',
            responses: {
                200: {
                    description: 'Successful response',
                    content: {
                        'application/json': { schema: resolver(v.object({
                            success: v.boolean(),
                            data: v.any()
                        })) },
                    },
                },
            },
        }),
        vValidator('query', getNotificationsQuerySchema),
        async (c) => {
        const userId = c.get('userEmail') as string;
        const query = c.req.valid('query');

        const limit = parseInt(query.limit as string);
        const offset = parseInt(query.offset as string);
        const unreadOnly = (query.unreadOnly as string) === 'true';

        try {
            const result = await getNotifications(userId, c.env.DB, {
                limit,
                offset,
                unreadOnly
            });

            return c.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return c.json({
                success: false,
                error: 'Failed to fetch notifications'
            }, 500);
        }
    })

    .put(
        '/',
        describeRoute({
            ...commonNotificationConfig,
            description: 'Mark all notifications as read',
            responses: {
                200: {
                    description: 'Successful response',
                    content: {
                        'application/json': { schema: resolver(v.object({
                            success: v.boolean(),
                            message: v.string()
                        })) },
                    },
                },
            },
        }),
        async (c) => {
        const userId = c.get('userEmail') as string;

        try {
            const success = await markAllNotificationsAsRead(userId, c.env.DB);

            if (!success) {
                return c.json({
                    success: false,
                    error: 'Failed to mark notifications as read'
                }, 500);
            }

            return c.json({
                success: true,
                message: 'All notifications marked as read'
            });
        } catch (error) {
            console.error('Error marking notifications as read:', error);
            return c.json({
                success: false,
                error: 'Failed to mark notifications as read'
            }, 500);
        }
    })

    .post(
        '/',
        describeRoute({
            ...commonNotificationConfig,
            description: 'Create a new notification (admin/system use)',
            responses: {
                201: {
                    description: 'Successful response',
                    content: {
                        'application/json': { schema: resolver(v.object({
                            success: v.boolean(),
                            data: v.any()
                        })) },
                    },
                },
            },
        }),
        vValidator('json', createNotificationSchema),
        async (c) => {
        const userId = c.get('userEmail') as string;
        const data = c.req.valid('json');

        try {
            const notification = await createNotification(data, c.env.DB);

            return c.json({
                success: true,
                data: notification
            }, 201);
        } catch (error) {
            console.error('Error creating notification:', error);
            return c.json({
                success: false,
                error: 'Failed to create notification'
            }, 500);
        }
    })

    .get(
        '/count',
        describeRoute({
            ...commonNotificationConfig,
            description: 'Get unread notification count',
            responses: {
                200: {
                    description: 'Successful response',
                    content: {
                        'application/json': { schema: resolver(v.object({
                            success: v.boolean(),
                            data: v.object({
                                unreadCount: v.number()
                            })
                        })) },
                    },
                },
            },
        }),
        async (c) => {
        const userId = c.get('userEmail') as string;

        try {
            const count = await getUnreadNotificationCount(userId, c.env.DB);

            return c.json({
                success: true,
                data: { unreadCount: count }
            });
        } catch (error) {
            console.error('Error getting notification count:', error);
            return c.json({
                success: false,
                error: 'Failed to get notification count'
            }, 500);
        }
    })

    .put(
        '/:id',
        describeRoute({
            ...commonNotificationConfig,
            description: 'Mark specific notification as read',
            responses: {
                200: {
                    description: 'Successful response',
                    content: {
                        'application/json': { schema: resolver(v.object({
                            success: v.boolean(),
                            message: v.string()
                        })) },
                    },
                },
                404: {
                    description: 'Notification not found',
                },
            },
        }),
        async (c) => {
        const userId = c.get('userEmail') as string;
        const notificationId = c.req.param('id');

        try {
            const success = await markNotificationAsRead(notificationId, userId, c.env.DB);

            if (!success) {
                return c.json({
                    success: false,
                    error: 'Notification not found'
                }, 404);
            }

            return c.json({
                success: true,
                message: 'Notification marked as read'
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return c.json({
                success: false,
                error: 'Failed to mark notification as read'
            }, 500);
        }
    })

    .delete(
        '/:id',
        describeRoute({
            ...commonNotificationConfig,
            description: 'Delete specific notification',
            responses: {
                200: {
                    description: 'Successful response',
                    content: {
                        'application/json': { schema: resolver(v.object({
                            success: v.boolean(),
                            message: v.string()
                        })) },
                    },
                },
                404: {
                    description: 'Notification not found',
                },
            },
        }),
        async (c) => {
        const userId = c.get('userEmail') as string;
        const notificationId = c.req.param('id');

        try {
            const success = await deleteNotification(notificationId, userId, c.env.DB);

            if (!success) {
                return c.json({
                    success: false,
                    error: 'Notification not found'
                }, 404);
            }

            return c.json({
                success: true,
                message: 'Notification deleted'
            });
        } catch (error) {
            console.error('Error deleting notification:', error);
            return c.json({
                success: false,
                error: 'Failed to delete notification'
            }, 500);
        }
    });
