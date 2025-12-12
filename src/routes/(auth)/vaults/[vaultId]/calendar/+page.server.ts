import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { vaultId } = params;

	// Fetch vault data for locale and currency
	let vault = null;
	try {
		const response = await fetch(`/api/getVault?vaultId=${vaultId}`);
		if (response.ok) {
			const result = await response.json();
			if (result.success && result.data) {
				vault = result.data.vaults;
			}
		}
	} catch (err) {
		console.error('Failed to fetch vault:', err);
	}

	return {
		vaultId,
		vault
	};
};
