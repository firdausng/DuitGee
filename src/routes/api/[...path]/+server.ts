import type { RequestHandler } from './$types';
import api from '$lib/server/api';

const handler: RequestHandler = ({ request, platform }) => {
	return api.fetch(request, platform?.env, platform?.ctx);
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;