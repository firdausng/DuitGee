import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types.js';

export const load: PageLoad = async ({ params }) => {
	// Redirect settings to edit page
	throw redirect(302, `/vaults/${params.vaultId}/edit`);
};