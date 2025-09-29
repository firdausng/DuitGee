import type { PageServerLoad } from './$types';
import { getUsers } from '$lib/server/api/users/handlers';

export const load: PageServerLoad = async ({ url, platform, locals, cookies }) => {
	if (!platform) {
		throw new Error("No platform");
	}

	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '10');

	try {
		const result = await getUsers(platform.env.DB, {
			page,
			limit
		});

		return {
			users: result.users,
			pagination: result.pagination
		};
	} catch (error) {
		console.error('Failed to load users:', error);
		return {
			users: [],
			pagination: {
				page: 1,
				limit: 10,
				total: 0,
				pages: 0
			}
		};
	}
};