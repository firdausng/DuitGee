import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getNotifications } from '$lib/server/api/notifications/handlers';

export const load: PageServerLoad = async ({ locals, platform, url }) => {
    if (!locals.currentUser) {
        throw error(401, 'Authentication required');
    }

    if (!platform?.env?.DB) {
        throw error(500, 'Database not available');
    }

    try {
        const searchParams = url.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 20;
        const offset = (page - 1) * limit;

        const result = await getNotifications(locals.currentUser.id, platform.env.DB, {
            limit,
            offset
        });

        return {
            notifications: result.notifications,
            total: result.total,
            unreadCount: result.unreadCount,
            currentPage: page,
            totalPages: Math.ceil(result.total / limit),
            limit
        };
    } catch (err) {
        console.error('Error loading notifications:', err);
        throw error(500, 'Failed to load notifications');
    }
};