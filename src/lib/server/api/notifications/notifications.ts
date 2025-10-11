import {Hono} from 'hono';
import * as v from "valibot";
import {vValidator} from "@hono/valibot-validator";
import {
    createNotification,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadNotificationCount
} from "$lib/server/api/notifications/handlers";
import {describeRoute, resolver} from 'hono-openapi';
import {createNotificationSchema} from "$lib/schemas/expense";

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
                        'application/json': {
                            schema: resolver(v.object({
                                success: v.boolean(),
                                data: v.any()
                            }))
                        },
                    },
                },
            },
        }),
        vValidator('query', getNotificationsQuerySchema),
        async (c) => {
            const session = c.get('currentSession');
            const query = c.req.valid('query');

            const limit = query.limit;
            const offset = query.offset;
            const unreadOnly = query.unreadOnly;

            try {
                const result = await getNotifications(session.user.id, c.env.DB, {
                    limit,
                    offset,
                    unreadOnly
                });

                return c.json({
                    success: true,
                    data: result
                });
            } catch (error) {
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
                        'application/json': {
                            schema: resolver(v.object({
                                success: v.boolean(),
                                message: v.string()
                            }))
                        },
                    },
                },
            },
        }),
        async (c) => {
            const session = c.get('currentSession');

            try {
                const success = await markAllNotificationsAsRead(session.user.id, c.env.DB);

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
                        'application/json': {
                            schema: resolver(v.object({
                                success: v.boolean(),
                                data: v.any()
                            }))
                        },
                    },
                },
            },
        }),
        vValidator('json', createNotificationSchema),
        async (c) => {
            const data = c.req.valid('json');

            try {
                const notification = await createNotification(data, c.env.DB);

                return c.json({
                    success: true,
                    data: notification
                }, 201);
            } catch (error) {
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
                        'application/json': {
                            schema: resolver(v.object({
                                success: v.boolean(),
                                data: v.object({
                                    unreadCount: v.number()
                                })
                            }))
                        },
                    },
                },
            },
        }),
        async (c) => {
            const session = c.get('currentSession');

            try {
                const count = await getUnreadNotificationCount(session.user.id, c.env.DB);

                return c.json({
                    success: true,
                    data: {unreadCount: count}
                });
            } catch (error) {
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
                        'application/json': {
                            schema: resolver(v.object({
                                success: v.boolean(),
                                message: v.string()
                            }))
                        },
                    },
                },
                404: {
                    description: 'Notification not found',
                },
            },
        }),
        async (c) => {
            const session = c.get('currentSession');
            const notificationId = c.req.param('id');

            try {
                const success = await markNotificationAsRead(notificationId, session.user.id, c.env.DB);

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
                        'application/json': {
                            schema: resolver(v.object({
                                success: v.boolean(),
                                message: v.string()
                            }))
                        },
                    },
                },
                404: {
                    description: 'Notification not found',
                },
            },
        }),
        async (c) => {
            const session = c.get('currentSession');
            const notificationId = c.req.param('id');

            try {
                const success = await deleteNotification(notificationId, session.user.id, c.env.DB);

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
                return c.json({
                    success: false,
                    error: 'Failed to delete notification'
                }, 500);
            }
        });
